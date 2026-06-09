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

// Распределение пула на сессию (50 карт):
//   4 logic_crypto + 3 multiple_choice + 3 code_repair на уровень × 5 уровней
//   = 20 logic / 15 MC / 15 CR  → строго 40% / 30% / 30%
//   Внутри code_repair добиваемся по 1 задаче каждого языка (py + ku + pa).
function selectTaskPool() {
  const pool = [];
  for (let lvl = 1; lvl <= 5; lvl++) {
    const lvlTasks = TASKS.filter(t => t.level === lvl);
    const logic    = shuffleArray(lvlTasks.filter(t => t.category === 'logic_crypto'));
    const mc       = shuffleArray(lvlTasks.filter(t => t.type === 'multiple_choice'));
    const codeBy   = {
      python: shuffleArray(lvlTasks.filter(t => t.type === 'code_repair' && t.language === 'python')),
      kumir:  shuffleArray(lvlTasks.filter(t => t.type === 'code_repair' && t.language === 'kumir')),
      pascal: shuffleArray(lvlTasks.filter(t => t.type === 'code_repair' && t.language === 'pascal')),
    };

    const picked = [];
    picked.push(...logic.slice(0, 4));
    picked.push(...mc.slice(0, 3));

    // CR: один на каждый язык (порядок шафлим, чтобы не было биаса)
    const langOrder = shuffleArray(['python', 'kumir', 'pascal']);
    for (const lang of langOrder) {
      if (codeBy[lang].length > 0) picked.push(codeBy[lang].shift());
    }

    // Если в каком-то ведре не хватило — добираем тем же типом из других языков
    while (picked.length < 10) {
      let added = false;
      for (const lang of langOrder) {
        if (picked.length >= 10) break;
        if (codeBy[lang].length > 0) { picked.push(codeBy[lang].shift()); added = true; }
      }
      if (!added) break;
    }

    // Последний резерв: добираем чем угодно с уровня
    if (picked.length < 10) {
      const remaining = lvlTasks.filter(t => !picked.includes(t));
      picked.push(...shuffleArray(remaining).slice(0, 10 - picked.length));
    }
    pool.push(...picked);
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
