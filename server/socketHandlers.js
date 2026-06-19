// ============================================================
// Спасение Ковчега — Socket.io Event Handlers
// ============================================================

const crypto = require('crypto');
const gs = require('./gameState');
const mh = require('./matchHistory');
const up = require('./userProfiles');
const { TASKS, addCustomTask, removeCustomTask } = require('./taskDatabase');

// ── Session Resiliency ───────────────────────────────────
// Сессии переподключения: Map<sessionToken, {...}>. Память сервера (сброс при
// рестарте). При disconnect игрок не удаляется сразу — действует grace-период.
const sessions = new Map();
const GRACE_MS = 45 * 1000;

// Запросы на вступление в команду: Map<roomId, Array<{fromUserId, fromName, teamName}>>
const joinRequests = new Map();

const sessionBySocket = (sid) => {
  for (const s of sessions.values()) if (s.socketId === sid) return s;
  return null;
};

// Пароль учителя. Задаётся через переменную окружения ADMIN_PASSWORD,
// иначе используется значение по умолчанию (ОБЯЗАТЕЛЬНО смените на проде!).
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'aegis-teacher';

// Зарегистрированные учителя: Map<username(lowercase), password>.
// Хранятся в памяти сервера (БД нет), сбрасываются при перезапуске.
const teachers = new Map();

const SUPERUSER = 'admin'; // резервный логин, работает под ADMIN_PASSWORD
const normUser = (u) => (u || '').toString().trim().toLowerCase();

function registerHandlers(io, socket) {
  const log = (msg) => console.log(`[${new Date().toISOString()}] [${socket.id.slice(0, 8)}] ${msg}`);

  // Проверка прав учителя — socket.data.isAdmin ставится только после успешного
  // admin_auth (т.е. после валидации по коллекции teachers / суперпользователю)
  const requireAdmin = () => {
    if (!socket.data.isAdmin) {
      socket.emit('error', { message_ru: 'Требуется авторизация учителя', code: 'NOT_AUTHORIZED' });
      return false;
    }
    return true;
  };

  // Отметка активности комнаты — питает Room Reaper (см. gameState reaper).
  const touch = (room) => { if (room) room.lastActivityAt = Date.now(); };

  // Создать/обновить сессию текущего сокета и отдать токен клиенту.
  const ensureSession = (patch = {}) => {
    let token = socket.data.sessionToken;
    let session = token ? sessions.get(token) : null;
    if (!session) {
      token = crypto.randomUUID();
      session = {
        roomId: null, playerName: null, teamName: null,
        isCaptain: false, isAdmin: false, username: null,
        userId: null,
        socketId: socket.id, offline: false, timeoutId: null,
      };
      sessions.set(token, session);
      socket.data.sessionToken = token;
    }
    Object.assign(session, patch, { socketId: socket.id });
    socket.emit('session', { sessionToken: token });
    return session;
  };

  const updateSessionTeam = (teamName, isCaptain) => {
    const s = socket.data.sessionToken ? sessions.get(socket.data.sessionToken) : null;
    if (s) { s.teamName = teamName; s.isCaptain = isCaptain; }
  };

  // Окончательное удаление по истечении grace-периода.
  const finalizeSession = (token) => {
    const session = sessions.get(token);
    if (!session) return;
    sessions.delete(token);
    const room = gs.removePlayer(session.socketId);  // передаёт капитанство, чистит пустые команды
    if (room) {
      touch(room);
      io.to(room.roomId).emit('room_state', gs.getPublicRoomState(room));
    }
  };

  // Жёсткая проверка членства: сокет реально присоединён к комнате (transport-уровень)
  // И состоит в команде этой комнаты. Возвращает контекст либо null (с emit ошибки).
  const requireMembership = () => {
    const roomId = socket.data.roomId;
    if (!roomId || !socket.rooms.has(roomId)) {
      socket.emit('error', { message_ru: 'Вы не в комнате', code: 'NOT_IN_ROOM' });
      return null;
    }
    const room = gs.getRoom(roomId);
    if (!room) {
      socket.emit('error', { message_ru: 'Комната не найдена', code: 'ROOM_NOT_FOUND' });
      return null;
    }
    const info = gs.getPlayerTeam(room, socket.id);
    if (!info) {
      socket.emit('error', { message_ru: 'Вы не состоите в команде этой комнаты', code: 'NOT_IN_TEAM' });
      return null;
    }
    return { room, roomId, team: info.team, player: info.player };
  };

  // ── ADMIN AUTH (вход учителя по логину/паролю) ───────────
  // Проверка идёт по коллекции зарегистрированных учителей (teachers)
  // + резервному суперпользователю (SUPERUSER / ADMIN_PASSWORD).
  socket.on('admin_auth', ({ username, password } = {}) => {
    const key = normUser(username);
    if (!key || !password) {
      return socket.emit('admin_auth_result', { ok: false, message_ru: 'Укажите логин и пароль' });
    }

    const isSuperuser = key === SUPERUSER && password === ADMIN_PASSWORD;
    const isTeacher   = teachers.has(key) && teachers.get(key) === password;

    if (!isSuperuser && !isTeacher) {
      log(`Неудачный вход учителя: "${key}"`);
      return socket.emit('admin_auth_result', { ok: false, message_ru: 'Неверный логин или пароль' });
    }

    socket.data.isAdmin  = true;
    socket.data.username = key;
    ensureSession({ isAdmin: true, username: key });
    log(`Учитель авторизован: "${key}"`);
    socket.emit('admin_auth_result', { ok: true });
  });

  // ── TEACHER REGISTER (динамическая регистрация учителей) ──
  socket.on('teacher_register', ({ username, password } = {}) => {
    const key = normUser(username);
    if (!key || !password?.trim()) {
      return socket.emit('teacher_register_result', { ok: false, message_ru: 'Укажите логин и пароль' });
    }
    if (key.length < 3) {
      return socket.emit('teacher_register_result', { ok: false, message_ru: 'Логин должен быть не короче 3 символов' });
    }
    if (key === SUPERUSER || teachers.has(key)) {
      return socket.emit('teacher_register_result', { ok: false, message_ru: 'Пользователь с таким логином уже существует' });
    }

    teachers.set(key, password);
    log(`Зарегистрирован учитель: "${key}" (всего: ${teachers.size})`);
    socket.emit('teacher_register_result', { ok: true, message_ru: 'Регистрация успешна, теперь вы можете войти' });
  });

  // ── CREATE ROOM (Admin/Teacher) ──────────────────────────
  socket.on('create_room', ({
    adminName,
    gameDurationMinutes = 45,
    maxTeams            = 4,
    totalTasksCount     = 50,
    difficultyPreset    = 'balanced',
  } = {}) => {
    if (!requireAdmin()) return;
    if (!adminName?.trim()) {
      return socket.emit('error', { message_ru: 'Укажите имя администратора', code: 'MISSING_NAME' });
    }
    const room = gs.createRoom(socket.id, adminName.trim(), {
      gameDurationMinutes,
      maxTeams,
      totalTasksCount,
      difficultyPreset,
    });
    socket.join(room.roomId);
    touch(room);
    log(`Создана комната ${room.roomId} администратором "${adminName}"`);
    socket.emit('room_created', { roomId: room.roomId });
    socket.emit('room_state', gs.getPublicRoomState(room));
  });

  // ── JOIN ROOM ────────────────────────────────────────────
  socket.on('join_room', ({ roomId, playerName, userId } = {}) => {
    if (!roomId?.trim() || !playerName?.trim()) {
      return socket.emit('error', { message_ru: 'Укажите код комнаты и имя', code: 'MISSING_FIELDS' });
    }
    const result = gs.joinRoom(roomId.toUpperCase().trim(), socket.id, playerName.trim());
    if (result.error) {
      return socket.emit('error', { message_ru: result.error, code: 'JOIN_ERROR' });
    }
    socket.join(roomId.toUpperCase().trim());
    socket.data.playerName = playerName.trim();
    socket.data.roomId = roomId.toUpperCase().trim();
    socket.data.userId = userId || null;
    if (socket.data.userId) up.ensureUser(socket.data.userId, socket.data.playerName);  // профиль игрока
    ensureSession({ roomId: socket.data.roomId, playerName: socket.data.playerName, isAdmin: !!socket.data.isAdmin, userId: socket.data.userId });
    touch(result.room);
    log(`"${playerName}" вошёл в комнату ${roomId}`);
    socket.emit('joined_room', { roomId: roomId.toUpperCase().trim() });
    io.to(roomId.toUpperCase().trim()).emit('room_state', gs.getPublicRoomState(result.room));
  });

  // ── JOIN EXISTING TEAM (lobby) ───────────────────────────
  socket.on('select_team', ({ teamName } = {}) => {
    const roomId = socket.data.roomId;
    if (!roomId) return socket.emit('error', { message_ru: 'Вы не в комнате', code: 'NOT_IN_ROOM' });
    const room = gs.getRoom(roomId);
    if (!room) return socket.emit('error', { message_ru: 'Комната не найдена', code: 'ROOM_NOT_FOUND' });
    if (room.phase !== 'lobby') return socket.emit('error', { message_ru: 'Сменить команду можно только в лобби', code: 'NOT_LOBBY' });

    const result = gs.selectTeam(room, socket.id, socket.data.playerName, teamName, socket.data.userId);
    if (result.error) return socket.emit('error', { message_ru: result.error, code: 'TEAM_ERROR' });

    touch(room);
    updateSessionTeam(result.player.teamName, result.player.isCaptain);
    log(`"${socket.data.playerName}" вошёл в команду "${teamName}" (капитан: ${result.player.isCaptain})`);
    io.to(roomId).emit('room_state', gs.getPublicRoomState(room));
  });

  // ── CREATE CUSTOM TEAM (lobby) ───────────────────────────
  socket.on('create_team', ({ teamName } = {}) => {
    const roomId = socket.data.roomId;
    if (!roomId) return socket.emit('error', { message_ru: 'Вы не в комнате', code: 'NOT_IN_ROOM' });
    const room = gs.getRoom(roomId);
    if (!room) return socket.emit('error', { message_ru: 'Комната не найдена', code: 'ROOM_NOT_FOUND' });
    if (room.phase !== 'lobby') return socket.emit('error', { message_ru: 'Создавать команды можно только в лобби', code: 'NOT_LOBBY' });

    const result = gs.createTeam(room, socket.id, socket.data.playerName, teamName, socket.data.userId);
    if (result.error) return socket.emit('error', { message_ru: result.error, code: 'TEAM_ERROR' });

    touch(room);
    updateSessionTeam(result.team.teamName, true);
    log(`"${socket.data.playerName}" создал команду "${result.team.teamName}"`);
    io.to(roomId).emit('room_state', gs.getPublicRoomState(room));
  });

  // ── KICK MEMBER (captain only, lobby) ────────────────────
  socket.on('kick_member', ({ targetId } = {}) => {
    const roomId = socket.data.roomId;
    const room = gs.getRoom(roomId);
    if (!room) return socket.emit('error', { message_ru: 'Комната не найдена', code: 'ROOM_NOT_FOUND' });
    if (room.phase !== 'lobby') return socket.emit('error', { message_ru: 'Исключать игроков можно только в лобби', code: 'NOT_LOBBY' });

    const result = gs.kickMember(room, socket.id, targetId);
    if (result.error) return socket.emit('error', { message_ru: result.error, code: 'KICK_ERROR' });

    touch(room);
    const ks = sessionBySocket(result.kickedId);
    if (ks) { ks.teamName = null; ks.isCaptain = false; }
    log(`Капитан исключил "${result.kickedName}" из "${result.teamName}"`);
    io.to(result.kickedId).emit('error', { message_ru: `Вас исключили из команды «${result.teamName}»`, code: 'KICKED' });
    io.to(roomId).emit('room_state', gs.getPublicRoomState(room));
  });

  // ── DELETE TEAM (teacher only, lobby) ────────────────────
  socket.on('delete_team', ({ teamName } = {}) => {
    const roomId = socket.data.roomId;
    const room = gs.getRoom(roomId);
    if (!room) return socket.emit('error', { message_ru: 'Комната не найдена', code: 'ROOM_NOT_FOUND' });
    if (room.phase !== 'lobby') return socket.emit('error', { message_ru: 'Удалять команды можно только в лобби', code: 'NOT_LOBBY' });

    const result = gs.deleteTeam(room, socket.id, teamName);
    if (result.error) return socket.emit('error', { message_ru: result.error, code: 'DELETE_ERROR' });

    touch(room);
    log(`Учитель удалил команду "${result.teamName}"`);
    for (const id of result.memberIds) {
      const ms = sessionBySocket(id);
      if (ms) { ms.teamName = null; ms.isCaptain = false; }
      io.to(id).emit('error', { message_ru: `Команда «${result.teamName}» удалена учителем`, code: 'TEAM_DELETED' });
    }
    io.to(roomId).emit('room_state', gs.getPublicRoomState(room));
  });

  // ── START GAME (Admin only) ──────────────────────────────
  socket.on('start_game', ({ durationMinutes } = {}) => {
    const roomId = socket.data.roomId;
    const room = gs.getRoom(roomId);
    if (!room) return socket.emit('error', { message_ru: 'Комната не найдена', code: 'ROOM_NOT_FOUND' });
    if (room.adminId !== socket.id) return socket.emit('error', { message_ru: 'Только администратор может начать игру', code: 'NOT_ADMIN' });
    if (room.phase !== 'lobby') return socket.emit('error', { message_ru: 'Игра уже запущена', code: 'ALREADY_STARTED' });

    // Учитель может выбрать длительность прямо в лобби (мин). Без значения —
    // остаётся длительность, заданная при создании комнаты.
    if (durationMinutes != null) {
      const mins = Math.max(5, Math.min(120, parseInt(durationMinutes) || 45));
      room.gameDuration = mins * 60;
    }

    room.phase = 'playing';
    // Точный таймер на таймстампе: без ежесекундного декремента/рассылки.
    room.endTimestamp = Date.now() + room.gameDuration * 1000;
    mh.startMatch(room);   // фиксируем старт матча + снимок состава
    touch(room);
    log(`Игра ${roomId} НАЧАТА (до ${new Date(room.endTimestamp).toISOString()})`);
    io.to(roomId).emit('game_started', {
      message_ru:   '⚡ Aegis-X активирован. Начните взлом!',
      endTimestamp: room.endTimestamp,
    });
    io.to(roomId).emit('room_state', gs.getPublicRoomState(room));

    // Серверный интервал только СВЕРЯЕТ время для триггера завершения.
    room.timerInterval = setInterval(() => {
      if (Date.now() < room.endTimestamp) return;

      clearInterval(room.timerInterval);
      room.timerInterval = null;
      room.phase = 'ended';
      touch(room);
      const scores = buildFinalScores(room);
      mh.finishMatch(room, scores);
      log(`Игра ${roomId} ЗАВЕРШЕНА — время вышло`);
      io.to(roomId).emit('game_ended', { reason: 'timeout', message_ru: '⏰ Время вышло! Игра завершена.', scores });
      io.to(roomId).emit('room_state', gs.getPublicRoomState(room));
    }, 1000);
  });

  // ── FORCE END (Учитель завершает игру досрочно) ──────────
  socket.on('admin_force_end_game', () => {
    const room = gs.getRoom(socket.data.roomId);
    if (!room) return socket.emit('error', { message_ru: 'Комната не найдена', code: 'ROOM_NOT_FOUND' });
    if (room.adminId !== socket.id) return socket.emit('error', { message_ru: 'Только администратор может завершить игру', code: 'NOT_ADMIN' });
    if (room.phase !== 'playing') return socket.emit('error', { message_ru: 'Игра не активна', code: 'GAME_NOT_ACTIVE' });

    if (room.timerInterval) { clearInterval(room.timerInterval); room.timerInterval = null; }
    room.phase = 'ended';
    touch(room);
    const scores = buildFinalScores(room);
    mh.finishMatch(room, scores);
    log(`Игра ${room.roomId} ЗАВЕРШЕНА досрочно учителем`);
    io.to(room.roomId).emit('game_ended', { reason: 'forced', message_ru: '🛑 Учитель завершил игру досрочно.', scores });
    io.to(room.roomId).emit('room_state', gs.getPublicRoomState(room));
  });

  // ── PICK TASK (Captain only) ─────────────────────────────
  socket.on('pick_task', ({ taskId } = {}) => {
    const ctx = requireMembership();
    if (!ctx) return;
    const { room, roomId, team } = ctx;
    if (room.phase !== 'playing') return socket.emit('error', { message_ru: 'Игра не активна', code: 'GAME_NOT_ACTIVE' });
    if (team.captainId !== socket.id) return socket.emit('error', { message_ru: 'Выбирать задачи может только капитан', code: 'NOT_CAPTAIN' });

    const result = gs.pickTask(room, socket.id, taskId);
    if (result.error) return socket.emit('error', { message_ru: result.error, code: 'PICK_ERROR' });

    touch(room);
    mh.log(room, { type: 'pick', team: result.team.teamName, color: result.team.color, taskId: result.task.id, level: result.task.level });
    const captainName = socket.data.playerName;
    log(`Капитан "${captainName}" открыл задачу #${taskId} для команды "${result.team.teamName}"`);

    // Broadcast the opened task to ALL members of the team
    for (const member of result.team.members) {
      io.to(member.id).emit('task_opened', {
        task:     result.task,
        openedBy: captainName,
      });
    }
    io.to(roomId).emit('room_state', gs.getPublicRoomState(room));
  });

  // ── SUBMIT ANSWER ────────────────────────────────────────
  // answer может быть строкой (mc / code_repair / text_phrase / full_code)
  // или объектом сопоставлений (interactive_match) — отсюда type-aware проверка.
  socket.on('submit_answer', async ({ answer } = {}) => {
    const ctx = requireMembership();
    if (!ctx) return;
    const { room, roomId } = ctx;
    if (room.phase !== 'playing') return socket.emit('error', { message_ru: 'Игра не активна', code: 'GAME_NOT_ACTIVE' });

    const empty = answer == null || (typeof answer === 'string' && !answer.trim());
    if (empty) return socket.emit('error', { message_ru: 'Введите ответ', code: 'EMPTY_ANSWER' });

    const beforeScore = ctx.team.score;
    // submitAnswer асинхронна: full_code исполняется в дочернем потоке.
    const result = await gs.submitAnswer(room, socket.id, answer);
    if (result.error) return socket.emit('error', { message_ru: result.error, code: 'ANSWER_ERROR' });

    touch(room);
    const playerTeam = gs.getPlayerTeam(room, socket.id);
    mh.log(room, {
      type:    'answer',
      team:    playerTeam?.team.teamName,
      color:   playerTeam?.team.color,
      taskId:  result.taskId,
      correct: !!result.correct,
      mode:    result.mode || null,
      attempt: result.attempts ?? null,
      points:  (playerTeam ? playerTeam.team.score : beforeScore) - beforeScore,
      answer:  typeof answer === 'string' ? answer.slice(0, 120) : JSON.stringify(answer).slice(0, 160),
      sector:  result.capturedSector?.name_ru || null,
      locked:  !!result.locked,
    });
    log(`Команда "${playerTeam?.team.teamName}" ответила на задачу — ${result.correct ? 'ВЕРНО' : 'НЕВЕРНО'}`);

    // Send result to ALL team members
    if (playerTeam) {
      for (const member of playerTeam.team.members) {
        io.to(member.id).emit('task_result', result);
      }
    }

    if (result.correct) {
      // Broadcast sector capture + updated leaderboard to whole room
      io.to(roomId).emit('sector_captured', {
        sector:   result.capturedSector,
        teamName: playerTeam?.team.teamName,
        teamColor: playerTeam?.team.color,
      });

      // Check win condition: all sectors captured
      const allCaptured = room.mapSectors.every(s => s.capturedBy !== null);
      if (allCaptured) {
        clearInterval(room.timerInterval);
        room.timerInterval = null;
        room.phase = 'ended';
        const scores = buildFinalScores(room);
        mh.finishMatch(room, scores);
        log(`Игра ${roomId} ЗАВЕРШЕНА — все секторы захвачены`);
        io.to(roomId).emit('game_ended', {
          reason:     'all_sectors',
          message_ru: '🏆 Все секторы захвачены! Ковчег освобождён!',
          scores,
        });
      }

      io.to(roomId).emit('room_state', gs.getPublicRoomState(room));
    }
  });

  // ── ABANDON TASK ─────────────────────────────────────────
  socket.on('abandon_task', () => {
    const ctx = requireMembership();
    if (!ctx) return;
    const { room, roomId, team } = ctx;
    if (team.captainId !== socket.id) return socket.emit('error', { message_ru: 'Покинуть задачу может только капитан', code: 'NOT_CAPTAIN' });

    const result = gs.abandonTask(room, socket.id);
    if (result.error) return socket.emit('error', { message_ru: result.error, code: 'ABANDON_ERROR' });

    touch(room);
    mh.log(room, { type: 'abandon', team: result.teamName, color: team.color, taskId: result.taskId });
    const playerTeam = gs.getPlayerTeam(room, socket.id);
    log(`Команда "${result.teamName}" покинула задачу #${result.taskId}`);

    if (playerTeam) {
      for (const member of playerTeam.team.members) {
        io.to(member.id).emit('task_abandoned', {
          taskId:    result.taskId,
          message_ru: `⚠️ Задача #${result.taskId} заблокирована — команда её покинула.`,
        });
      }
    }
    io.to(roomId).emit('room_state', gs.getPublicRoomState(room));
  });

  // ── MATCH HISTORY (Teacher tools) ────────────────────────
  socket.on('admin_get_matches', () => {
    if (!requireAdmin()) return;
    socket.emit('matches_list', { matches: mh.summaries() });
  });

  socket.on('admin_get_match', ({ id } = {}) => {
    if (!requireAdmin()) return;
    const match = mh.getMatch(id);
    if (!match) return socket.emit('error', { message_ru: 'Матч не найден', code: 'MATCH_NOT_FOUND' });
    socket.emit('match_detail', { match });
  });

  // ── CUSTOM TASKS (Teacher tools) ────────────────────────
  socket.on('admin_get_custom_tasks', () => {
    if (!requireAdmin()) return;
    socket.emit('custom_tasks_list', { tasks: TASKS.filter(t => t.isCustom) });
  });

  socket.on('admin_add_task', (data = {}) => {
    if (!requireAdmin()) return;
    const { level, type, category, question_ru, correct_answer, options, code_snippet, lore_description_ru } = data;

    if (!level || ![1,2,3,4,5].includes(Number(level)))
      return socket.emit('error', { message_ru: 'Укажите уровень (1-5)', code: 'TASK_INVALID' });
    if (!['text_phrase','multiple_choice','code_repair'].includes(type))
      return socket.emit('error', { message_ru: 'Укажите корректный тип задачи', code: 'TASK_INVALID' });
    if (!['logic_crypto','cs_theory','programming'].includes(category))
      return socket.emit('error', { message_ru: 'Укажите категорию', code: 'TASK_INVALID' });
    if (!question_ru?.trim())
      return socket.emit('error', { message_ru: 'Вопрос не может быть пустым', code: 'TASK_INVALID' });
    if (!correct_answer?.trim())
      return socket.emit('error', { message_ru: 'Ответ не может быть пустым', code: 'TASK_INVALID' });
    if (type === 'multiple_choice' && (!Array.isArray(options) || options.length < 2))
      return socket.emit('error', { message_ru: 'Укажите минимум 2 варианта ответа', code: 'TASK_INVALID' });

    const task = addCustomTask({
      level: Number(level), type, category,
      question_ru: question_ru.trim(),
      correct_answer: correct_answer.trim(),
      ownerId: socket.data.username,           // фиксируем автора задачи
      options, code_snippet, lore_description_ru,
    });

    log(`Добавлена пользовательская задача #${task.id} (L${task.level} ${task.type})`);
    socket.emit('custom_task_saved', { task });
    socket.emit('custom_tasks_list', { tasks: TASKS.filter(t => t.isCustom) });
  });

  socket.on('admin_delete_task', ({ id } = {}) => {
    if (!requireAdmin()) return;
    const requesterId = socket.data.username;
    const res = removeCustomTask(id, requesterId, requesterId === SUPERUSER);
    if (res.error === 'NOT_FOUND')  return socket.emit('error', { message_ru: 'Задача не найдена или не является пользовательской', code: 'TASK_NOT_FOUND' });
    if (res.error === 'FORBIDDEN')  return socket.emit('error', { message_ru: 'Доступ запрещён: можно удалять только свои задачи', code: 'FORBIDDEN' });
    log(`Учитель "${requesterId}" удалил пользовательскую задачу #${id}`);
    socket.emit('custom_tasks_list', { tasks: TASKS.filter(t => t.isCustom) });
  });

  // ── TASK POOL MANAGEMENT (Teacher, перед стартом) ────────
  // Каталог = глобальные TASKS + задачи, импортированные в эту комнату.
  const taskCatalog = (room) => TASKS.concat(room.importedTasks || []);

  // Полный список задач для выбора + текущий зафиксированный пул комнаты.
  socket.on('admin_get_all_tasks', () => {
    if (!requireAdmin()) return;
    const room = gs.getRoom(socket.data.roomId);
    if (!room) return socket.emit('error', { message_ru: 'Сначала создайте комнату', code: 'ROOM_NOT_FOUND' });
    socket.emit('all_tasks_list', {
      tasks:   taskCatalog(room),
      poolIds: room.taskPool.map(t => String(t.id)),
    });
  });

  // Зафиксировать пул матча выбранными задачами (источник истины — комната).
  socket.on('admin_set_task_pool', ({ taskIds } = {}) => {
    if (!requireAdmin()) return;
    const room = gs.getRoom(socket.data.roomId);
    if (!room) return socket.emit('error', { message_ru: 'Комната не найдена', code: 'ROOM_NOT_FOUND' });
    if (room.phase !== 'lobby') return socket.emit('error', { message_ru: 'Менять пул можно только в лобби', code: 'NOT_LOBBY' });
    if (!Array.isArray(taskIds) || taskIds.length === 0)
      return socket.emit('error', { message_ru: 'Выберите хотя бы одну задачу', code: 'EMPTY_POOL' });

    const byId = new Map(taskCatalog(room).map(t => [String(t.id), t]));
    const seen = new Set();
    const pool = [];
    for (const id of taskIds) {
      const key = String(id);
      if (seen.has(key)) continue;
      const t = byId.get(key);
      if (t) { pool.push(t); seen.add(key); }
    }
    if (pool.length === 0)
      return socket.emit('error', { message_ru: 'Ни одна из выбранных задач не найдена', code: 'EMPTY_POOL' });

    room.taskPool = pool;
    touch(room);
    log(`Учитель зафиксировал пул: ${pool.length} задач в комнате ${room.roomId}`);
    socket.emit('task_pool_set', { count: pool.length });
    io.to(room.roomId).emit('room_state', gs.getPublicRoomState(room));
  });

  // Импорт пака: уже известные id — отметить; новые задачи — добавить в каталог комнаты.
  socket.on('admin_import_pack', ({ tasks } = {}) => {
    if (!requireAdmin()) return;
    const room = gs.getRoom(socket.data.roomId);
    if (!room) return socket.emit('error', { message_ru: 'Комната не найдена', code: 'ROOM_NOT_FOUND' });
    if (room.phase !== 'lobby') return socket.emit('error', { message_ru: 'Импорт доступен только в лобби', code: 'NOT_LOBBY' });
    if (!Array.isArray(tasks) || tasks.length === 0)
      return socket.emit('error', { message_ru: 'Файл не содержит задач', code: 'BAD_PACK' });

    if (!room.importedTasks) room.importedTasks = [];
    const known = new Set(taskCatalog(room).map(t => String(t.id)));
    const packIds = [];
    let added = 0;
    for (const raw of tasks) {
      const id = raw && raw.id != null ? String(raw.id) : null;
      if (id && known.has(id)) { packIds.push(id); continue; }   // уже в каталоге — просто отметим
      const t = sanitizeImportedTask(raw);
      if (!t) continue;
      room.importedTasks.push(t);
      known.add(t.id);
      packIds.push(t.id);
      added++;
    }
    if (packIds.length === 0)
      return socket.emit('error', { message_ru: 'В паке нет корректных задач', code: 'BAD_PACK' });

    touch(room);
    log(`Импорт пака: ${packIds.length} задач (новых кастомных: ${added}) в ${room.roomId}`);
    socket.emit('all_tasks_list', { tasks: taskCatalog(room), poolIds: room.taskPool.map(t => String(t.id)) });
    socket.emit('pack_imported', { packIds, added, total: packIds.length });
    io.to(room.roomId).emit('room_state', gs.getPublicRoomState(room));
  });

  // ── USER PROFILES & SOCIAL (Игроки) ──────────────────────

  // Кому сейчас принадлежит сокет с данным userId (для адресной доставки).
  function socketIdForUser(userId) {
    for (const room of gs.rooms.values()) {
      const found = gs.findMemberByUserId(room, userId);
      if (found) return found.player.id;
    }
    return null;
  }

  // Соц-контекст цели в комнате игрока (питает кнопки инвайта/запроса; только лобби).
  function roomSocialContext(targetUserId) {
    const room = socket.data.roomId ? gs.getRoom(socket.data.roomId) : null;
    if (!room || room.phase !== 'lobby') {
      return { sameRoom: false, online: false, targetTeam: null, iAmCaptainOf: null };
    }
    const target = gs.findMemberByUserId(room, targetUserId);
    const me     = socket.data.userId ? gs.findMemberByUserId(room, socket.data.userId) : null;
    return {
      sameRoom:     !!target,
      online:       !!target && !target.player.offline,
      targetTeam:   target ? target.team.teamName : null,
      iAmCaptainOf: (me && me.team.captainId === socket.id) ? me.team.teamName : null,
    };
  }

  // Подтолкнуть игроку (если онлайн) его собственный профиль (после смены дружбы).
  function pushOwnProfile(userId) {
    const sid = socketIdForUser(userId);
    if (sid) io.to(sid).emit('my_profile', { profile: up.ownView(userId) });
  }

  const noProfile = () =>
    socket.emit('error', { message_ru: 'Профиль доступен только игрокам', code: 'NO_PROFILE' });

  // Свой профиль (полный) — для раздела «Мой профиль».
  socket.on('get_my_profile', () => {
    const uid = socket.data.userId;
    if (!uid) return noProfile();
    up.ensureUser(uid, socket.data.playerName);
    socket.emit('my_profile', { profile: up.ownView(uid) });
  });

  // Редактирование своего профиля + флаги приватности.
  socket.on('update_profile', ({ name, contacts, privacy } = {}) => {
    const uid = socket.data.userId;
    if (!uid) return noProfile();
    const p = up.updateProfile(uid, { name, contacts, privacy });
    if (!p) return socket.emit('error', { message_ru: 'Профиль не найден', code: 'PROFILE_NOT_FOUND' });
    socket.emit('my_profile', { profile: up.ownView(uid) });
  });

  // Чужой мини-профиль: только публичные контакты + соц-контекст.
  socket.on('get_profile', ({ userId } = {}) => {
    if (!userId) return socket.emit('error', { message_ru: 'Не указан игрок', code: 'BAD_TARGET' });
    const view = up.publicView(userId, socket.data.userId);
    if (!view) return socket.emit('error', { message_ru: 'Профиль игрока не найден', code: 'PROFILE_NOT_FOUND' });
    socket.emit('profile_view', { profile: view, context: roomSocialContext(userId) });
  });

  socket.on('add_friend', ({ userId } = {}) => {
    const uid = socket.data.userId;
    if (!uid) return noProfile();
    const res = up.addFriend(uid, userId);
    if (res.error) return socket.emit('error', { message_ru: res.error, code: 'FRIEND_ERROR' });
    socket.emit('my_profile',   { profile: up.ownView(uid) });
    socket.emit('profile_view', { profile: up.publicView(userId, uid), context: roomSocialContext(userId) });
    pushOwnProfile(userId);   // другу — обновлённый список друзей, если онлайн
  });

  socket.on('remove_friend', ({ userId } = {}) => {
    const uid = socket.data.userId;
    if (!uid) return noProfile();
    const res = up.removeFriend(uid, userId);
    if (res.error) return socket.emit('error', { message_ru: res.error, code: 'FRIEND_ERROR' });
    socket.emit('my_profile',   { profile: up.ownView(uid) });
    socket.emit('profile_view', { profile: up.publicView(userId, uid), context: roomSocialContext(userId) });
    pushOwnProfile(userId);
  });

  // Капитан приглашает игрока в свою команду (нудж; приём — через select_team).
  socket.on('team_invite', ({ userId } = {}) => {
    const room = gs.getRoom(socket.data.roomId);
    if (!room) return socket.emit('error', { message_ru: 'Комната не найдена', code: 'ROOM_NOT_FOUND' });
    if (room.phase !== 'lobby') return socket.emit('error', { message_ru: 'Приглашать можно только в лобби', code: 'NOT_LOBBY' });
    const me = gs.getPlayerTeam(room, socket.id);
    if (!me || me.team.captainId !== socket.id)
      return socket.emit('error', { message_ru: 'Приглашать может только капитан', code: 'NOT_CAPTAIN' });
    const target = gs.findMemberByUserId(room, userId);
    if (!target) return socket.emit('error', { message_ru: 'Игрок не в этой комнате', code: 'TARGET_NOT_HERE' });
    if (target.team.teamName === me.team.teamName)
      return socket.emit('error', { message_ru: 'Игрок уже в вашей команде', code: 'ALREADY_MEMBER' });

    io.to(target.player.id).emit('team_invite_received', {
      teamName: me.team.teamName, color: me.team.color, fromName: socket.data.playerName,
    });
    socket.emit('social_ack', { message_ru: `Приглашение отправлено игроку ${target.player.name}` });
  });

  // Игрок просит вступить в команду цели → уведомляем её капитана.
  socket.on('team_join_request', ({ userId } = {}) => {
    const room = gs.getRoom(socket.data.roomId);
    if (!room) return socket.emit('error', { message_ru: 'Комната не найдена', code: 'ROOM_NOT_FOUND' });
    if (room.phase !== 'lobby') return socket.emit('error', { message_ru: 'Запрашивать можно только в лобби', code: 'NOT_LOBBY' });
    if (!socket.data.userId) return noProfile();
    const target = gs.findMemberByUserId(room, userId);
    if (!target) return socket.emit('error', { message_ru: 'Игрок не в этой комнате', code: 'TARGET_NOT_HERE' });
    const team = target.team;
    const me = gs.getPlayerTeam(room, socket.id);
    if (me && me.team.teamName === team.teamName)
      return socket.emit('error', { message_ru: 'Вы уже в этой команде', code: 'ALREADY_MEMBER' });

    const list = joinRequests.get(room.roomId) || [];
    if (!list.some(r => r.fromUserId === socket.data.userId && r.teamName === team.teamName)) {
      list.push({ fromUserId: socket.data.userId, fromName: socket.data.playerName, teamName: team.teamName });
      joinRequests.set(room.roomId, list);
    }
    io.to(team.captainId).emit('join_request_received', {
      fromUserId: socket.data.userId, fromName: socket.data.playerName, teamName: team.teamName,
    });
    socket.emit('social_ack', { message_ru: `Запрос на вступление в «${team.teamName}» отправлен капитану` });
  });

  // Капитан подтверждает/отклоняет запрос на вступление.
  socket.on('approve_join', ({ userId, accept = true } = {}) => {
    const room = gs.getRoom(socket.data.roomId);
    if (!room) return socket.emit('error', { message_ru: 'Комната не найдена', code: 'ROOM_NOT_FOUND' });
    if (room.phase !== 'lobby') return socket.emit('error', { message_ru: 'Только в лобби', code: 'NOT_LOBBY' });
    const me = gs.getPlayerTeam(room, socket.id);
    if (!me || me.team.captainId !== socket.id)
      return socket.emit('error', { message_ru: 'Подтверждать может только капитан', code: 'NOT_CAPTAIN' });

    const list = joinRequests.get(room.roomId) || [];
    const idx = list.findIndex(r => r.fromUserId === userId && r.teamName === me.team.teamName);
    if (idx === -1) return socket.emit('error', { message_ru: 'Запрос не найден', code: 'REQUEST_NOT_FOUND' });
    list.splice(idx, 1);
    joinRequests.set(room.roomId, list);

    const sid = socketIdForUser(userId);
    if (!accept) {
      if (sid) io.to(sid).emit('social_ack', { message_ru: `Капитан отклонил ваш запрос в «${me.team.teamName}»` });
      return;
    }
    const reqInfo = gs.findMemberByUserId(room, userId);
    if (!reqInfo) return socket.emit('error', { message_ru: 'Игрок уже покинул комнату', code: 'TARGET_NOT_HERE' });

    const result = gs.selectTeam(room, reqInfo.player.id, reqInfo.player.name, me.team.teamName, userId);
    if (result.error) return socket.emit('error', { message_ru: result.error, code: 'TEAM_ERROR' });

    touch(room);
    const moved = sessionBySocket(reqInfo.player.id);
    if (moved) { moved.teamName = me.team.teamName; moved.isCaptain = false; }
    io.to(reqInfo.player.id).emit('social_ack', { message_ru: `Вас приняли в команду «${me.team.teamName}»` });
    io.to(room.roomId).emit('room_state', gs.getPublicRoomState(room));
  });

  // ── DISCONNECT ───────────────────────────────────────────
  // ── RECONNECT по токену сессии ───────────────────────────
  socket.on('socket_reconnect', ({ sessionToken } = {}) => {
    const session = sessionToken ? sessions.get(sessionToken) : null;
    if (!session) {
      return socket.emit('reconnect_failed', { message_ru: 'Сессия не найдена или истекла' });
    }
    const room = gs.getRoom(session.roomId);
    if (!room) {
      sessions.delete(sessionToken);
      return socket.emit('reconnect_failed', { message_ru: 'Комната уже не существует' });
    }

    // Отменяем отложенное удаление, возвращаем online
    if (session.timeoutId) { clearTimeout(session.timeoutId); session.timeoutId = null; }
    session.offline = false;

    const oldId = session.socketId;
    const newId = socket.id;

    // Привязываем новый сокет (transport + данные)
    socket.join(session.roomId);
    socket.data.sessionToken = sessionToken;
    socket.data.roomId       = session.roomId;
    socket.data.playerName   = session.playerName;
    socket.data.isAdmin      = session.isAdmin;
    if (session.username) socket.data.username = session.username;
    if (session.userId)   socket.data.userId   = session.userId;

    // Восстанавливаем капитанство / adminId / id участника
    gs.rebindSocket(room, oldId, newId);
    session.socketId = newId;

    touch(room);
    log(`Reconnect: "${session.playerName || 'учитель'}" → ${session.roomId} (admin=${session.isAdmin})`);
    socket.emit('reconnected', {
      roomId:    session.roomId,
      isAdmin:   session.isAdmin,
      playerName: session.playerName,
      teamName:  session.teamName,
    });
    io.to(session.roomId).emit('room_state', gs.getPublicRoomState(room));
  });

  // ── DISCONNECT с grace-периодом ──────────────────────────
  socket.on('disconnect', () => {
    const token = socket.data.sessionToken;
    const session = token ? sessions.get(token) : null;

    // Нет сессии (или сокет уже переподключён под другим id) — мгновенная очистка.
    if (!session || session.socketId !== socket.id) {
      const room = gs.removePlayer(socket.id);
      if (room) { touch(room); io.to(room.roomId).emit('room_state', gs.getPublicRoomState(room)); }
      return;
    }

    // Переводим в offline и запускаем отложенное удаление.
    session.offline = true;
    const room = gs.getRoom(session.roomId);
    if (room) {
      gs.setMemberOffline(room, socket.id, true);
      touch(room);
      io.to(session.roomId).emit('room_state', gs.getPublicRoomState(room));
    }
    log(`Игрок "${session.playerName || 'учитель'}" отключился — grace ${GRACE_MS / 1000}с`);
    session.timeoutId = setTimeout(() => finalizeSession(token), GRACE_MS);
  });
}

// Нормализация задачи из импортированного пака (защита от мусора в файле).
const PACK_VALID_TYPES = ['text_phrase', 'multiple_choice', 'code_repair', 'full_code', 'interactive_match'];
const PACK_VALID_CATS  = ['logic_crypto', 'cs_theory', 'programming'];

function sanitizeImportedTask(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const type = PACK_VALID_TYPES.includes(raw.type) ? raw.type : 'text_phrase';
  const question_ru = (raw.question_ru || '').toString().trim();
  if (!question_ru) return null;

  const level    = Math.max(1, Math.min(5,  parseInt(raw.level)  || 1));
  const sector   = Math.max(1, Math.min(12, parseInt(raw.sector) || level));
  const category = PACK_VALID_CATS.includes(raw.category) ? raw.category
                 : type === 'multiple_choice' ? 'cs_theory'
                 : (type === 'code_repair' || type === 'full_code') ? 'programming'
                 : 'logic_crypto';

  const t = {
    id:                 String(raw.id != null ? raw.id : `imp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`),
    level, sector, type, category,
    question_ru,
    correct_answer:     raw.correct_answer != null ? String(raw.correct_answer) : '',
    lore_description_ru: (raw.lore_description_ru || '').toString(),
    isCustom: true,
    imported: true,
  };
  if (Array.isArray(raw.options))         t.options         = raw.options.map(String);
  if (raw.code_snippet)                   t.code_snippet    = String(raw.code_snippet);
  if (raw.language)                       t.language        = String(raw.language);
  if (raw.entry)                          t.entry           = String(raw.entry);
  if (Array.isArray(raw.tests))           t.tests           = raw.tests;
  if (Array.isArray(raw.pairs))           t.pairs           = raw.pairs;
  if (Array.isArray(raw.acceptedAnswers)) t.acceptedAnswers = raw.acceptedAnswers.map(String);
  if (Array.isArray(raw.keywords))        t.keywords        = raw.keywords.map(String);
  if (raw.image_url)                      t.image_url       = String(raw.image_url);

  // Отсев заведомо непригодных задач.
  if (t.type === 'multiple_choice' && (!t.options || t.options.length < 2)) return null;
  if (['text_phrase', 'code_repair', 'multiple_choice'].includes(t.type) && !t.correct_answer) return null;
  return t;
}

function buildFinalScores(room) {
  return Object.values(room.teams)
    .map(t => ({ teamName: t.teamName, score: t.score, color: t.color, members: t.members.length }))
    .sort((a, b) => b.score - a.score);
}

module.exports = { registerHandlers };
