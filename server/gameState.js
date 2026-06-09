// ============================================================
// Aegis-X: Cyber-Siege — In-Memory Game State Manager
// ============================================================

const { TASKS } = require('./taskDatabase');

const TEAM_CONFIGS = [
  { name: 'Альфа',  color: '#00f5a0', glow: '#00f5a044' },
  { name: 'Бета',   color: '#00c8ff', glow: '#00c8ff44' },
  { name: 'Гамма',  color: '#9b30ff', glow: '#9b30ff44' },
  { name: 'Дельта', color: '#ffd60a', glow: '#ffd60a44' },
];

const MAP_SECTORS = [
  { id: 1,  name_ru: 'Шлюзовой Отсек',       capturedBy: null, points: 100 },
  { id: 2,  name_ru: 'Навигационный Центр',   capturedBy: null, points: 150 },
  { id: 3,  name_ru: 'Веб-Интерфейс',        capturedBy: null, points: 120 },
  { id: 4,  name_ru: 'Ядро ОС',              capturedBy: null, points: 200 },
  { id: 5,  name_ru: 'Серверная Кодовая',     capturedBy: null, points: 130 },
  { id: 6,  name_ru: 'Реакторный Отсек',      capturedBy: null, points: 180 },
  { id: 7,  name_ru: 'Ангар Дронов',          capturedBy: null, points: 110 },
  { id: 8,  name_ru: 'Складской Банк',        capturedBy: null, points: 120 },
  { id: 9,  name_ru: 'Командный Центр',       capturedBy: null, points: 250 },
  { id: 10, name_ru: 'Серверная Комната',     capturedBy: null, points: 200 },
  { id: 11, name_ru: 'Системы Безопасности',  capturedBy: null, points: 160 },
  { id: 12, name_ru: 'Спасательные Капсулы',  capturedBy: null, points: 300 },
];

// rooms: Map<roomId, RoomState>
const rooms = new Map();

function generateRoomId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = '';
  for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function selectTaskPool() {
  // 10 tasks from each difficulty level = 50 total
  const byLevel = {};
  for (let lvl = 1; lvl <= 5; lvl++) {
    byLevel[lvl] = TASKS.filter(t => t.level === lvl);
  }
  const pool = [];
  for (let lvl = 1; lvl <= 5; lvl++) {
    pool.push(...shuffleArray(byLevel[lvl]).slice(0, 10));
  }
  return shuffleArray(pool);
}

function createRoom(adminId, adminName, gameDurationMinutes = 45) {
  let roomId;
  do { roomId = generateRoomId(); } while (rooms.has(roomId));

  const teams = {};
  for (const cfg of TEAM_CONFIGS) {
    teams[cfg.name] = {
      teamName:    cfg.name,
      color:       cfg.color,
      score:       0,
      captainId:   null,
      members:     [],
      activeTaskId: null,
      taskStatuses: {},
    };
  }

  const room = {
    roomId,
    adminId,
    adminName,
    phase:          'lobby',
    globalTimer:    gameDurationMinutes * 60,
    gameDuration:   gameDurationMinutes * 60,
    timerInterval:  null,
    teams,
    taskPool:       selectTaskPool(),
    mapSectors:     MAP_SECTORS.map(s => ({ ...s })),
    createdAt:      new Date().toISOString(),
  };

  rooms.set(roomId, room);
  return room;
}

function getRoom(roomId) {
  return rooms.get(roomId) || null;
}

function getRoomBySocket(socketId) {
  for (const room of rooms.values()) {
    for (const team of Object.values(room.teams)) {
      if (team.members.some(m => m.id === socketId)) return room;
      if (room.adminId === socketId) return room;
    }
  }
  return null;
}

function joinRoom(roomId, socketId, playerName) {
  const room = rooms.get(roomId);
  if (!room) return { error: 'Комната не найдена' };
  if (room.phase !== 'lobby') return { error: 'Игра уже началась' };
  return { room };
}

function selectTeam(room, socketId, playerName, teamName) {
  const team = room.teams[teamName];
  if (!team) return { error: 'Команда не найдена' };

  // Remove player from any previous team
  for (const t of Object.values(room.teams)) {
    const idx = t.members.findIndex(m => m.id === socketId);
    if (idx !== -1) {
      t.members.splice(idx, 1);
      if (t.captainId === socketId) {
        t.captainId = t.members.length > 0 ? t.members[0].id : null;
        if (t.members.length > 0) t.members[0].isCaptain = true;
      }
    }
  }

  const isCaptain = team.members.length === 0;
  const player = { id: socketId, name: playerName, teamName, isCaptain };
  team.members.push(player);
  if (isCaptain) team.captainId = socketId;

  return { player, team };
}

function removePlayer(socketId) {
  const room = getRoomBySocket(socketId);
  if (!room) return null;

  for (const team of Object.values(room.teams)) {
    const idx = team.members.findIndex(m => m.id === socketId);
    if (idx !== -1) {
      team.members.splice(idx, 1);
      if (team.captainId === socketId) {
        team.captainId = team.members.length > 0 ? team.members[0].id : null;
        if (team.members.length > 0) team.members[0].isCaptain = true;
      }
    }
  }
  return room;
}

function getPlayerTeam(room, socketId) {
  for (const team of Object.values(room.teams)) {
    const member = team.members.find(m => m.id === socketId);
    if (member) return { team, player: member };
  }
  return null;
}

function pickTask(room, socketId, taskId) {
  const info = getPlayerTeam(room, socketId);
  if (!info) return { error: 'Игрок не найден в команде' };
  const { team, player } = info;
  if (team.captainId !== socketId) return { error: 'Только капитан может выбирать задачи' };

  const task = room.taskPool.find(t => t.id === taskId);
  if (!task) return { error: 'Задача не найдена' };

  const status = team.taskStatuses[taskId];
  if (status === 'solved')    return { error: 'Задача уже решена' };
  if (status === 'abandoned') return { error: 'Задача заблокирована' };
  if (team.activeTaskId !== null) return { error: 'У команды уже открыта задача' };

  team.activeTaskId = taskId;
  team.taskStatuses[taskId] = { taskId, status: 'in_progress', attempts: 0 };
  return { task, team };
}

function submitAnswer(room, socketId, rawAnswer) {
  const info = getPlayerTeam(room, socketId);
  if (!info) return { error: 'Игрок не найден в команде' };
  const { team } = info;

  if (team.activeTaskId === null) return { error: 'Нет активной задачи' };

  const taskId = team.activeTaskId;
  const task = room.taskPool.find(t => t.id === taskId);
  if (!task) return { error: 'Задача не найдена' };

  const statusEntry = team.taskStatuses[taskId];
  statusEntry.attempts += 1;

  const normalizedAnswer = rawAnswer.toLowerCase().trim();
  const normalizedCorrect = task.answer.toLowerCase().trim();
  const correct = normalizedAnswer === normalizedCorrect;

  if (correct) {
    statusEntry.status = 'solved';
    statusEntry.solvedBy = team.teamName;
    team.activeTaskId = null;
    team.score += getDifficultyPoints(task.level);

    // Capture sector
    const sector = room.mapSectors.find(s => s.id === task.sector);
    const previousOwner = sector ? sector.capturedBy : null;
    if (sector) {
      sector.capturedBy = team.teamName;
      if (previousOwner !== team.teamName) team.score += sector.points;
    }

    return {
      correct: true,
      taskId,
      message_ru: `✅ Верно! Сектор "${sector?.name_ru}" захвачен командой ${team.teamName}!`,
      newScore: team.score,
      capturedSector: sector,
    };
  } else {
    return {
      correct: false,
      taskId,
      message_ru: `❌ Неверно. Попытка ${statusEntry.attempts}. Попробуйте ещё раз или покиньте задачу.`,
      attempts: statusEntry.attempts,
    };
  }
}

function abandonTask(room, socketId) {
  const info = getPlayerTeam(room, socketId);
  if (!info) return { error: 'Игрок не найден в команде' };
  const { team } = info;

  if (team.activeTaskId === null) return { error: 'Нет активной задачи' };

  const taskId = team.activeTaskId;
  team.taskStatuses[taskId] = { taskId, status: 'abandoned', attempts: team.taskStatuses[taskId]?.attempts ?? 0 };
  team.activeTaskId = null;

  return { taskId, teamName: team.teamName };
}

function getDifficultyPoints(level) {
  return level * 50;
}

function getPublicRoomState(room) {
  // Strip timerInterval (non-serializable) before sending
  const { timerInterval, ...publicRoom } = room;
  return publicRoom;
}

function deleteRoom(roomId) {
  const room = rooms.get(roomId);
  if (room?.timerInterval) clearInterval(room.timerInterval);
  rooms.delete(roomId);
}

module.exports = {
  rooms,
  createRoom,
  getRoom,
  getRoomBySocket,
  joinRoom,
  selectTeam,
  removePlayer,
  getPlayerTeam,
  pickTask,
  submitAnswer,
  abandonTask,
  getPublicRoomState,
  deleteRoom,
};
