import { useState, useMemo } from 'react';
import { Clock, Eye, Star } from 'lucide-react';
import ShipMap    from './ShipMap.jsx';
import Leaderboard from './Leaderboard.jsx';

const LEVEL_COLORS = ['', '#4ae54a', '#99ff44', '#ffd60a', '#ff9f0a', '#ff2d55'];

function formatTime(seconds) {
  if (seconds == null || seconds < 0) return '00:00';
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// ── Карточка задачи для учителя ──────────────────────────
// Показывает тип, уровень и цветные индикаторы статуса по каждой команде.
function TeacherTaskCard({ task, teamStatuses, activeTeams }) {
  const [showTip, setShowTip] = useState(false);

  return (
    <div
      className="border border-cyber-border p-2 text-xs bg-cyber-dark hover:bg-cyber-panel transition-colors relative cursor-default"
      onMouseEnter={() => setShowTip(true)}
      onMouseLeave={() => setShowTip(false)}
    >
      {/* Tooltip с вопросом */}
      {showTip && (
        <div className="absolute z-50 bottom-full left-0 mb-1 w-64 bg-cyber-panel border border-cyber-border p-2 text-[10px] text-cyber-text leading-snug pointer-events-none shadow-lg whitespace-pre-wrap">
          <span className="text-cyber-muted">#{task.id} УР.{task.level} · </span>
          {task.question_ru.slice(0, 120)}{task.question_ru.length > 120 ? '…' : ''}
        </div>
      )}

      {/* Верхняя строка: ID + звёздочки уровня */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-cyber-muted text-[9px]">#{task.id}</span>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={6}
              fill={i < task.level ? 'currentColor' : 'none'}
              className={i < task.level ? '' : 'text-cyber-border'}
              style={i < task.level ? { color: LEVEL_COLORS[task.level] } : {}}
            />
          ))}
        </div>
      </div>

      {/* Бейдж типа */}
      <div className="mb-1.5">
        {task.type === 'text_phrase'     && <span className="text-[8px] text-cyber-yellow  border border-cyber-yellow/40  px-1 py-px">ЛОГ</span>}
        {task.type === 'multiple_choice' && <span className="text-[8px] text-cyber-blue    border border-cyber-blue/40    px-1 py-px">ТЕСТ·1</span>}
        {task.type === 'code_repair'     && <span className="text-[8px] text-cyber-purple  border border-cyber-purple/40  px-1 py-px">КОД</span>}
      </div>

      {/* Индикаторы команд */}
      <div className="flex gap-1 flex-wrap">
        {activeTeams.map(team => {
          const st = teamStatuses[team.teamName]?.status;
          const baseClass = 'w-2.5 h-2.5 rounded-full border border-transparent flex-shrink-0';
          let style = {};
          let extra = '';
          if (st === 'solved') {
            style = { background: team.color, boxShadow: `0 0 5px ${team.color}` };
          } else if (st === 'in_progress') {
            style = { borderColor: team.color };
            extra = ' animate-pulse';
          } else if (st === 'failed' || st === 'abandoned') {
            style = { background: '#ff2d5566', borderColor: '#ff2d55' };
          } else {
            style = { borderColor: '#1a2744' };
          }
          return (
            <div key={team.teamName}
              className={baseClass + extra}
              style={style}
              title={`${team.teamName}: ${st || 'не начата'}`}
            />
          );
        })}
      </div>
    </div>
  );
}

// ── Карточка команды в правой панели ─────────────────────
function TeamCard({ team, taskPool }) {
  const statuses  = Object.values(team.taskStatuses);
  const solved    = statuses.filter(s => s.status === 'solved').length;
  const inProg    = statuses.filter(s => s.status === 'in_progress').length;
  const failed    = statuses.filter(s => s.status === 'failed').length;
  const abandoned = statuses.filter(s => s.status === 'abandoned').length;
  const activeTask = team.activeTaskId
    ? taskPool.find(t => t.id === team.activeTaskId)
    : null;
  const pct = taskPool.length > 0 ? Math.round((solved / taskPool.length) * 100) : 0;

  return (
    <div className="border p-3 space-y-2" style={{ borderColor: team.color + '44' }}>
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ background: team.color, boxShadow: `0 0 6px ${team.color}` }} />
          <span className="text-xs font-bold" style={{ color: team.color }}>
            {team.teamName.toUpperCase()}
          </span>
        </div>
        <span className="text-sm font-bold text-cyber-neon">{team.score.toLocaleString('ru')}</span>
      </div>

      {/* Участники */}
      <div className="flex flex-wrap gap-1">
        {team.members.map(m => (
          <span key={m.id}
            className="text-[9px] border px-1.5 py-px"
            style={{ borderColor: team.color + '33', color: m.isCaptain ? team.color : '#7090a0' }}>
            {m.isCaptain ? '⚡ ' : ''}{m.name}
          </span>
        ))}
        {team.members.length === 0 && (
          <span className="text-[9px] text-cyber-muted italic">нет игроков</span>
        )}
      </div>

      {/* Статистика */}
      <div className="flex gap-3 text-[10px]">
        <span className="text-cyber-neon">✓ {solved}</span>
        {inProg    > 0 && <span className="text-cyber-blue">⟳ {inProg}</span>}
        {failed    > 0 && <span className="text-cyber-red">✗ {failed}</span>}
        {abandoned > 0 && <span className="text-cyber-muted">↩ {abandoned}</span>}
      </div>

      {/* Активная задача */}
      {activeTask ? (
        <div className="text-[9px] bg-cyber-black border border-cyber-blue/30 px-2 py-1.5">
          <div className="text-cyber-blue mb-0.5 tracking-widest">
            АКТИВНА: #{activeTask.id} · УР.{activeTask.level}
          </div>
          <div className="text-cyber-muted leading-tight line-clamp-2">
            {activeTask.question_ru.slice(0, 65)}…
          </div>
        </div>
      ) : (
        <div className="text-[9px] text-cyber-muted italic">нет активной задачи</div>
      )}

      {/* Прогресс-бар */}
      <div>
        <div className="h-1 bg-cyber-dark rounded overflow-hidden">
          <div className="h-full rounded transition-all duration-500"
            style={{ width: `${pct}%`, background: team.color }} />
        </div>
        <div className="text-[9px] text-cyber-muted mt-0.5">
          {solved} / {taskPool.length} задач ({pct}%)
        </div>
      </div>
    </div>
  );
}

// ── Главный компонент ─────────────────────────────────────
export default function TeacherDashboard({
  roomState, timer, isAdmin, notification, onStartGame,
}) {
  const [filterLevel, setFilterLevel] = useState(0);
  const [filterType,  setFilterType]  = useState('all');

  const timerUrgent   = timer !== null && timer < 300;
  const timerCritical = timer !== null && timer < 60;

  const activeTeams = useMemo(
    () => Object.values(roomState.teams).filter(t => t.members.length > 0),
    [roomState.teams]
  );

  const tasksByLevel = useMemo(() => {
    const groups = { 1: [], 2: [], 3: [], 4: [], 5: [] };
    for (const t of roomState.taskPool) {
      if (filterType !== 'all' && t.type !== filterType) continue;
      groups[t.level].push(t);
    }
    const order = { text_phrase: 0, multiple_choice: 1, code_repair: 2 };
    for (const lvl of Object.keys(groups)) {
      groups[lvl].sort((a, b) => (order[a.type] ?? 9) - (order[b.type] ?? 9));
    }
    return groups;
  }, [roomState.taskPool, filterType]);

  // { taskId: { teamName: taskStatus } }
  const taskTeamStatuses = useMemo(() => {
    const map = {};
    for (const task of roomState.taskPool) map[task.id] = {};
    for (const team of Object.values(roomState.teams)) {
      for (const [taskId, st] of Object.entries(team.taskStatuses)) {
        if (map[taskId]) map[taskId][team.teamName] = st;
      }
    }
    return map;
  }, [roomState]);

  const totalSolved = useMemo(() => {
    let n = 0;
    for (const team of Object.values(roomState.teams)) {
      n += Object.values(team.taskStatuses).filter(s => s.status === 'solved').length;
    }
    return n;
  }, [roomState]);

  return (
    <div className="min-h-screen bg-cyber-dark flex flex-col font-mono select-none">

      {/* Уведомление */}
      {notification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-cyber-panel border border-cyber-purple text-cyber-purple px-6 py-3 text-sm shadow-neon animate-pulse-neon max-w-lg text-center">
          {notification}
        </div>
      )}

      {/* ── Верхняя панель ── */}
      <div className="border-b border-cyber-border bg-cyber-panel px-4 py-2 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="text-cyber-purple font-bold tracking-widest">AEGIS-X</span>
          <span className="text-[10px] border border-cyber-purple/50 text-cyber-purple px-2 py-px tracking-widest">
            УЧИТЕЛЬ
          </span>
        </div>

        <div className={`flex items-center gap-2 px-4 py-1 border font-bold text-xl tracking-widest
          ${timerCritical ? 'border-cyber-red    text-cyber-red    shadow-red animate-pulse-neon'
           : timerUrgent  ? 'border-cyber-yellow text-cyber-yellow'
                          : 'border-cyber-border text-cyber-neon'}`}>
          <Clock size={16} />
          {formatTime(timer)}
        </div>

        <div className="flex items-center gap-4 text-xs text-cyber-muted">
          <span>Команд: <span className="text-cyber-text">{activeTeams.length}</span></span>
          <span>Всего решений: <span className="text-cyber-neon font-bold">{totalSolved}</span></span>
          <span>Задач в пуле: <span className="text-cyber-text">{roomState.taskPool.length}</span></span>
        </div>

        {isAdmin && roomState.phase === 'lobby' && (
          <button onClick={onStartGame}
            className="px-4 py-1 bg-cyber-purple text-black text-xs font-bold tracking-widest hover:opacity-90">
            ▶ НАЧАТЬ
          </button>
        )}
      </div>

      {/* ── Основной макет ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* Левая: карта + лидерборд */}
        <aside className="w-72 flex-shrink-0 border-r border-cyber-border bg-cyber-panel flex flex-col overflow-y-auto hidden lg:flex">
          <div className="p-4">
            <div className="text-cyber-purple text-[10px] tracking-widest mb-3">// КАРТА КОВЧЕГА</div>
            <ShipMap mapSectors={roomState.mapSectors} teams={roomState.teams} />
          </div>
          <div className="p-4 border-t border-cyber-border">
            <Leaderboard teams={roomState.teams} mapSectors={roomState.mapSectors} />
          </div>
        </aside>

        {/* Центр: сетка задач */}
        <main className="flex-1 flex flex-col overflow-hidden">

          {/* Фильтры */}
          <div className="border-b border-cyber-border px-4 py-2 flex gap-2 items-center overflow-x-auto flex-shrink-0">
            <Eye size={12} className="text-cyber-purple flex-shrink-0" />
            <button onClick={() => setFilterLevel(0)}
              className={`px-3 py-1 text-xs tracking-widest transition whitespace-nowrap
                ${filterLevel === 0 ? 'bg-cyber-border text-cyber-text' : 'text-cyber-muted hover:text-cyber-text'}`}>
              ВСЕ
            </button>
            {[1,2,3,4,5].map(lvl => (
              <button key={lvl} onClick={() => setFilterLevel(lvl)}
                className={`px-3 py-1 text-xs tracking-widest transition whitespace-nowrap
                  ${filterLevel === lvl ? 'text-black font-bold' : 'text-cyber-muted hover:text-cyber-text'}`}
                style={filterLevel === lvl ? { background: LEVEL_COLORS[lvl] } : {}}>
                УР.{lvl}
              </button>
            ))}

            <div className="border-l border-cyber-border h-4 mx-1" />
            {[
              { key: 'all',             label: 'ВСЕ'    },
              { key: 'text_phrase',     label: 'ЛОГИКА' },
              { key: 'multiple_choice', label: 'ТЕСТ'   },
              { key: 'code_repair',     label: 'КОД'    },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setFilterType(key)}
                className={`px-3 py-1 text-xs tracking-widest transition whitespace-nowrap
                  ${filterType === key ? 'bg-cyber-purple text-black font-bold' : 'text-cyber-muted hover:text-cyber-text'}`}>
                {label}
              </button>
            ))}

            {/* Легенда команд */}
            <div className="ml-auto flex items-center gap-3 flex-shrink-0">
              {activeTeams.map(t => (
                <div key={t.teamName} className="flex items-center gap-1 text-[9px]">
                  <div className="w-2 h-2 rounded-full" style={{ background: t.color }} />
                  <span className="text-cyber-muted">{t.teamName}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Сетка */}
          <div className="flex-1 overflow-y-auto p-4 cyber-grid">
            {(filterLevel === 0 ? [1,2,3,4,5] : [filterLevel]).map(lvl => (
              <div key={lvl} className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px flex-1 bg-cyber-border" />
                  <span className="text-[10px] tracking-widest px-2" style={{ color: LEVEL_COLORS[lvl] }}>
                    Уровень {lvl} ({tasksByLevel[lvl]?.length || 0} задач)
                  </span>
                  <div className="h-px flex-1 bg-cyber-border" />
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-7 gap-2">
                  {(tasksByLevel[lvl] || []).map(task => (
                    <TeacherTaskCard
                      key={task.id}
                      task={task}
                      teamStatuses={taskTeamStatuses[task.id] || {}}
                      activeTeams={activeTeams}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* Правая: обзор команд */}
        <aside className="w-72 flex-shrink-0 border-l border-cyber-border bg-cyber-panel flex flex-col overflow-y-auto hidden md:flex">
          <div className="p-4">
            <div className="text-cyber-purple text-[10px] tracking-widest mb-3">// КОМАНДЫ</div>
            <div className="space-y-3">
              {Object.values(roomState.teams)
                .sort((a, b) => b.score - a.score)
                .map(team => (
                  <TeamCard key={team.teamName} team={team} taskPool={roomState.taskPool} />
                ))}
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
