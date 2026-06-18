import { useState, useEffect, useCallback } from 'react';
import { socket, connect, disconnect } from './socket.js';
import AdminPanel       from './components/AdminPanel.jsx';
import Lobby            from './components/Lobby.jsx';
import Dashboard        from './components/Dashboard.jsx';
import TeacherDashboard from './components/TeacherDashboard.jsx';
import GameOver         from './components/GameOver.jsx';

// ── App-level view states ────────────────────────────────
// 'entry'    → Choose: Admin or Player
// 'admin'    → Admin creates room
// 'lobby'    → Waiting for game start (players see team select)
// 'playing'  → Main dashboard
// 'ended'    → Game over / scores
// ─────────────────────────────────────────────────────────

export default function App() {
  const [view,       setView]       = useState('entry');
  const [roomState,  setRoomState]  = useState(null);
  const [roomId,     setRoomId]     = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isAdmin,    setIsAdmin]    = useState(false);
  const [timer,      setTimer]      = useState(null);
  const [taskResult, setTaskResult] = useState(null);
  const [gameOver,   setGameOver]   = useState(null);
  const [notification, setNotif]   = useState('');
  const [customTasks,  setCustomTasks] = useState([]);
  const [lastSaved,    setLastSaved]   = useState(null);

  const notify = useCallback((msg, duration = 4000) => {
    setNotif(msg);
    setTimeout(() => setNotif(''), duration);
  }, []);

  useEffect(() => {
    connect();

    socket.on('connect', () => console.log('[WS] Подключено'));
    socket.on('disconnect', () => console.log('[WS] Отключено'));

    socket.on('room_created', ({ roomId: id }) => {
      setRoomId(id);
      // AdminPanel will emit join_room with this id; view transitions on joined_room
    });

    socket.on('joined_room', ({ roomId: id }) => {
      setRoomId(id);
      setView('lobby');
    });

    socket.on('room_state', (state) => {
      setRoomState(state);
      if (state.phase === 'playing' && view !== 'playing') setView('playing');
      if (state.phase === 'ended'   && view !== 'ended')   setView('ended');
    });

    socket.on('game_started', ({ message_ru }) => {
      notify(message_ru, 5000);
      setView('playing');
    });

    socket.on('timer_tick', ({ remaining }) => {
      setTimer(remaining);
    });

    // Модалка задачи открывается/закрывается по activeTaskId в room_state.
    // task_opened нужен только для уведомления и сброса прошлого результата.
    socket.on('task_opened', ({ task, openedBy }) => {
      setTaskResult(null);
      notify(`📂 Капитан ${openedBy} открыл задачу: ${task.question_ru.slice(0, 40)}…`);
    });

    socket.on('task_result', (result) => {
      setTaskResult(result);
      // Верный ответ / MC-провал: сервер очистит activeTaskId → модалка закроется
      if (result.correct || result.locked) notify(result.message_ru, 6000);
    });

    socket.on('task_abandoned', ({ message_ru }) => {
      setTaskResult(null);
      notify(message_ru);
    });

    socket.on('sector_captured', ({ sector, teamName }) => {
      notify(`🚩 Сектор "${sector.name_ru}" захвачен командой ${teamName}!`, 4000);
    });

    socket.on('game_ended', (data) => {
      setGameOver(data);
      setView('ended');
    });

    socket.on('error', ({ message_ru }) => {
      notify(`⚠️ ${message_ru}`, 5000);
    });

    socket.on('custom_tasks_list', ({ tasks }) => {
      setCustomTasks(tasks);
    });

    socket.on('custom_task_saved', ({ task }) => {
      setLastSaved(task.id);
      notify(`✓ Задача #${task.id} (L${task.level}) сохранена`, 3000);
    });

    socket.on('admin_auth_result', ({ ok, message_ru }) => {
      if (ok) {
        setIsAdmin(true);
        setView('admin');
      } else {
        notify(`⚠️ ${message_ru || 'Неверный логин или пароль'}`, 4000);
      }
    });

    socket.on('teacher_register_result', ({ ok, message_ru }) => {
      notify(`${ok ? '✅' : '⚠️'} ${message_ru}`, 4500);
    });

    return () => {
      disconnect();
      socket.removeAllListeners();
    };
  }, []); // eslint-disable-line

  // Keep timer in sync with roomState when re-joining
  useEffect(() => {
    if (roomState && timer === null) setTimer(roomState.globalTimer);
  }, [roomState]);

  if (view === 'ended' && gameOver) {
    return <GameOver gameOver={gameOver} roomState={roomState} />;
  }

  if (view === 'playing' && roomState) {
    if (isAdmin) {
      return (
        <TeacherDashboard
          roomState={roomState}
          timer={timer ?? roomState.globalTimer}
          isAdmin={isAdmin}
          notification={notification}
          onStartGame={() => socket.emit('start_game')}
        />
      );
    }
    return (
      <Dashboard
        roomState={roomState}
        timer={timer ?? roomState.globalTimer}
        taskResult={taskResult}
        playerName={playerName}
        isAdmin={isAdmin}
        notification={notification}
        onPickTask={(taskId) => socket.emit('pick_task', { taskId })}
        onSubmit={(answer)   => socket.emit('submit_answer', { answer })}
        onAbandon={()        => socket.emit('abandon_task')}
        onStartGame={()      => socket.emit('start_game')}
      />
    );
  }

  if ((view === 'lobby' || (view === 'admin' && roomId)) && roomState) {
    return (
      <Lobby
        roomState={roomState}
        roomId={roomId}
        playerName={playerName}
        isAdmin={isAdmin}
        notification={notification}
        onSelectTeam={(teamName) => socket.emit('select_team', { teamName })}
        onStartGame={()          => socket.emit('start_game')}
      />
    );
  }

  if (view === 'admin') {
    return (
      <AdminPanel
        notification={notification}
        roomId={roomId}
        customTasks={customTasks}
        lastSaved={lastSaved}
        onAddTask={(data) => socket.emit('admin_add_task', data)}
        onDeleteTask={(id) => socket.emit('admin_delete_task', { id })}
        onCreateRoom={({ adminName, duration, maxTeams, totalTasksCount, difficultyPreset }) => {
          setPlayerName(adminName);
          setIsAdmin(true);
          socket.emit('create_room', {
            adminName,
            gameDurationMinutes: duration,
            maxTeams,
            totalTasksCount,
            difficultyPreset,
          });
        }}
      />
    );
  }

  // Entry screen
  return (
    <EntryScreen
      notification={notification}
      onAdmin={({ username, password }) => socket.emit('admin_auth', { username, password })}
      onRegister={({ username, password }) => socket.emit('teacher_register', { username, password })}
      onPlayer={({ name, code }) => {
        setPlayerName(name);
        setIsAdmin(false);
        socket.emit('join_room', { roomId: code.toUpperCase(), playerName: name });
      }}
    />
  );
}

// ── Entry Screen ─────────────────────────────────────────
function EntryScreen({ onAdmin, onRegister, onPlayer, notification }) {
  const [mode,     setMode]     = useState('');        // 'admin' | 'player'
  const [authTab,  setAuthTab]  = useState('login');   // 'login' | 'register'
  const [name,     setName]     = useState('');
  const [code,     setCode]     = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const submitAuth = () => {
    const u = username.trim();
    if (!u || !password.trim()) return;
    if (authTab === 'login') onAdmin({ username: u, password });
    else                     onRegister({ username: u, password });
  };

  return (
    <div className="min-h-screen bg-cyber-dark cyber-grid flex flex-col items-center justify-center p-4 font-mono">
      {notification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-cyber-panel border border-cyber-neon text-cyber-neon px-6 py-3 rounded text-sm shadow-neon animate-pulse-neon">
          {notification}
        </div>
      )}

      <div className="mb-8 text-center">
        <div className="text-4xl font-bold text-cyber-neon text-shadow-neon tracking-widest mb-2">
          AEGIS-X
        </div>
        <div className="text-cyber-blue text-sm tracking-[0.3em] uppercase">
          Кибер-Осада Межзвёздного Ковчега
        </div>
        <div className="mt-4 text-cyber-muted text-xs max-w-md">
          Рогаи ИИ "Aegis-X" захватил звёздный ковчег. Команды хакеров должны взломать
          отсеки и вернуть контроль над кораблём до истечения времени.
        </div>
      </div>

      {!mode && (
        <div className="flex gap-6">
          <button
            onClick={() => setMode('admin')}
            className="px-8 py-4 border border-cyber-purple text-cyber-purple hover:bg-cyber-purple hover:text-black transition-all duration-200 tracking-widest text-sm uppercase"
          >
            👨‍🏫 Учитель
          </button>
          <button
            onClick={() => setMode('player')}
            className="px-8 py-4 border border-cyber-neon text-cyber-neon hover:bg-cyber-neon hover:text-black transition-all duration-200 tracking-widest text-sm uppercase"
          >
            🎮 Игрок
          </button>
        </div>
      )}

      {mode === 'admin' && (
        <div className="flex flex-col gap-4 w-full max-w-sm">
          <div className="text-cyber-purple text-xs text-center mb-1 tracking-widest">ПАНЕЛЬ УЧИТЕЛЯ</div>

          {/* Переключатель Вход / Регистрация */}
          <div className="flex border border-cyber-border">
            <button
              onClick={() => setAuthTab('login')}
              className={`flex-1 py-2 text-xs font-bold tracking-widest transition
                ${authTab === 'login' ? 'bg-cyber-purple text-black' : 'text-cyber-muted hover:text-cyber-purple'}`}
            >
              ВХОД
            </button>
            <button
              onClick={() => setAuthTab('register')}
              className={`flex-1 py-2 text-xs font-bold tracking-widest transition
                ${authTab === 'register' ? 'bg-cyber-purple text-black' : 'text-cyber-muted hover:text-cyber-purple'}`}
            >
              РЕГИСТРАЦИЯ
            </button>
          </div>

          <input
            className="bg-cyber-panel border border-cyber-border text-cyber-text px-4 py-3 focus:outline-none focus:border-cyber-purple w-full"
            placeholder="Логин"
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submitAuth()}
            autoFocus
          />
          <input
            type="password"
            className="bg-cyber-panel border border-cyber-border text-cyber-text px-4 py-3 focus:outline-none focus:border-cyber-purple w-full"
            placeholder="Пароль"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submitAuth()}
          />
          <button
            onClick={submitAuth}
            disabled={!username.trim() || !password.trim()}
            className="px-6 py-3 bg-cyber-purple text-black font-bold tracking-widest text-sm uppercase hover:opacity-90 transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {authTab === 'login' ? 'Войти' : 'Зарегистрироваться'}
          </button>
          <button onClick={() => setMode('')} className="text-cyber-muted text-xs hover:text-cyber-text text-center">← Назад</button>
        </div>
      )}

      {mode === 'player' && (
        <div className="flex flex-col gap-4 w-full max-w-sm">
          <div className="text-cyber-neon text-xs text-center mb-2 tracking-widest">ВОЙТИ КАК ИГРОК</div>
          <input
            className="bg-cyber-panel border border-cyber-border text-cyber-text px-4 py-3 focus:outline-none focus:border-cyber-neon w-full"
            placeholder="Ваш позывной"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <input
            className="bg-cyber-panel border border-cyber-border text-cyber-text px-4 py-3 focus:outline-none focus:border-cyber-neon w-full uppercase tracking-widest"
            placeholder="КОД КОМНАТЫ"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            maxLength={6}
            onKeyDown={e => e.key === 'Enter' && name.trim() && code.length === 6 && onPlayer({ name, code })}
          />
          <button
            onClick={() => name.trim() && code.length === 6 && onPlayer({ name, code })}
            disabled={!name.trim() || code.length !== 6}
            className="px-6 py-3 bg-cyber-neon text-black font-bold tracking-widest text-sm uppercase hover:opacity-90 transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Подключиться
          </button>
          <button onClick={() => setMode('')} className="text-cyber-muted text-xs hover:text-cyber-text text-center">← Назад</button>
        </div>
      )}
    </div>
  );
}
