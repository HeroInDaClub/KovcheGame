import { useState, useMemo } from 'react';
import { Clock, BookOpen } from 'lucide-react';
import ShipMap             from './ShipMap.jsx';
import TaskCard            from './TaskCard.jsx';
import Leaderboard         from './Leaderboard.jsx';
import MultipleChoicePanel from './MultipleChoicePanel.jsx';
import CodeRepairPanel     from './CodeRepairPanel.jsx';

const LEVEL_LABELS = ['', 'Уровень 1', 'Уровень 2', 'Уровень 3', 'Уровень 4', 'Уровень 5'];
const LEVEL_COLORS = ['', '#4ae54a', '#99ff44', '#ffd60a', '#ff9f0a', '#ff2d55'];

function formatTime(seconds) {
  if (seconds == null || seconds < 0) return '00:00';
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function Dashboard({
  roomState, timer, activeTask, taskResult,
  playerName, isAdmin, notification,
  onPickTask, onSubmit, onAbandon, onStartGame,
}) {
  const [filterLevel, setFilterLevel] = useState(0);
  const [filterType,  setFilterType]  = useState('all'); // all | multiple_choice | code_repair

  const myTeam = useMemo(
    () => Object.values(roomState.teams).find(t => t.members.some(m => m.name === playerName)),
    [roomState, playerName]
  );
  const isCaptain = myTeam?.captainId
    ? myTeam.members.find(m => m.name === playerName)?.isCaptain
    : false;

  const tasksByLevel = useMemo(() => {
    const groups = { 1: [], 2: [], 3: [], 4: [], 5: [] };
    for (const t of roomState.taskPool) {
      if (filterType !== 'all' && t.type !== filterType) continue;
      groups[t.level].push(t);
    }
    return groups;
  }, [roomState.taskPool, filterType]);

  const getTaskStatus = (taskId) => {
    const st = myTeam?.taskStatuses?.[taskId];
    return st?.status || 'available';
  };

  const timerUrgent   = timer !== null && timer < 300;
  const timerCritical = timer !== null && timer < 60;

  return (
    <div className="min-h-screen bg-cyber-dark flex flex-col font-mono select-none">
      {/* ── Global Notification ──────────────────────────── */}
      {notification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-cyber-panel border border-cyber-neon text-cyber-neon px-6 py-3 rounded text-sm shadow-neon animate-pulse-neon max-w-lg text-center">
          {notification}
        </div>
      )}

      {/* ── Top Bar ──────────────────────────────────────── */}
      <div className="border-b border-cyber-border bg-cyber-panel px-4 py-2 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="text-cyber-neon font-bold tracking-widest">AEGIS-X</span>
          <span className="text-cyber-muted text-xs hidden sm:block">// КИБЕР-ОСАДА</span>
        </div>

        {/* Timer */}
        <div className={`flex items-center gap-2 px-4 py-1 border font-bold text-xl tracking-widest
          ${timerCritical
            ? 'border-cyber-red text-cyber-red shadow-red animate-pulse-neon'
            : timerUrgent
              ? 'border-cyber-yellow text-cyber-yellow'
              : 'border-cyber-border text-cyber-neon'
          }`}
        >
          <Clock size={16} />
          {formatTime(timer)}
        </div>

        {/* My team */}
        {myTeam && (
          <div className="flex items-center gap-2 text-xs" style={{ color: myTeam.color }}>
            <div className="w-2 h-2 rounded-full" style={{ background: myTeam.color, boxShadow: `0 0 6px ${myTeam.color}` }} />
            КОМАНДА {myTeam.teamName.toUpperCase()}
            {isCaptain && <span className="text-cyber-muted">(капитан)</span>}
            <span className="text-cyber-muted">· {myTeam.score} очков</span>
          </div>
        )}

        {isAdmin && roomState.phase === 'lobby' && (
          <button onClick={onStartGame} className="px-4 py-1 bg-cyber-neon text-black text-xs font-bold tracking-widest hover:opacity-90">
            ▶ НАЧАТЬ
          </button>
        )}
      </div>

      {/* ── Main Layout ──────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left: Ship Map + Leaderboard */}
        <aside className="w-64 flex-shrink-0 border-r border-cyber-border bg-cyber-panel flex flex-col overflow-y-auto hidden lg:flex">
          <div className="p-4">
            <div className="text-cyber-blue text-[10px] tracking-widest mb-3">// КАРТА КОВЧЕГА</div>
            <ShipMap mapSectors={roomState.mapSectors} teams={roomState.teams} />
          </div>
          <div className="p-4 border-t border-cyber-border">
            <Leaderboard teams={roomState.teams} mapSectors={roomState.mapSectors} />
          </div>
        </aside>

        {/* Center: Task Grid */}
        <main className="flex-1 flex flex-col overflow-hidden">

          {/* Level filter tabs */}
          <div className="border-b border-cyber-border px-4 py-2 flex gap-2 items-center overflow-x-auto flex-shrink-0">
            <button
              onClick={() => setFilterLevel(0)}
              className={`px-3 py-1 text-xs tracking-widest transition whitespace-nowrap ${filterLevel === 0 ? 'bg-cyber-border text-cyber-text' : 'text-cyber-muted hover:text-cyber-text'}`}
            >
              ВСЕ
            </button>
            {[1, 2, 3, 4, 5].map(lvl => (
              <button
                key={lvl}
                onClick={() => setFilterLevel(lvl)}
                className={`px-3 py-1 text-xs tracking-widest transition whitespace-nowrap ${filterLevel === lvl ? 'text-black font-bold' : 'text-cyber-muted hover:text-cyber-text'}`}
                style={filterLevel === lvl ? { background: LEVEL_COLORS[lvl] } : {}}
              >
                УР.{lvl}
              </button>
            ))}

            {/* Type filter */}
            <div className="border-l border-cyber-border h-4 mx-1" />
            {[
              { key: 'all',             label: 'ТИП: ВСЕ' },
              { key: 'multiple_choice', label: 'ТЕСТ'  },
              { key: 'code_repair',     label: 'КОД'   },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilterType(key)}
                className={`px-3 py-1 text-xs tracking-widest transition whitespace-nowrap ${
                  filterType === key ? 'bg-cyber-blue text-black font-bold' : 'text-cyber-muted hover:text-cyber-text'
                }`}
              >
                {label}
              </button>
            ))}

            <div className="ml-auto text-[10px] text-cyber-muted whitespace-nowrap">
              {isCaptain ? '⚡ Капитан' : '👤 Участник'}
            </div>
          </div>

          {/* Task grid scroll area */}
          <div className="flex-1 overflow-y-auto p-4 cyber-grid">
            {(filterLevel === 0 ? [1, 2, 3, 4, 5] : [filterLevel]).map(lvl => (
              <div key={lvl} className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px flex-1 bg-cyber-border" />
                  <span className="text-[10px] tracking-widest px-2" style={{ color: LEVEL_COLORS[lvl] }}>
                    {LEVEL_LABELS[lvl]} ({tasksByLevel[lvl]?.length || 0} задач)
                  </span>
                  <div className="h-px flex-1 bg-cyber-border" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2">
                  {(tasksByLevel[lvl] || []).map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      status={getTaskStatus(task.id)}
                      isCaptain={isCaptain}
                      isActive={myTeam?.activeTaskId === task.id}
                      onPick={onPickTask}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* Right: Active Task Panel */}
        <aside className="w-80 flex-shrink-0 border-l border-cyber-border bg-cyber-panel flex flex-col overflow-hidden hidden md:flex">
          {activeTask ? (
            <ActiveTaskDispatcher
              task={activeTask} result={taskResult} isCaptain={isCaptain}
              onSubmit={onSubmit} onAbandon={onAbandon}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-cyber-muted gap-3">
              <BookOpen size={32} strokeWidth={1} />
              <div className="text-xs">
                {isCaptain
                  ? 'Выберите задачу из сетки слева, чтобы открыть её для всей команды.'
                  : 'Ожидайте, пока капитан выберет задачу.'}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Mobile: Active Task Modal */}
      {activeTask && (
        <div className="md:hidden fixed inset-0 z-40 bg-cyber-dark/95 flex flex-col">
          <ActiveTaskDispatcher
            task={activeTask} result={taskResult} isCaptain={isCaptain}
            onSubmit={onSubmit} onAbandon={onAbandon}
          />
        </div>
      )}
    </div>
  );
}

// ── Активная задача: диспатчер по типу ─────────────────────
function ActiveTaskDispatcher({ task, result, isCaptain, onSubmit, onAbandon }) {
  if (task.type === 'multiple_choice') {
    return <MultipleChoicePanel
      task={task} result={result} isCaptain={isCaptain}
      onSubmit={onSubmit} onAbandon={onAbandon} />;
  }
  if (task.type === 'code_repair') {
    return <CodeRepairPanel
      task={task} result={result} isCaptain={isCaptain}
      onSubmit={onSubmit} onAbandon={onAbandon} />;
  }
  return <div className="p-6 text-cyber-red text-xs">Неизвестный тип задачи: {task.type}</div>;
}

