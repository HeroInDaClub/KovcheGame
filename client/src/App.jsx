import { useState, useEffect, useCallback, useMemo } from 'react';
import { socket, connect, disconnect } from './socket.js';
import AdminPanel       from './components/AdminPanel.jsx';
import Lobby            from './components/Lobby.jsx';
import Dashboard        from './components/Dashboard.jsx';
import TeacherDashboard from './components/TeacherDashboard.jsx';
import GameOver         from './components/GameOver.jsx';
import ProfilePanel       from './components/ProfilePanel.jsx';
import PlayerProfileModal from './components/PlayerProfileModal.jsx';
import TaskPoolManager    from './components/TaskPoolManager.jsx';
import { getUserId }      from './profile.js';

// ── App-level view states ────────────────────────────────
// 'entry'    → Choose: Admin or Player
// 'admin'    → Admin creates room
// 'lobby'    → Waiting for game start (players see team select)
// 'playing'  → Main dashboard
// 'ended'    → Game over / scores
// ─────────────────────────────────────────────────────────

// ── Session persistence (для reconnect) ──────────────────
const SS_KEY = 'aegis_session';
const loadSession  = () => { try { return JSON.parse(sessionStorage.getItem(SS_KEY)) || {}; } catch { return {}; } };
const saveSession  = (patch) => sessionStorage.setItem(SS_KEY, JSON.stringify({ ...loadSession(), ...patch }));
const clearSession = () => sessionStorage.removeItem(SS_KEY);

export default function App() {
  const [view,       setView]       = useState('entry');
  const [roomState,  setRoomState]  = useState(null);
  const [roomId,     setRoomId]     = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isAdmin,    setIsAdmin]    = useState(false);
  const [timer,        setTimer]        = useState(null);
  const [endTimestamp, setEndTimestamp] = useState(null);
  const [taskResult,   setTaskResult]   = useState(null);
  const [gameOver,   setGameOver]   = useState(null);
  const [notification, setNotif]   = useState('');
  const [customTasks,  setCustomTasks] = useState([]);
  const [lastSaved,    setLastSaved]   = useState(null);

  // ── Профили / соц-функции ──
  const myUserId = useMemo(() => getUserId(), []);
  const [myProfile,   setMyProfile]   = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [viewProfile, setViewProfile] = useState(null);   // { profile, context }
  const [invite,      setInvite]      = useState(null);    // входящий team_invite
  const [joinReqs,    setJoinReqs]    = useState([]);      // входящие запросы (капитан)

  // ── Пул задач (учитель) ──
  const [poolMgr,  setPoolMgr]  = useState(false);
  const [catalog,  setCatalog]  = useState([]);            // полный каталог задач
  const [poolSel,  setPoolSel]  = useState([]);            // рабочий выбор (id, строки)

  // Ошибка валидации названия команды (показывается под инпутом)
  const [teamError, setTeamError] = useState('');

  const notify = useCallback((msg, duration = 4000) => {
    setNotif(msg);
    setTimeout(() => setNotif(''), duration);
  }, []);

  useEffect(() => {
    connect();

    // На каждом (пере)подключении — пытаемся восстановить сессию по токену.
    socket.on('connect', () => {
      console.log('[WS] Подключено');
      const { sessionToken } = loadSession();
      if (sessionToken) socket.emit('socket_reconnect', { sessionToken });
    });
    socket.on('disconnect', () => console.log('[WS] Отключено'));

    // Серверный токен сессии — сохраняем для будущего reconnect.
    socket.on('session', ({ sessionToken }) => saveSession({ sessionToken }));

    socket.on('room_created', ({ roomId: id }) => {
      setRoomId(id);
      // AdminPanel will emit join_room with this id; view transitions on joined_room
    });

    socket.on('joined_room', ({ roomId: id }) => {
      setRoomId(id);
      saveSession({ roomId: id });
      setView('lobby');
    });

    socket.on('room_state', (state) => {
      setRoomState(state);
      setEndTimestamp(state.endTimestamp ?? null);   // null в лобби, метка в игре
      setView(v => {
        if (state.phase === 'playing') return 'playing';
        if (state.phase === 'ended')   return 'ended';
        if (state.phase === 'lobby' && v === 'entry') return 'lobby';  // reconnect в лобби
        return v;
      });
    });

    // Успешное восстановление сессии (после reload/обрыва).
    socket.on('reconnected', ({ roomId: id, isAdmin: admin, playerName: name, teamName }) => {
      setRoomId(id);
      setIsAdmin(!!admin);
      if (name) setPlayerName(name);
      saveSession({ roomId: id, playerName: name, teamName });
      notify('🔌 Сессия восстановлена', 3000);
      // Итоговый view выставит пришедший следом room_state по фазе.
    });

    socket.on('reconnect_failed', () => {
      clearSession();   // токен устарел или комната удалена — тихо сбрасываем
    });

    socket.on('game_started', ({ message_ru, endTimestamp: end }) => {
      notify(message_ru, 5000);
      if (end) setEndTimestamp(end);
      setView('playing');
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

    socket.on('error', ({ message_ru, code }) => {
      // Ошибки названия команды показываем под инпутом создания (не глобально).
      if (code === 'TEAM_ERROR') { setTeamError(message_ru); return; }
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

    // ── Профили / соц-функции ──
    socket.on('my_profile',   ({ profile }) => setMyProfile(profile));
    socket.on('profile_view', (data)        => setViewProfile(data));
    socket.on('social_ack',   ({ message_ru }) => notify(`✓ ${message_ru}`, 4000));
    socket.on('team_invite_received', (data) => {
      setInvite(data);
      notify(`📨 ${data.fromName} зовёт в команду «${data.teamName}»`, 6000);
    });
    socket.on('join_request_received', (data) => {
      setJoinReqs(q => [...q.filter(r => r.fromUserId !== data.fromUserId), data]);
      notify(`🙋 ${data.fromName} просится в «${data.teamName}»`, 6000);
    });

    // ── Пул задач ──
    socket.on('all_tasks_list', ({ tasks, poolIds }) => {
      setCatalog(tasks);
      setPoolSel((poolIds || []).map(String));
    });
    socket.on('pack_imported', ({ packIds, added, total }) => {
      setPoolSel(prev => Array.from(new Set([...prev, ...(packIds || []).map(String)])));
      notify(`📦 Импортировано задач: ${total} (новых: ${added}). Отмечены — нажмите «Применить пул».`, 6000);
    });
    socket.on('task_pool_set', ({ count }) => notify(`✓ Пул матча зафиксирован: ${count} задач`, 4000));

    return () => {
      disconnect();
      socket.removeAllListeners();
    };
  }, []); // eslint-disable-line

  // Точный локальный таймер: считаем remaining от серверного endTimestamp.
  // Пока игра не началась (endTimestamp == null) — показываем полную длительность.
  useEffect(() => {
    if (!endTimestamp) {
      setTimer(roomState ? roomState.gameDuration : null);
      return;
    }
    const tick = () => setTimer(Math.max(0, Math.floor((endTimestamp - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [endTimestamp, roomState?.gameDuration]);

  const openMyProfile = () => { socket.emit('get_my_profile'); setShowProfile(true); };
  const viewPlayer    = (userId) => userId && socket.emit('get_profile', { userId });

  // ── Пул задач (учитель) ──
  const openTaskPool = () => { socket.emit('admin_get_all_tasks'); setPoolMgr(true); };
  const togglePool    = (id) => setPoolSel(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const setManyPool   = (ids, on) => setPoolSel(prev => {
    const s = new Set(prev);
    ids.forEach(i => on ? s.add(i) : s.delete(i));
    return [...s];
  });
  const applyPool = () => { socket.emit('admin_set_task_pool', { taskIds: poolSel }); setPoolMgr(false); };

  const importPackFile = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        const tasks = Array.isArray(data)            ? data
                    : Array.isArray(data.tasks)      ? data.tasks
                    : Array.isArray(data.taskIds)    ? data.taskIds.map(id => ({ id }))
                    : null;
        if (!tasks || tasks.length === 0) return notify('⚠️ Пустой или неверный файл пака', 4000);
        socket.emit('admin_import_pack', { tasks });
      } catch { notify('⚠️ Не удалось прочитать JSON', 4000); }
    };
    reader.readAsText(file);
  };

  const exportPack = () => {
    const set = new Set(poolSel.map(String));
    const tasks = catalog.filter(t => set.has(String(t.id)));
    const pack = { format: 'aegis-task-pack', version: 1, createdAt: new Date().toISOString(), count: tasks.length, tasks };
    const blob = new Blob([JSON.stringify(pack, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `aegis-pack-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  };

  const taskPoolLayer = poolMgr ? (
    <TaskPoolManager
      catalog={catalog} selectedIds={poolSel}
      onToggle={togglePool} onSetMany={setManyPool}
      onApply={applyPool} onExport={exportPack} onImportFile={importPackFile}
      onClose={() => setPoolMgr(false)}
    />
  ) : null;

  const socialLayer = (
    <SocialLayer
      canSocial={!isAdmin}
      myProfile={myProfile}     showProfile={showProfile} onCloseProfile={() => setShowProfile(false)}
      viewProfile={viewProfile} onCloseView={() => setViewProfile(null)}
      invite={invite}           onCloseInvite={() => setInvite(null)}
      joinReqs={joinReqs}
      onViewPlayer={viewPlayer}
      onSaveProfile={(patch)   => socket.emit('update_profile', patch)}
      onAddFriend={(id)        => socket.emit('add_friend', { userId: id })}
      onRemoveFriend={(id)     => socket.emit('remove_friend', { userId: id })}
      onInvite={(id)           => socket.emit('team_invite', { userId: id })}
      onRequestJoin={(id)      => socket.emit('team_join_request', { userId: id })}
      onAcceptInvite={(team)   => { saveSession({ teamName: team }); socket.emit('select_team', { teamName: team }); setInvite(null); }}
      onRespondJoin={(id, ok)  => { socket.emit('approve_join', { userId: id, accept: ok }); setJoinReqs(q => q.filter(r => r.fromUserId !== id)); }}
    />
  );

  if (view === 'ended' && gameOver) {
    return <GameOver gameOver={gameOver} roomState={roomState} />;
  }

  if (view === 'playing' && roomState) {
    if (isAdmin) {
      return (<>
        <TeacherDashboard
          roomState={roomState}
          timer={timer ?? roomState.gameDuration}
          isAdmin={isAdmin}
          notification={notification}
          onStartGame={() => socket.emit('start_game')}
          onForceEnd={() => socket.emit('admin_force_end_game')}
        />
        {socialLayer}
      </>);
    }
    return (<>
      <Dashboard
        roomState={roomState}
        timer={timer ?? roomState.gameDuration}
        taskResult={taskResult}
        playerName={playerName}
        isAdmin={isAdmin}
        notification={notification}
        onPickTask={(taskId) => socket.emit('pick_task', { taskId })}
        onSubmit={(answer)   => socket.emit('submit_answer', { answer })}
        onAbandon={()        => socket.emit('abandon_task')}
        onStartGame={()      => socket.emit('start_game')}
        onOpenProfile={openMyProfile}
      />
      {socialLayer}
    </>);
  }

  if ((view === 'lobby' || (view === 'admin' && roomId)) && roomState) {
    return (<>
      <Lobby
        roomState={roomState}
        roomId={roomId}
        playerName={playerName}
        isAdmin={isAdmin}
        notification={notification}
        onSelectTeam={(teamName) => { saveSession({ teamName }); socket.emit('select_team', { teamName }); }}
        onCreateTeam={(teamName) => { setTeamError(''); saveSession({ teamName }); socket.emit('create_team', { teamName }); }}
        onKickMember={(targetId) => socket.emit('kick_member', { targetId })}
        teamError={teamError}
        onClearTeamError={() => setTeamError('')}
        onDeleteTeam={(teamName) => socket.emit('delete_team', { teamName })}
        onStartGame={(minutes)   => socket.emit('start_game', { durationMinutes: minutes })}
        onOpenProfile={openMyProfile}
        onViewPlayer={viewPlayer}
        onOpenTaskPool={openTaskPool}
        myUserId={myUserId}
      />
      {socialLayer}
      {taskPoolLayer}
    </>);
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
          saveSession({ playerName: adminName });
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
        saveSession({ playerName: name });
        socket.emit('join_room', { roomId: code.toUpperCase(), playerName: name, userId: myUserId });
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

// ── Соц-слой: модалки профиля/просмотра + входящие инвайты/запросы ──
function SocialLayer({
  canSocial, myProfile, showProfile, onCloseProfile,
  viewProfile, onCloseView, invite, onCloseInvite, joinReqs,
  onViewPlayer, onSaveProfile, onAddFriend, onRemoveFriend,
  onInvite, onRequestJoin, onAcceptInvite, onRespondJoin,
}) {
  return (
    <>
      {showProfile && myProfile && (
        <ProfilePanel
          profile={myProfile}
          onSave={onSaveProfile}
          onClose={onCloseProfile}
          onRemoveFriend={onRemoveFriend}
          onViewFriend={onViewPlayer}
        />
      )}

      {viewProfile && (
        <PlayerProfileModal
          data={viewProfile} canSocial={canSocial}
          onClose={onCloseView}
          onAddFriend={onAddFriend} onRemoveFriend={onRemoveFriend}
          onInvite={onInvite} onRequestJoin={onRequestJoin}
          onViewFriend={onViewPlayer}
        />
      )}

      {/* Входящее приглашение в команду */}
      {invite && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[140] bg-cyber-panel border border-cyber-purple shadow-neon px-4 py-3 font-mono text-xs flex items-center gap-3">
          <span className="text-cyber-text"><b className="text-cyber-purple">{invite.fromName}</b> зовёт в «{invite.teamName}»</span>
          <button onClick={() => onAcceptInvite(invite.teamName)} className="px-3 py-1 bg-cyber-neon text-black font-bold tracking-widest">ПРИНЯТЬ</button>
          <button onClick={onCloseInvite} className="px-2 py-1 text-cyber-muted hover:text-cyber-red">✕</button>
        </div>
      )}

      {/* Входящие запросы на вступление (видит капитан) */}
      {joinReqs.length > 0 && (
        <div className="fixed bottom-4 right-4 z-[140] flex flex-col gap-2 font-mono text-xs">
          {joinReqs.map(r => (
            <div key={r.fromUserId} className="bg-cyber-panel border border-cyber-blue shadow-blue px-4 py-3 flex items-center gap-3">
              <span className="text-cyber-text"><b className="text-cyber-blue">{r.fromName}</b> → «{r.teamName}»</span>
              <button onClick={() => onRespondJoin(r.fromUserId, true)}  className="px-3 py-1 bg-cyber-neon text-black font-bold tracking-widest">ПРИНЯТЬ</button>
              <button onClick={() => onRespondJoin(r.fromUserId, false)} className="px-2 py-1 text-cyber-muted hover:text-cyber-red">✕</button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
