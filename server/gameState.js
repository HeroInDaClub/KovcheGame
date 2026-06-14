// ============================================================
// Aegis-X: Cyber-Siege — In-Memory Game State Manager
// ============================================================

const { TASKS } = require('./taskDatabase');

// До 25 команд — в кибер/греческой тематике, каждая с уникальным неон-цветом
const ALL_TEAM_CONFIGS = [
  { name: 'Альфа',   color: '#00f5a0', glow: '#00f5a044' },
  { name: 'Бета',    color: '#00c8ff', glow: '#00c8ff44' },
  { name: 'Гамма',   color: '#9b30ff', glow: '#9b30ff44' },
  { name: 'Дельта',  color: '#ffd60a', glow: '#ffd60a44' },
  { name: 'Эпсилон', color: '#ff2d55', glow: '#ff2d5544' },
  { name: 'Зета',    color: '#ff9f0a', glow: '#ff9f0a44' },
  { name: 'Эта',     color: '#30d158', glow: '#30d15844' },
  { name: 'Тета',    color: '#64d2ff', glow: '#64d2ff44' },
  { name: 'Йота',    color: '#bf5af2', glow: '#bf5af244' },
  { name: 'Каппа',   color: '#ff6b35', glow: '#ff6b3544' },
  { name: 'Лямбда',  color: '#4ae54a', glow: '#4ae54a44' },
  { name: 'Мю',      color: '#5e5ce6', glow: '#5e5ce644' },
  { name: 'Ню',      color: '#ff375f', glow: '#ff375f44' },
  { name: 'Кси',     color: '#32ade6', glow: '#32ade644' },
  { name: 'Омикрон', color: '#ffcc02', glow: '#ffcc0244' },
  { name: 'Пи',      color: '#ff6961', glow: '#ff696144' },
  { name: 'Ро',      color: '#4ecdc4', glow: '#4ecdc444' },
  { name: 'Сигма',   color: '#c44dff', glow: '#c44dff44' },
  { name: 'Тау',     color: '#ff4081', glow: '#ff408144' },
  { name: 'Омега',   color: '#00e5ff', glow: '#00e5ff44' },
  { name: 'Призрак', color: '#a8ff78', glow: '#a8ff7844' },
  { name: 'Нова',    color: '#f7971e', glow: '#f7971e44' },
  { name: 'Нексус',  color: '#ee0979', glow: '#ee097944' },
  { name: 'Феникс',  color: '#fc4a1a', glow: '#fc4a1a44' },
  { name: 'Кибер',   color: '#12c2e9', glow: '#12c2e944' },
];

// Весовые коэффициенты уровней 1-5 по пресету сложности
const DIFFICULTY_WEIGHTS = {
  balanced: [1,   1,   1,    1,   1  ],
  easy:     [3.5, 3,   2,    1,   0.5],
  hardcore: [0.5, 1,   2,    3,   3.5],
};

// Метод наибольших остатков — пропорциональное распределение без дробей
function distributeByWeight(weights, total) {
  const sum = weights.reduce((s, w) => s + w, 0);
  const raw = weights.map(w => (w / sum) * total);
  const floored = raw.map(Math.floor);
  let remainder = total - floored.reduce((s, n) => s + n, 0);
  raw.map((r, i) => ({ i, frac: r - Math.floor(r) }))
    .sort((a, b) => b.frac - a.frac)
    .slice(0, remainder)
    .forEach(({ i }) => { floored[i] += 1; });
  return floored;
}

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

// Пропорция типов внутри уровня: 40% logic_crypto, 30% multiple_choice, 30% code_repair
// code_repair равномерно по языкам (python / kumir / pascal).
// Если задач конкретного типа не хватает — добираем из остатка того же уровня.
function selectTaskPool(totalTasksCount = 50, difficultyPreset = 'balanced') {
  const weights   = DIFFICULTY_WEIGHTS[difficultyPreset] ?? DIFFICULTY_WEIGHTS.balanced;
  const perLevel  = distributeByWeight(weights, totalTasksCount); // [n1, n2, n3, n4, n5]

  const pool = [];

  for (let lvl = 1; lvl <= 5; lvl++) {
    let count = Math.min(perLevel[lvl - 1], TASKS.filter(t => t.level === lvl).length);
    if (count <= 0) continue;

    const lvlTasks = TASKS.filter(t => t.level === lvl);
    const logic    = shuffleArray(lvlTasks.filter(t => t.category === 'logic_crypto'));
    const mc       = shuffleArray(lvlTasks.filter(t => t.type === 'multiple_choice'));
    const codeBy   = {
      python: shuffleArray(lvlTasks.filter(t => t.type === 'code_repair' && t.language === 'python')),
      kumir:  shuffleArray(lvlTasks.filter(t => t.type === 'code_repair' && t.language === 'kumir')),
      pascal: shuffleArray(lvlTasks.filter(t => t.type === 'code_repair' && t.language === 'pascal')),
    };

    // Целевые квоты (40/30/30), зажатые до реального наличия
    const allCode  = codeBy.python.length + codeBy.kumir.length + codeBy.pascal.length;
    let logicQ = Math.min(Math.round(count * 0.4), logic.length);
    let mcQ    = Math.min(Math.round(count * 0.3), mc.length);
    let codeQ  = Math.min(count - logicQ - mcQ,   allCode);

    const picked = [
      ...logic.slice(0, logicQ),
      ...mc.slice(0, mcQ),
    ];

    // CR: балансируем по языкам (Round-Robin)
    const langOrder = shuffleArray(['python', 'kumir', 'pascal']);
    let added = 0;
    while (added < codeQ) {
      let anyAdded = false;
      for (const lang of langOrder) {
        if (added >= codeQ) break;
        if (codeBy[lang].length > 0) { picked.push(codeBy[lang].shift()); added++; anyAdded = true; }
      }
      if (!anyAdded) break;
    }

    // Если после квот не хватает — добираем чем угодно с этого уровня
    if (picked.length < count) {
      const usedIds  = new Set(picked.map(t => t.id));
      const leftover = shuffleArray(lvlTasks.filter(t => !usedIds.has(t.id)));
      picked.push(...leftover.slice(0, count - picked.length));
    }

    pool.push(...picked.slice(0, count));
  }

  return shuffleArray(pool);
}

function createRoom(adminId, adminName, {
  gameDurationMinutes = 45,
  maxTeams            = 4,
  totalTasksCount     = 50,
  difficultyPreset    = 'balanced',
} = {}) {
  // ── Валидация параметров ────────────────────────────────
  gameDurationMinutes = Math.max(5,  Math.min(120, parseInt(gameDurationMinutes) || 45));
  maxTeams            = Math.max(2,  Math.min(25,  parseInt(maxTeams)            ||  4));
  totalTasksCount     = Math.max(20, Math.min(100, parseInt(totalTasksCount)     || 50));
  if (!DIFFICULTY_WEIGHTS[difficultyPreset]) difficultyPreset = 'balanced';

  let roomId;
  do { roomId = generateRoomId(); } while (rooms.has(roomId));

  const teams = {};
  for (const cfg of ALL_TEAM_CONFIGS.slice(0, maxTeams)) {
    teams[cfg.name] = {
      teamName:     cfg.name,
      color:        cfg.color,
      score:        0,
      captainId:    null,
      members:      [],
      activeTaskId: null,
      taskStatuses: {},
    };
  }

  const room = {
    roomId,
    adminId,
    adminName,
    phase:           'lobby',
    globalTimer:     gameDurationMinutes * 60,
    gameDuration:    gameDurationMinutes * 60,
    timerInterval:   null,
    maxTeams,
    totalTasksCount,
    difficultyPreset,
    teams,
    taskPool:        selectTaskPool(totalTasksCount, difficultyPreset),
    mapSectors:      MAP_SECTORS.map(s => ({ ...s })),
    createdAt:       new Date().toISOString(),
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
  const { team } = info;
  if (team.captainId !== socketId) return { error: 'Только капитан может выбирать задачи' };

  const task = room.taskPool.find(t => t.id === taskId);
  if (!task) return { error: 'Задача не найдена' };

  const st = team.taskStatuses[taskId];
  if (st?.status === 'solved')    return { error: 'Задача уже решена' };
  if (st?.status === 'abandoned') return { error: 'Задача покинута' };
  if (st?.status === 'failed')    return { error: 'Задача заблокирована — сбой' };
  if (team.activeTaskId !== null) return { error: 'У команды уже открыта задача' };

  team.activeTaskId = taskId;
  team.taskStatuses[taskId] = {
    taskId, status: 'in_progress', attempts: 0, hintsRevealed: 0,
  };
  return { task, team };
}

const HINT_PENALTY = 10;

function revealHint(room, socketId, index) {
  const info = getPlayerTeam(room, socketId);
  if (!info) return { error: 'Игрок не найден в команде' };
  const { team } = info;
  if (team.captainId !== socketId) return { error: 'Подсказки открывает только капитан' };
  if (team.activeTaskId === null) return { error: 'Нет активной задачи' };

  const taskId = team.activeTaskId;
  const task = room.taskPool.find(t => t.id === taskId);
  if (!task) return { error: 'Задача не найдена' };
  if (!Array.isArray(task.hints) || task.hints.length === 0) {
    return { error: 'У этой задачи нет подсказок' };
  }
  if (typeof index !== 'number' || index < 0 || index >= task.hints.length) {
    return { error: 'Неверный индекс подсказки' };
  }

  const st = team.taskStatuses[taskId];
  st.hintsRevealed = Math.max(st.hintsRevealed || 0, index + 1);

  return {
    taskId,
    hintIndex: index,
    hint_ru: task.hints[index],
    hintsRevealed: st.hintsRevealed,
    penaltyPerHint: HINT_PENALTY,
  };
}

// ── Answer matching ─────────────────────────────────────
// Dispatches on task.type:
//   • multiple_choice → only 'exact' against correct_answer (option text)
//   • code_repair     → exact / alternate / keywords cascade
//                       (against correct_answer + acceptedAnswers + keywords)
//
// Strategy details:
//   1) exact     — нормализованный input === нормализованному correct_answer
//   2) alternate — input совпадает с одним из task.acceptedAnswers
//   3) keywords  — input содержит ≥60% (округление вверх, мин. 1)
//                  стемов из task.keywords (нечувствительно к порядку)
// ────────────────────────────────────────────────────────

// Нормализация ответа:
//   • lowercase, ё→е
//   • удаляем разговорную пунктуацию и кавычки (включая дефис как разделитель)
//   • операторные символы (=, <, >, +, *, /, %, :, ^, &, |, ~, @, #) сохраняем
//     и обкладываем пробелами — чтобы "a+b" совпало с "a + b" и т.п.
//   • схлопываем пробелы
//
// ВАЖНО: ранее стрипали всё небуквенно-цифровое, из-за чего ответы вроде
// "=" или ":=" нормализовались в пустую строку (баг с задачами 34, 69, 79…).
function normalize(s) {
  return (s || '')
    .toString()
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[«»“”„"'`.,;!?()[\]{}\-–—]/g, ' ')   // пунктуация → пробел
    .replace(/([=<>+*/%:^&|~@#])/g, ' $1 ')         // операторы окружаем пробелами
    .replace(/\s+/g, ' ')
    .trim();
}

function checkAnswer(rawInput, task) {
  const input = normalize(rawInput);
  if (!input) return { correct: false };

  // Multiple-choice: ровно одно совпадение с correct_answer (текст опции)
  if (task.type === 'multiple_choice') {
    if (normalize(task.correct_answer) === input) {
      return { correct: true, mode: 'choice' };
    }
    return { correct: false };
  }

  // Code-repair (включая free-text и select-mode):
  // 1. Точное совпадение с эталоном
  if (normalize(task.correct_answer) === input) {
    return { correct: true, mode: 'exact' };
  }

  // 2. Альтернативные формулировки
  if (Array.isArray(task.acceptedAnswers)) {
    for (const alt of task.acceptedAnswers) {
      if (normalize(alt) === input) {
        return { correct: true, mode: 'alternate' };
      }
    }
  }

  // 3. Ключевые стемы (только если задано >=1 keyword)
  if (Array.isArray(task.keywords) && task.keywords.length >= 1) {
    const required = Math.max(1, Math.ceil(task.keywords.length * 0.6));
    const matched = task.keywords.filter(kw => {
      const k = normalize(kw);
      return k && input.includes(k);
    });
    if (matched.length >= required) {
      return {
        correct: true,
        mode:    'keywords',
        matched: matched.length,
        total:   task.keywords.length,
        required,
      };
    }
  }

  return { correct: false };
}

function submitAnswer(room, socketId, rawAnswer) {
  const info = getPlayerTeam(room, socketId);
  if (!info) return { error: 'Игрок не найден в команде' };
  const { team } = info;

  if (team.activeTaskId === null) return { error: 'Нет активной задачи' };

  const taskId = team.activeTaskId;
  const task = room.taskPool.find(t => t.id === taskId);
  if (!task) return { error: 'Задача не найдена' };

  const st = team.taskStatuses[taskId];
  st.attempts += 1;

  const check = checkAnswer(rawAnswer, task);

  if (check.correct) {
    st.status    = 'solved';
    st.solvedBy  = team.teamName;
    st.matchMode = check.mode;
    team.activeTaskId = null;

    // Базовая награда минус штраф за подсказки (но не ниже нуля)
    const base        = getDifficultyPoints(task.level);
    const hintsUsed   = st.hintsRevealed || 0;
    const hintPenalty = Math.min(base, hintsUsed * HINT_PENALTY);
    const earned      = base - hintPenalty;
    team.score += earned;

    // Захват сектора (бонус сектора штрафами НЕ режется)
    const sector = room.mapSectors.find(s => s.id === task.sector);
    const previousOwner = sector ? sector.capturedBy : null;
    if (sector) {
      sector.capturedBy = team.teamName;
      if (previousOwner !== team.teamName) team.score += sector.points;
    }

    let modeNote = '';
    if (check.mode === 'alternate') modeNote = ' (альт. вариант)';
    else if (check.mode === 'keywords') modeNote = ` (ключи ${check.matched}/${check.total})`;
    const hintNote = hintPenalty > 0 ? ` · −${hintPenalty} за подсказки` : '';

    return {
      correct: true,
      taskId,
      mode: check.mode,
      message_ru: `✅ Верно!${modeNote}${hintNote} Сектор «${sector?.name_ru}» захвачен!`,
      newScore:       team.score,
      capturedSector: sector,
      hintPenalty,
    };
  }

  // ── Неверный ответ ──

  // ОДНА ПОПЫТКА на multiple_choice → мгновенная блокировка как 'failed'
  if (task.type === 'multiple_choice') {
    st.status        = 'failed';
    st.failedAnswer  = String(rawAnswer);
    team.activeTaskId = null;
    return {
      correct: false,
      taskId,
      message_ru: `❌ Сбой системы! Задача заблокирована. Правильно было: «${task.correct_answer}»`,
      submittedAnswer: String(rawAnswer),
      correctAnswer:   task.correct_answer,
      attempts:        st.attempts,
      locked:          true,
    };
  }

  // Для code_repair и text_phrase — попытки не ограничены
  return {
    correct: false,
    taskId,
    message_ru:      `❌ Неверно. Попытка ${st.attempts}. Попробуйте ещё раз или покиньте задачу.`,
    submittedAnswer: String(rawAnswer),
    attempts:        st.attempts,
  };
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
  revealHint,
  HINT_PENALTY,
  getPublicRoomState,
  deleteRoom,
  // Exposed for tests + future LLM/teacher-review pipelines
  normalize,
  checkAnswer,
};
