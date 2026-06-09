// ============================================================
// Aegis-X: Cyber-Siege — TypeScript Type Definitions
// ============================================================

export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;
export type TaskStatusValue  = 'available' | 'in_progress' | 'solved' | 'abandoned' | 'failed';
export type GamePhase        = 'lobby' | 'playing' | 'ended';
export type TaskType         = 'multiple_choice' | 'code_repair' | 'text_phrase';
export type TaskCategory     = 'logic_crypto' | 'cs_theory' | 'programming';
export type CodeLanguage     = 'python' | 'kumir' | 'pascal';
export type AnswerMatchMode  = 'exact' | 'alternate' | 'keywords' | 'choice';

// ── Task Schema ────────────────────────────────────────────
// Three mechanics:
//   • multiple_choice (cs_theory)   — 4 кнопки, ОДНА попытка → status='failed' при ошибке
//   • code_repair     (programming) — код с ▓▓▓; неограниченные попытки
//   • text_phrase     (logic_crypto) — текстовый ввод; неограниченные попытки
//
// Распределение в пуле сессии (50 карт): 40% logic / 30% MC / 30% CR
// ───────────────────────────────────────────────────────────

export interface Task {
  id:                  string;
  level:               DifficultyLevel;
  type:                TaskType;
  category:            TaskCategory;
  sector:              number;

  lore_description_ru: string;
  question_ru:         string;
  correct_answer:      string;

  // Для code_repair
  language?:           CodeLanguage;
  code_snippet?:       string;

  // Для multiple_choice (обязательно 4); опц. для code_repair (select-mode)
  options?:            string[];

  // Прогрессивные подсказки; каждая открытая = -10 очков от награды
  hints?:              string[];

  // Доп. варианты приёма (для text_phrase и code_repair)
  acceptedAnswers?:    string[];
  keywords?:           string[];
}

export interface TaskStatus {
  taskId:         string;
  status:         TaskStatusValue;
  solvedBy?:      string;
  attempts:       number;
  matchMode?:     AnswerMatchMode;
  hintsRevealed:  number;          // сколько подсказок раскрыли (для штрафа)
  failedAnswer?:  string;          // что прислали при провале MC (для отрисовки)
}

export interface Player {
  id:        string;
  name:      string;
  teamName:  string;
  isCaptain: boolean;
}

export interface TeamState {
  teamName:     string;
  color:        string;
  score:        number;
  captainId:    string | null;
  members:      Player[];
  activeTaskId: string | null;
  taskStatuses: Record<string, TaskStatus>;
}

export interface MapSector {
  id:         number;
  name_ru:    string;
  capturedBy: string | null;
  points:     number;
}

export interface RoomState {
  roomId:        string;
  adminId:       string;
  phase:         GamePhase;
  globalTimer:   number;
  gameDuration:  number;
  teams:         Record<string, TeamState>;
  taskPool:      Task[];
  mapSectors:    MapSector[];
  createdAt:     string;
}

// ── Socket Payloads ────────────────────────────────────────

export interface CreateRoomPayload   { adminName: string; gameDurationMinutes?: number; }
export interface JoinRoomPayload     { roomId: string; playerName: string; }
export interface SelectTeamPayload   { teamName: string; }
export interface PickTaskPayload     { taskId: string; }
export interface SubmitAnswerPayload { answer: string; hintsUsed?: number; }
export interface RequestHintPayload  { index: number; }

export interface RoomCreatedPayload  { roomId: string; adminId: string; }
export interface TaskOpenedPayload   { task: Task; openedBy: string; }
export interface TaskResultPayload {
  correct:          boolean;
  taskId:           string;
  message_ru:       string;
  mode?:            AnswerMatchMode;
  newScore?:        number;
  capturedSector?:  MapSector;
  attempts?:        number;
  submittedAnswer?: string;       // что прислал игрок (для подсветки опций)
  correctAnswer?:   string;       // показывается ТОЛЬКО при provals MC
  hintPenalty?:     number;       // сколько очков ушло на подсказки
  locked?:          boolean;      // true → задача больше не доступна
}
export interface HintRevealedPayload {
  taskId:         string;
  hintIndex:      number;
  hint_ru:        string;
  hintsRevealed:  number;
  penaltyPerHint: number;
}
export interface ErrorPayload        { message_ru: string; code?: string; }
