import { Users, Shield, Zap, Crown } from 'lucide-react';

export default function Lobby({ roomState, roomId, playerName, isAdmin, notification, onSelectTeam, onStartGame }) {
  const allTeams    = Object.values(roomState.teams);
  const totalPlayers = allTeams.reduce((s, t) => s + t.members.length, 0);
  const myTeam      = allTeams.find(t => t.members.some(m => m.name === playerName));

  return (
    <div className="min-h-screen bg-cyber-dark cyber-grid flex flex-col font-mono">
      {notification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-cyber-panel border border-cyber-neon text-cyber-neon px-6 py-3 rounded text-sm shadow-neon animate-pulse-neon">
          {notification}
        </div>
      )}

      {/* Header */}
      <div className="border-b border-cyber-border px-6 py-4 flex items-center justify-between bg-cyber-panel flex-wrap gap-3">
        <div>
          <span className="text-cyber-neon font-bold tracking-widest text-lg">AEGIS-X</span>
          <span className="text-cyber-muted text-xs ml-3">// ЛОББИ</span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-cyber-muted">КОМНАТА:</span>
          <span className="text-cyber-neon font-bold tracking-[0.4em] text-lg">{roomId}</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-cyber-muted">
          <span className="flex items-center gap-1"><Users size={13} />{totalPlayers} игроков</span>
          <span>{allTeams.length} команд</span>
          <span>{roomState.totalTasksCount ?? '?'} задач</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 max-w-6xl mx-auto w-full">

        {/* Lore banner */}
        <div className="border border-cyber-border bg-cyber-panel p-4 text-cyber-muted text-sm">
          <span className="text-cyber-blue">[СИСТЕМА]</span> Межзвёздный ковчег «Надежда-VII» захвачен рогаи ИИ Aegis-X.
          Выберите команду и ждите сигнала командира. Отсчёт до взлома начнётся по команде учителя.
        </div>

        {/* Team grid — адаптивная сетка под любое число команд */}
        <div className={`grid gap-3
          ${allTeams.length <= 4  ? 'grid-cols-2 lg:grid-cols-4'  : ''}
          ${allTeams.length > 4  && allTeams.length <= 9  ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'  : ''}
          ${allTeams.length > 9  && allTeams.length <= 16 ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : ''}
          ${allTeams.length > 16 ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6' : ''}
        `}>
          {allTeams.map(team => {
            const isMine = myTeam?.teamName === team.teamName;
            const c      = team.color;
            return (
              <div
                key={team.teamName}
                onClick={() => onSelectTeam(team.teamName)}
                className="border p-3 cursor-pointer transition-all duration-200 bg-cyber-dark hover:bg-cyber-panel"
                style={{
                  borderColor:  isMine ? c : '#1a2744',
                  boxShadow:    isMine ? `0 0 12px ${c}44, 0 0 24px ${c}22` : 'none',
                }}
              >
                {/* Team name */}
                <div className="text-xs font-bold tracking-widest mb-2 flex items-center gap-1"
                  style={{ color: isMine ? c : '#c8d8f0' }}>
                  {isMine && <Crown size={10} />}
                  {team.teamName.toUpperCase()}
                </div>

                {/* Members */}
                <div className="space-y-0.5 min-h-[24px]">
                  {team.members.length === 0 && (
                    <div className="text-cyber-muted text-[10px] italic">Нет игроков</div>
                  )}
                  {team.members.map(m => (
                    <div key={m.id} className="flex items-center gap-1.5 text-[10px]">
                      {m.isCaptain
                        ? <Shield size={9}  style={{ color: c }} />
                        : <Zap    size={9}  className="text-cyber-muted" />
                      }
                      <span style={{ color: m.isCaptain ? c : '#a0b4c8' }}>{m.name}</span>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="mt-2 text-[9px] tracking-widest" style={{ color: c, opacity: 0.6 }}>
                  {team.members.length} игр. · {isMine ? '[ ВЫБРАНА ]' : '[ ВЫБРАТЬ ]'}
                </div>
              </div>
            );
          })}
        </div>

        {/* Rules */}
        <div className="border border-cyber-border p-4 text-xs text-cyber-muted space-y-1">
          <div className="text-cyber-blue mb-2 font-bold">// ПРАВИЛА</div>
          <div>• Первый вошедший в команду становится <span className="text-cyber-neon">капитаном</span>.</div>
          <div>• Капитан выбирает задачи — они открываются для <span className="text-cyber-text">всей команды</span> одновременно.</div>
          <div>• Правильный ответ захватывает сектор корабля и приносит очки.</div>
          <div>• «Покинуть задачу» → карточка <span className="text-cyber-red">блокируется навсегда</span> для вашей команды.</div>
          <div>• Побеждает команда с наибольшим счётом по истечении времени.</div>
        </div>

        {isAdmin && (
          <button
            onClick={onStartGame}
            disabled={totalPlayers < 1}
            className="w-full py-4 bg-cyber-neon text-black font-bold tracking-widest uppercase text-lg hover:opacity-90 transition disabled:opacity-30"
          >
            ⚡ НАЧАТЬ ИГРУ ({totalPlayers} игроков)
          </button>
        )}
        {!isAdmin && (
          <div className="text-center text-cyber-muted text-xs animate-pulse-neon pb-4">
            Ожидание запуска игры учителем…
          </div>
        )}
      </div>
    </div>
  );
}
