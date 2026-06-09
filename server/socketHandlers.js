// ============================================================
// Aegis-X: Cyber-Siege — Socket.io Event Handlers
// ============================================================

const gs = require('./gameState');

function registerHandlers(io, socket) {
  const log = (msg) => console.log(`[${new Date().toISOString()}] [${socket.id.slice(0, 8)}] ${msg}`);

  // ── CREATE ROOM (Admin/Teacher) ──────────────────────────
  socket.on('create_room', ({ adminName, gameDurationMinutes = 45 } = {}) => {
    if (!adminName?.trim()) {
      return socket.emit('error', { message_ru: 'Укажите имя администратора', code: 'MISSING_NAME' });
    }
    const room = gs.createRoom(socket.id, adminName.trim(), gameDurationMinutes);
    socket.join(room.roomId);
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
    log(`"${playerName}" вошёл в комнату ${roomId}`);
    socket.emit('joined_room', { roomId: roomId.toUpperCase().trim() });
    io.to(roomId.toUpperCase().trim()).emit('room_state', gs.getPublicRoomState(result.room));
  });

  // ── SELECT TEAM ──────────────────────────────────────────
  socket.on('select_team', ({ teamName } = {}) => {
    const roomId = socket.data.roomId;
    if (!roomId) return socket.emit('error', { message_ru: 'Вы не в комнате', code: 'NOT_IN_ROOM' });

    const room = gs.getRoom(roomId);
    if (!room) return socket.emit('error', { message_ru: 'Комната не найдена', code: 'ROOM_NOT_FOUND' });

    const playerName = socket.data.playerName;
    const result = gs.selectTeam(room, socket.id, playerName, teamName);
    if (result.error) {
      return socket.emit('error', { message_ru: result.error, code: 'TEAM_ERROR' });
    }
    log(`"${playerName}" выбрал команду "${teamName}" (капитан: ${result.player.isCaptain})`);
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
    log(`Игра ${roomId} НАЧАТА`);
    io.to(roomId).emit('game_started', { message_ru: '⚡ Aegis-X активирован. Начните взлом!', timestamp: Date.now() });
    io.to(roomId).emit('room_state', gs.getPublicRoomState(room));

    // Global countdown timer — ticks every second
    room.timerInterval = setInterval(() => {
      room.globalTimer -= 1;
      io.to(roomId).emit('timer_tick', { remaining: room.globalTimer });

      if (room.globalTimer <= 0) {
        clearInterval(room.timerInterval);
        room.timerInterval = null;
        room.phase = 'ended';
        const scores = buildFinalScores(room);
        log(`Игра ${roomId} ЗАВЕРШЕНА — время вышло`);
        io.to(roomId).emit('game_ended', { reason: 'timeout', message_ru: '⏰ Время вышло! Игра завершена.', scores });
        io.to(roomId).emit('room_state', gs.getPublicRoomState(room));
      }
    }, 1000);
  });

  // ── PICK TASK (Captain only) ─────────────────────────────
  socket.on('pick_task', ({ taskId } = {}) => {
    const roomId = socket.data.roomId;
    const room = gs.getRoom(roomId);
    if (!room) return socket.emit('error', { message_ru: 'Комната не найдена', code: 'ROOM_NOT_FOUND' });
    if (room.phase !== 'playing') return socket.emit('error', { message_ru: 'Игра не активна', code: 'GAME_NOT_ACTIVE' });

    const result = gs.pickTask(room, socket.id, taskId);
    if (result.error) return socket.emit('error', { message_ru: result.error, code: 'PICK_ERROR' });

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
  socket.on('submit_answer', ({ answer } = {}) => {
    const roomId = socket.data.roomId;
    const room = gs.getRoom(roomId);
    if (!room) return socket.emit('error', { message_ru: 'Комната не найдена', code: 'ROOM_NOT_FOUND' });
    if (room.phase !== 'playing') return socket.emit('error', { message_ru: 'Игра не активна', code: 'GAME_NOT_ACTIVE' });
    if (!answer?.trim()) return socket.emit('error', { message_ru: 'Введите ответ', code: 'EMPTY_ANSWER' });

    const result = gs.submitAnswer(room, socket.id, answer);
    if (result.error) return socket.emit('error', { message_ru: result.error, code: 'ANSWER_ERROR' });

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

  // ── REQUEST HINT (Captain only, −10 очков за каждую) ────
  socket.on('request_hint', ({ index } = {}) => {
    const roomId = socket.data.roomId;
    const room = gs.getRoom(roomId);
    if (!room) return socket.emit('error', { message_ru: 'Комната не найдена', code: 'ROOM_NOT_FOUND' });
    if (room.phase !== 'playing') return socket.emit('error', { message_ru: 'Игра не активна', code: 'GAME_NOT_ACTIVE' });

    const result = gs.revealHint(room, socket.id, index);
    if (result.error) return socket.emit('error', { message_ru: result.error, code: 'HINT_ERROR' });

    const playerTeam = gs.getPlayerTeam(room, socket.id);
    log(`Команда "${playerTeam?.team.teamName}" открыла подсказку #${result.hintIndex + 1} к задаче ${result.taskId}`);

    if (playerTeam) {
      for (const member of playerTeam.team.members) {
        io.to(member.id).emit('hint_revealed', result);
      }
    }
    io.to(roomId).emit('room_state', gs.getPublicRoomState(room));
  });

  // ── ABANDON TASK ─────────────────────────────────────────
  socket.on('abandon_task', () => {
    const roomId = socket.data.roomId;
    const room = gs.getRoom(roomId);
    if (!room) return socket.emit('error', { message_ru: 'Комната не найдена', code: 'ROOM_NOT_FOUND' });

    const result = gs.abandonTask(room, socket.id);
    if (result.error) return socket.emit('error', { message_ru: result.error, code: 'ABANDON_ERROR' });

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

  // ── DISCONNECT ───────────────────────────────────────────
  socket.on('disconnect', () => {
    const room = gs.removePlayer(socket.id);
    if (room) {
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
