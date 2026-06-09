import { Trophy, Star, Users, Target, Clock } from 'lucide-react';

export default function GameOver({ gameOver, roomState }) {
  const scores = gameOver.scores || [];
  const winner = scores[0];

  return (
    <div className="min-h-screen bg-cyber-dark cyber-grid flex flex-col items-center justify-center p-6 font-mono">
      {/* Title */}
      <div className="text-center mb-8">
        {gameOver.reason === 'all_sectors' ? (
          <>
            <div className="text-5xl mb-3">🏆</div>
            <div className="text-cyber-neon text-2xl font-bold tracking-widest text-shadow-neon mb-2">
              КОВЧЕГ ОСВОБОЖДЁН
            </div>
          </>
        ) : (
          <>
            <div className="text-5xl mb-3">⏰</div>
            <div className="text-cyber-yellow text-2xl font-bold tracking-widest mb-2">
              ВРЕМЯ ВЫШЛО
            </div>
          </>
        )}
        <div className="text-cyber-muted text-sm">{gameOver.message_ru}</div>
      </div>

      {/* Winner card */}
      {winner && (
        <div
          className="border-2 px-8 py-4 mb-6 text-center"
          style={{ borderColor: winner.color, boxShadow: `0 0 20px ${winner.color}44` }}
        >
          <div className="text-xs text-cyber-muted tracking-widest mb-1">ПОБЕДИТЕЛЬ</div>
          <div className="text-2xl font-bold tracking-widest" style={{ color: winner.color }}>
            КОМАНДА {winner.teamName.toUpperCase()}
          </div>
          <div className="text-3xl font-bold mt-1" style={{ color: winner.color }}>
            {winner.score.toLocaleString('ru')} очков
          </div>
        </div>
      )}

      {/* Full scoreboard */}
      <div className="w-full max-w-lg bg-cyber-panel border border-cyber-border">
        <div className="border-b border-cyber-border px-4 py-2 flex items-center gap-2">
          <Trophy size={14} className="text-cyber-yellow" />
          <span className="text-cyber-yellow text-xs font-bold tracking-widest">ФИНАЛЬНЫЕ РЕЗУЛЬТАТЫ</span>
        </div>
        <div className="divide-y divide-cyber-border">
          {scores.map((team, idx) => {
            const teamData = roomState?.teams?.[team.teamName];
            const solved = teamData
              ? Object.values(teamData.taskStatuses).filter(s => s.status === 'solved').length
              : 0;
            return (
              <div key={team.teamName} className="px-4 py-3 flex items-center gap-4">
                <div className="text-cyber-muted w-6 font-bold">
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`}
                </div>
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ background: team.color, boxShadow: `0 0 6px ${team.color}` }}
                />
                <div className="flex-1">
                  <div className="text-sm font-bold" style={{ color: team.color }}>
                    {team.teamName}
                  </div>
                  <div className="text-[10px] text-cyber-muted flex gap-3 mt-0.5">
                    <span className="flex items-center gap-1"><Target size={8} /> {solved} задач</span>
                    <span className="flex items-center gap-1"><Users size={8} /> {team.members} игроков</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg" style={{ color: idx === 0 ? team.color : '#c8d8f0' }}>
                    {team.score.toLocaleString('ru')}
                  </div>
                  <div className="text-[10px] text-cyber-muted">очков</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={() => window.location.reload()}
        className="mt-6 px-8 py-3 border border-cyber-border text-cyber-muted hover:border-cyber-neon hover:text-cyber-neon transition text-xs tracking-widest"
      >
        НОВАЯ ИГРА
      </button>

      <div className="mt-4 text-[10px] text-cyber-muted text-center max-w-sm">
        Aegis-X нейтрализован. Экипаж ковчега «Надежда-VII» благодарит команды хакеров
        за восстановление контроля над кораблём.
      </div>
    </div>
  );
}
