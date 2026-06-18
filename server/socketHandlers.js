// ============================================================
// Aegis-X: Cyber-Siege — Socket.io Event Handlers
// ============================================================

const gs = require('./gameState');
const { TASKS, addCustomTask, removeCustomTask } = require('./taskDatabase');

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
  socket.on('join_room', ({ roomId, playerName } = {}) => {
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

    const result = gs.selectTeam(room, socket.id, socket.data.playerName, teamName);
    if (result.error) return socket.emit('error', { message_ru: result.error, code: 'TEAM_ERROR' });

    touch(room);
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

    const result = gs.createTeam(room, socket.id, socket.data.playerName, teamName);
    if (result.error) return socket.emit('error', { message_ru: result.error, code: 'TEAM_ERROR' });

    touch(room);
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
      io.to(id).emit('error', { message_ru: `Команда «${result.teamName}» удалена учителем`, code: 'TEAM_DELETED' });
    }
    io.to(roomId).emit('room_state', gs.getPublicRoomState(room));
  });

  // ── START GAME (Admin only) ──────────────────────────────
  socket.on('start_game', () => {
    const roomId = socket.data.roomId;
    const room = gs.getRoom(roomId);
    if (!room) return socket.emit('error', { message_ru: 'Комната не найдена', code: 'ROOM_NOT_FOUND' });
    if (room.adminId !== socket.id) return socket.emit('error', { message_ru: 'Только администратор может начать игру', code: 'NOT_ADMIN' });
    if (room.phase !== 'lobby') return socket.emit('error', { message_ru: 'Игра уже запущена', code: 'ALREADY_STARTED' });

    room.phase = 'playing';
    // Точный таймер на таймстампе: без ежесекундного декремента/рассылки.
    room.endTimestamp = Date.now() + room.gameDuration * 1000;
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
      log(`Игра ${roomId} ЗАВЕРШЕНА — время вышло`);
      io.to(roomId).emit('game_ended', { reason: 'timeout', message_ru: '⏰ Время вышло! Игра завершена.', scores });
      io.to(roomId).emit('room_state', gs.getPublicRoomState(room));
    }, 1000);
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
  socket.on('submit_answer', ({ answer } = {}) => {
    const ctx = requireMembership();
    if (!ctx) return;
    const { room, roomId } = ctx;
    if (room.phase !== 'playing') return socket.emit('error', { message_ru: 'Игра не активна', code: 'GAME_NOT_ACTIVE' });

    const empty = answer == null || (typeof answer === 'string' && !answer.trim());
    if (empty) return socket.emit('error', { message_ru: 'Введите ответ', code: 'EMPTY_ANSWER' });

    const result = gs.submitAnswer(room, socket.id, answer);
    if (result.error) return socket.emit('error', { message_ru: result.error, code: 'ANSWER_ERROR' });

    touch(room);
    const playerTeam = gs.getPlayerTeam(room, socket.id);
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

  // ── DISCONNECT ───────────────────────────────────────────
  socket.on('disconnect', () => {
    const room = gs.removePlayer(socket.id);
    if (room) {
      touch(room);
      log(`Игрок "${socket.data.playerName}" отключился от ${room.roomId}`);
      io.to(room.roomId).emit('room_state', gs.getPublicRoomState(room));
    }
  });
}

function buildFinalScores(room) {
  return Object.values(room.teams)
    .map(t => ({ teamName: t.teamName, score: t.score, color: t.color, members: t.members.length }))
    .sort((a, b) => b.score - a.score);
}

module.exports = { registerHandlers };
