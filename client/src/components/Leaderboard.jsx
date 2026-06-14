import { Trophy, Users, Target } from 'lucide-react';

export default function Leaderboard({ teams, mapSectors }) {
  const ranked = Object.values(teams)
    .filter(t => t.members.length > 0)   // только команды с игроками
    .map(t => ({
      ...t,
      captured: mapSectors.filter(s => s.capturedBy === t.teamName).length,
      solved:   Object.values(t.taskStatuses).filter(s => s.status === 'solved').length,
    }))
    .sort((a, b) => b.score - a.score);

  return (
    <div className="bg-cyber-panel border border-cyber-border p-4 font-mono">
      <div className="flex items-center gap-2 mb-3">
        <Trophy size={14} className="text-cyber-yellow" />
        <span className="text-cyber-yellow text-xs font-bold tracking-widest">ТАБЛИЦА ЛИДЕРОВ</span>
      </div>

      <div className="space-y-2 overflow-y-auto max-h-64 pr-1">
        {ranked.map((team, idx) => (
          <div key={team.teamName} className="flex items-center gap-3">
            {/* Rank */}
            <div className="text-cyber-muted text-xs w-4">{idx + 1}.</div>

            {/* Team color dot */}
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: team.color, boxShadow: `0 0 6px ${team.color}` }}
            />

            {/* Name */}
            <div className="text-xs flex-1 min-w-0" style={{ color: team.color }}>
              {team.teamName}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3 text-[10px] text-cyber-muted">
              <span className="flex items-center gap-1">
                <Target size={9} />
                {team.solved}
              </span>
              <span className="flex items-center gap-1">
                <Users size={9} />
                {team.members.length}
              </span>
            </div>

            {/* Score */}
            <div
              className="text-sm font-bold w-16 text-right"
              style={{ color: idx === 0 ? team.color : '#c8d8f0' }}
            >
              {team.score.toLocaleString('ru')}
            </div>
          </div>
        ))}
      </div>

      {/* Sector progress bar */}
      <div className="mt-4 pt-3 border-t border-cyber-border">
        <div className="text-[10px] text-cyber-muted mb-2 tracking-widest">ЗАХВАТ СЕКТОРОВ</div>
        <div className="flex h-2 rounded overflow-hidden bg-cyber-dark">
          {ranked.filter(t => t.captured > 0).map(t => (
            <div
              key={t.teamName}
              style={{
                width: `${(t.captured / mapSectors.length) * 100}%`,
                background: t.color,
                opacity: 0.85,
              }}
              title={`${t.teamName}: ${t.captured}`}
            />
          ))}
        </div>
        <div className="flex justify-between text-[9px] text-cyber-muted mt-1">
          <span>0</span>
          <span>{mapSectors.filter(s => s.capturedBy).length} / {mapSectors.length} захвачено</span>
          <span>{mapSectors.length}</span>
        </div>
      </div>
    </div>
  );
}
