// ============================================================
// Aegis-X: Cyber-Siege — TypeScript Type Definitions
// ============================================================

export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;
export type TaskStatusValue  = 'available' | 'in_progress' | 'solved' | 'abandoned';
export type GamePhase        = 'lobby' | 'playing' | 'ended';
export type TaskType         = 'multiple_choice' | 'code_repair';
export type CodeLanguage     = 'python' | 'kumir' | 'pascal';
export type AnswerMatchMode  = 'exact' | 'alternate' | 'keywords' | 'choice';

// ── Task Schema ────────────────────────────────────────────
// Two distinct mechanics:
//   • multiple_choice  — render 4 options as buttons, exact-match correct_answer
//   • code_repair      — render code_snippet with ▓▓▓ placeholder; either
//                        free-text input OR option-selection if `options` set
// ───────────────────────────────────────────────────────────

export interface Task {
  // Required by spec
  id:                  string;
  level:               DifficultyLevel;
  type:                TaskType;
  lore_description_ru: string;
  question_ru:         string;
  correct_answer:      string;            // option text for MC; value or option line for CR

  // Required for code_repair only
  language?:           CodeLanguage;
  code_snippet?:       string;            // raw source; ▓▓▓ marks the blank

  // Required for multiple_choice; optional for code_repair (select-mode)
  options?:            string[];          // exactly 4 distinct strings

  // ── Game-internal (preserved from previous spec) ─────────
  sector:              number;            // 1-12: maps task → ship sector
  hint_ru?:            string;            // small hint (UI cost)
  acceptedAnswers?:    string[];          // fuzzy alternates (code_repair text)
  keywords?:           string[];          // stems for partial credit (code_repair text)
}

export interface TaskStatus {
  taskId:     string;
  status:     TaskStatusValue;
  solvedBy?:  string;
  attempts:   number;
  matchMode?: AnswerMatchMode;
}

export interface Player {
  id:         string;                     // socket.id
  name:       string;
  teamName:   string;
  isCaptain:  boolean;
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
  id:          number;
  name_ru:     string;
  capturedBy:  string | null;
  points:      number;
}

export interface RoomState {
  roomId:        string;
  adminId:       string;
  phase:         GamePhase;
  globalTimer:   number;
  gameDuration:  number;
  teams:         Record<string, TeamState>;
  taskPool:      Task[];                  // 50 tasks per session
  mapSectors:    MapSector[];
  createdAt:     string;
}

// ── Socket Payloads ────────────────────────────────────────

export interface CreateRoomPayload   { adminName: string; gameDurationMinutes?: number; }
export interface JoinRoomPayload     { roomId: string; playerName: string; }
export interface SelectTeamPayload   { teamName: string; }
export interface PickTaskPayload     { taskId: string; }
export interface SubmitAnswerPayload { answer: string; }

export interface RoomCreatedPayload  { roomId: string; adminId: string; }
export interface TaskOpenedPayload   { task: Task; openedBy: string; }
export interface TaskResultPayload {
  correct:        boolean;
  taskId:         string;
  message_ru:     string;
  mode?:          AnswerMatchMode;
  newScore?:      number;
  capturedSector?: MapSector;
  attempts?:      number;
}
export interface ErrorPayload        { message_ru: string; code?: string; }
