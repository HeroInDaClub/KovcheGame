import { useMemo } from 'react';
import { Clock } from 'lucide-react';
import ShipMap from './ShipMap.jsx';

const TOTAL_SECTORS = 12;

function formatTime(seconds) {
  if (seconds == null || seconds < 0) return '00:00';
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// ── Горизонтальный HUD-бар команды ───────────────────────
// Неоновый сегментный прогресс = захваченные секторы из 12.
function TeamHudBar({ team, captured }) {
  const pct = Math.round((captured / TOTAL_SECTORS) * 100);
  return (
    <div
      className="flex-1 min-w-[180px] max-w-[340px] border bg-cyber-dark px-3 py-2.5 flex flex-col gap-2 overflow-hidden"
      style={{ borderColor: team.color + '55' }}
    >
      {/* Название + счёт */}
      <div className="flex items-center justify-between gap-2 min-w-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ background: team.color, boxShadow: `0 0 6px ${team.color}` }} />
          {/* ellipsis для длинных кастомных названий — не ломает сетку HUD */}
          <span className="text-xs font-bold truncate" style={{ color: team.color }} title={team.teamName}>
            {team.teamName.toUpperCase()}
          </span>
        </div>
        <span className="text-base font-bold text-cyber-neon flex-shrink-0 tabular-nums">
          {team.score.toLocaleString('ru')}
        </span>
      </div>

      {/* Сегментный неоновый прогресс-бар (12 секторов) */}
      <div className="flex-1 flex gap-1 min-h-[34px]">
        {Array.from({ length: TOTAL_SECTORS }).map((_, i) => {
          const on = i < captured;
          return (
            <div
              key={i}
              className={`flex-1 rounded-[2px] transition-all duration-500 ${on ? 'animate-pulse-neon' : ''}`}
              style={on
                ? { background: team.color, boxShadow: `0 0 8px ${team.color}, 0 0 16px ${team.color}66` }
                : { background: '#0a0f1e', boxShadow: 'inset 0 0 0 1px #1a2744' }}
            />
          );
        })}
      </div>

      {/* Подвал */}
      <div className="flex items-center justify-between text-[10px] text-cyber-muted min-w-0">
        <span className="font-bold flex-shrink-0" style={{ color: team.color }}>{captured}/{TOTAL_SECTORS}</span>
        <span className="truncate ml-2">{pct}% · 👤 {team.members.length}</span>
      </div>
    </div>
  );
}

// ── Главный компонент (проекторный режим) ────────────────
export default function TeacherDashboard({
  roomState, timer, isAdmin, notification, onStartGame, onForceEnd,
}) {
  const timerUrgent   = timer !== null && timer < 300;
  const timerCritical = timer !== null && timer < 60;

  // Захваченных секторов на команду — из room_state.mapSectors
  const sectorsByTeam = useMemo(() => {
    const m = {};
    for (const s of roomState.mapSectors) if (s.capturedBy) m[s.capturedBy] = (m[s.capturedBy] || 0) + 1;
    return m;
  }, [roomState.mapSectors]);

  const capturedTotal = useMemo(
    () => roomState.mapSectors.filter(s => s.capturedBy).length,
    [roomState.mapSectors]
  );

  const hudTeams = useMemo(
    () => Object.values(roomState.teams)
      .filter(t => t.members.length > 0)
      .sort((a, b) => b.score - a.score),
    [roomState.teams]
  );

  return (
    <div className="h-screen bg-cyber-dark flex flex-col font-mono select-none overflow-hidden">

      {/* Уведомление */}
      {notification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[120] bg-cyber-panel border border-cyber-purple text-cyber-purple px-6 py-3 text-sm shadow-neon animate-pulse-neon max-w-lg text-center">
          {notification}
        </div>
      )}

      {/* ── Компактная верхняя панель ── */}
      <header className="flex-shrink-0 border-b border-cyber-border bg-cyber-panel px-4 py-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-cyber-purple font-bold tracking-widest">AEGIS-X</span>
          <span className="text-[10px] border border-cyber-purple/50 text-cyber-purple px-2 py-px tracking-widest">
            УЧИТЕЛЬ · ТРАНСЛЯЦИЯ
          </span>
        </div>

        <div className="flex items-center gap-5 text-xs text-cyber-muted">
          <span>Команд: <span className="text-cyber-text font-bold">{hudTeams.length}</span></span>
          <span>Захвачено: <span className="text-cyber-neon font-bold">{capturedTotal}/{TOTAL_SECTORS}</span></span>
        </div>

        <div className={`flex items-center gap-2 px-4 py-1 border font-bold text-xl tracking-widest
          ${timerCritical ? 'border-cyber-red    text-cyber-red    shadow-red animate-pulse-neon'
           : timerUrgent  ? 'border-cyber-yellow text-cyber-yellow'
                          : 'border-cyber-border text-cyber-neon'}`}>
          <Clock size={16} />
          {formatTime(timer)}
        </div>

        {isAdmin && roomState.phase === 'lobby' && (
          <button onClick={onStartGame}
            className="px-4 py-1 bg-cyber-purple text-black text-xs font-bold tracking-widest hover:opacity-90">
            ▶ НАЧАТЬ
          </button>
        )}

        {isAdmin && roomState.phase === 'playing' && (
          <button onClick={() => { if (confirm('Завершить игру досрочно для всех?')) onForceEnd(); }}
            className="px-4 py-1 border border-cyber-red text-cyber-red text-xs font-bold tracking-widest hover:bg-cyber-red hover:text-black transition">
            🛑 ЗАВЕРШИТЬ ИГРУ
          </button>
        )}
      </header>

      {/* ── Центр: карта на весь viewport (для проектора) ── */}
      <main className="flex-1 min-h-0 relative flex items-center justify-center p-3 cyber-grid">
        <div className="absolute top-2 left-3 text-cyber-purple text-[10px] tracking-widest pointer-events-none z-10">
          // КАРТА КОВЧЕГА
        </div>
        <ShipMap variant="projector" mapSectors={roomState.mapSectors} teams={roomState.teams} />
      </main>

      {/* ── Низ: горизонтальный HUD команд ── */}
      <footer className="flex-shrink-0 h-[27vh] min-h-[150px] border-t border-cyber-border bg-cyber-panel px-4 py-2.5 flex flex-col gap-2">
        <div className="text-cyber-purple text-[10px] tracking-widest flex-shrink-0">
          // КОМАНДЫ · ЗАХВАТ СЕКТОРОВ
        </div>
        {hudTeams.length > 0 ? (
          <div className="flex-1 flex gap-3 overflow-x-auto overflow-y-hidden items-stretch pb-1">
            {hudTeams.map(team => (
              <TeamHudBar key={team.teamName} team={team} captured={sectorsByTeam[team.teamName] || 0} />
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-cyber-muted text-xs italic">
            Ожидание подключения команд…
          </div>
        )}
      </footer>
    </div>
  );
}
