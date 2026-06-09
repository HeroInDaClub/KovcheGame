// ============================================================
// Aegis-X: Cyber-Siege — TypeScript Type Definitions
// ============================================================

export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;
export type TaskStatusValue = 'available' | 'in_progress' | 'solved' | 'abandoned';
export type GamePhase = 'lobby' | 'playing' | 'ended';

export type AnswerMatchMode = 'exact' | 'alternate' | 'keywords';

export interface Task {
  id: number;
  level: DifficultyLevel;
  sector: number;             // 1-12: maps task to ship sector
  question_ru: string;
  answer: string;             // canonical correct answer (also used as "model answer" for teachers)
  acceptedAnswers?: string[]; // optional: alternate phrasings that also score as correct
  keywords?: string[];        // optional: short stems; ≥60% (min 1) must appear in input → correct
  lore_description_ru: string;
  hint_ru?: string;
}

export interface TaskStatus {
  taskId: number;
  status: TaskStatusValue;
  solvedBy?: string;          // teamName
  attempts: number;
  matchMode?: AnswerMatchMode; // how the winning attempt matched (debug/teacher analytics)
}

export interface Player {
  id: string;               // socket.id
  name: string;
  teamName: string;
  isCaptain: boolean;
}

export interface TeamState {
  teamName: string;
  color: string;            // hex or tailwind-compatible string
  score: number;
  captainId: string | null; // socket.id of captain
  members: Player[];
  activeTaskId: number | null;
  taskStatuses: Record<number, TaskStatus>;
}

export interface MapSector {
  id: number;
  name_ru: string;
  capturedBy: string | null; // teamName or null
  points: number;            // point value of this sector
}

export interface RoomState {
  roomId: string;
  adminId: string;
  phase: GamePhase;
  globalTimer: number;      // seconds remaining
  gameDuration: number;     // total game duration in seconds
  teams: Record<string, TeamState>;
  taskPool: Task[];         // 50 tasks selected for this room
  mapSectors: MapSector[];
  createdAt: string;
}

// ---- Socket Event Payloads (Client → Server) ----

export interface CreateRoomPayload {
  adminName: string;
  gameDurationMinutes?: number; // default 45
}

export interface JoinRoomPayload {
  roomId: string;
  playerName: string;
}

export interface SelectTeamPayload {
  teamName: string;
}

export interface PickTaskPayload {
  taskId: number;
}

export interface SubmitAnswerPayload {
  answer: string;
}

// ---- Socket Event Payloads (Server → Client) ----

export interface RoomCreatedPayload {
  roomId: string;
  adminId: string;
}

export interface RoomStatePayload extends RoomState {}

export interface TaskOpenedPayload {
  task: Task;
  openedBy: string; // captain's name
}

export interface TaskResultPayload {
  correct: boolean;
  taskId: number;
  message_ru: string;
  mode?: AnswerMatchMode;     // which strategy accepted the answer (correct=true only)
  newScore?: number;
  capturedSector?: MapSector;
  attempts?: number;          // populated when correct=false
}

export interface ErrorPayload {
  message_ru: string;
  code?: string;
}
