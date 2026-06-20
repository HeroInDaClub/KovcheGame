// ============================================================
// Aegis-X: Cyber-Siege — TypeScript Type Definitions
// ============================================================

export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;
export type TaskStatusValue  = 'available' | 'in_progress' | 'solved' | 'abandoned' | 'failed';
export type GamePhase        = 'lobby' | 'playing' | 'ended';
export type GameMode         = 'qualification' | 'finals';  // отборочный (свои карты) | финал (общая)
export type TaskType         = 'multiple_choice' | 'code_repair' | 'text_phrase' | 'full_code' | 'interactive_match';
export type TaskCategory     = 'logic_crypto' | 'cs_theory' | 'programming';
export type CodeLanguage     = 'python' | 'kumir' | 'pascal';
export type AnswerMatchMode  = 'exact' | 'alternate' | 'keywords' | 'choice' | 'code' | 'match';

// ── Task Schema ────────────────────────────────────────────
// Mechanics:
//   • multiple_choice  (cs_theory)   — 4 кнопки, ОДНА попытка → status='failed' при ошибке
//   • code_repair      (programming) — код с ▓▓▓; неограниченные попытки
//   • text_phrase      (logic_crypto)— текстовый ввод; неограниченные попытки
//   • full_code        (programming) — написать функцию; проверка на сервере (vm + тесты)
//   • interactive_match(logic_crypto)— сопоставление пар; проверка структуры на сервере
// ───────────────────────────────────────────────────────────

// Один тест-кейс для full_code: вызвать entry-функцию с args, сверить с expected.
export interface FullCodeTest {
  args:     any[];
  expected: any;
}

// Пара «левое → правое» для interactive_match (эталон сопоставления).
export interface MatchPair {
  left:  string;
  right: string;
}

export interface Task {
  id:                  string;
  level:               DifficultyLevel;
  type:                TaskType;
  category:            TaskCategory;
  sector:              number;

  lore_description_ru: string;
  question_ru:         string;
  correct_answer:      string;

  // Необязательное изображение, рендерится над текстом вопроса
  image_url?:          string;

  // Для code_repair
  language?:           CodeLanguage;
  code_snippet?:       string;

  // Для multiple_choice (обязательно 4); опц. для code_repair (select-mode)
  options?:            string[];

  // Для full_code: имя проверяемой функции + набор тестов
  entry?:              string;
  tests?:              FullCodeTest[];

  // Для interactive_match: эталонные пары соответствий
  pairs?:              MatchPair[];

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
  failedAnswer?:  string;          // что прислали при провале MC (для отрисовки)
}

export interface Player {
  id:        string;
  name:      string;
  teamName:  string;
  isCaptain: boolean;
  userId?:   string | null;   // стабильный id игрока (профиль/друзья/инвайты)
  offline?:  boolean;
}

// ── User Profiles & Social ─────────────────────────────────
// Профили персистятся на диск (users.json) и переживают рестарт.
export interface ContactSet { email: string; vk: string; github: string; }
export interface PrivacyFlags { email: boolean; vk: boolean; github: boolean; }  // true = публично
export interface FriendCard  { id: string; name: string; missing?: boolean; }

// Полный профиль владельца (раздел «Мой профиль»).
export interface OwnProfile {
  id:       string;
  name:     string;
  contacts: ContactSet;
  privacy:  PrivacyFlags;
  friends:  FriendCard[];
  self:     true;
}

// Публичный профиль чужого игрока — только контакты с флагом public.
export interface PublicProfile {
  id:          string;
  name:        string;
  contacts:    Partial<ContactSet>;
  friends:     FriendCard[];
  friendCount: number;
  isFriend:    boolean;
  self:        boolean;
}

// Соц-контекст цели в комнате наблюдателя (для кнопок инвайта/запроса; только лобби).
export interface SocialContext {
  sameRoom:     boolean;
  online:       boolean;
  targetTeam:   string | null;
  iAmCaptainOf: string | null;
}

// Client→Server:
//   join_room { roomId, playerName, userId }
//   get_my_profile | update_profile { name?, contacts?, privacy? }
//   get_profile { userId } | add_friend { userId } | remove_friend { userId }
//   team_invite { userId } | team_join_request { userId } | approve_join { userId, accept }
//   start_game { durationMinutes? } | admin_force_end_game
// Server→Client:
//   my_profile { profile: OwnProfile }
//   profile_view { profile: PublicProfile, context: SocialContext }
//   team_invite_received { teamName, color, fromName }
//   join_request_received { fromUserId, fromName, teamName }
//   social_ack { message_ru }
//   game_ended.reason: 'timeout' | 'all_sectors' | 'forced'

// ── Task Pool & Packs (Teacher) ────────────────────────────
// Каталог = глобальные TASKS + room.importedTasks (импортированные в комнату).
// room.taskPool — зафиксированный учителем набор задач матча (источник истины).
export interface TaskPack {
  format:     'aegis-task-pack';
  version:    number;
  createdAt?: string;
  count?:     number;
  tasks:      Task[];          // полные структуры задач (самодостаточный пак)
}
// Client→Server:
//   admin_get_all_tasks
//   admin_set_task_pool { taskIds: string[] }
//   admin_import_pack { tasks: Task[] }
// Server→Client:
//   all_tasks_list { tasks: Task[], poolIds: string[] }
//   task_pool_set { count: number }
//   pack_imported { packIds: string[], added: number, total: number }

export interface TeamState {
  teamName:     string;
  color:        string;
  score:        number;
  captainId:    string | null;
  members:      Player[];
  activeTaskId: string | null;
  taskStatuses: Record<string, TaskStatus>;
  mapSectors?:  MapSector[];   // только в режиме 'qualification' — личная карта команды
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
  gameMode:      GameMode;      // 'finals' (общая карta) | 'qualification' (карта у каждой команды)
  globalTimer:   number;
  gameDuration:  number;
  teams:         Record<string, TeamState>;
  taskPool:      Task[];        // публичная проекция (без полей ответа)
  mapSectors:    MapSector[];   // общая карта (используется в 'finals')
  createdAt:     string;
}

// start_game { durationMinutes?: number; gameMode?: GameMode }

// ── Socket Payloads ────────────────────────────────────────

export interface CreateRoomPayload   { adminName: string; gameDurationMinutes?: number; }
export interface JoinRoomPayload     { roomId: string; playerName: string; }
export interface SelectTeamPayload   { teamName: string; }
export interface PickTaskPayload     { taskId: string; }

// answer в submit_answer зависит от типа активной задачи:
//   • строка                         — multiple_choice / code_repair / text_phrase / full_code
//   • InteractiveMatchAnswer (объект) — interactive_match
export type SubmitAnswerValue = string | InteractiveMatchAnswer;
export interface SubmitAnswerPayload { answer: SubmitAnswerValue; }

// full_code: игрок присылает исходник функции строкой (см. SubmitAnswerPayload.answer)
export type FullCodeAnswer = string;

// interactive_match: сопоставления в виде { [left]: right }
export interface InteractiveMatchAnswer {
  matches: Record<string, string>;
}

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
  correctAnswer?:   string;       // показывается ТОЛЬКО при провале MC
  passed?:          number;       // full_code: сколько тестов пройдено
  total?:           number;       // full_code: всего тестов
  locked?:          boolean;      // true → задача больше не доступна
}
export interface ErrorPayload        { message_ru: string; code?: string; }

// ── Teacher Auth ───────────────────────────────────────────
// Учителя регистрируются в рантайме и хранятся в памяти сервера
// (Map<username, password>); список сбрасывается при перезапуске.
// Резервный суперпользователь: логин 'admin' + ADMIN_PASSWORD.
export interface Teacher {
  username: string;
  password: string;   // plain-text — учебный/внутренний проект, БД нет
}

export interface AdminAuthPayload       { username: string; password: string; }
export interface TeacherRegisterPayload { username: string; password: string; }

export interface AdminAuthResultPayload       { ok: boolean; message_ru?: string; }
export interface TeacherRegisterResultPayload { ok: boolean; message_ru: string; }
