import { Users, Shield, Zap, Crown } from 'lucide-react';

const TEAM_STYLES = {
  'Альфа':  { border: 'border-[#00f5a0]', text: 'text-[#00f5a0]',  bg: 'bg-[#00f5a0]',  glow: 'shadow-neon' },
  'Бета':   { border: 'border-[#00c8ff]', text: 'text-[#00c8ff]',  bg: 'bg-[#00c8ff]',  glow: 'shadow-blue' },
  'Гамма':  { border: 'border-[#9b30ff]', text: 'text-[#9b30ff]',  bg: 'bg-[#9b30ff]',  glow: 'shadow-purple' },
  'Дельта': { border: 'border-[#ffd60a]', text: 'text-[#ffd60a]',  bg: 'bg-[#ffd60a]',  glow: 'shadow-[0_0_8px_#ffd60a,0_0_20px_#ffd60a44]' },
};

export default function Lobby({ roomState, roomId, playerName, isAdmin, notification, onSelectTeam, onStartGame }) {
  const allTeams = Object.values(roomState.teams);
  const totalPlayers = allTeams.reduce((s, t) => s + t.members.length, 0);
  const myTeam = allTeams.find(t => t.members.some(m => m.name === playerName));

  return (
    <div className="min-h-screen bg-cyber-dark cyber-grid flex flex-col font-mono">
      {notification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-cyber-panel border border-cyber-neon text-cyber-neon px-6 py-3 rounded text-sm shadow-neon animate-pulse-neon">
          {notification}
        </div>
      )}

      {/* Header */}
      <div className="border-b border-cyber-border px-6 py-4 flex items-center justify-between bg-cyber-panel">
        <div>
          <span className="text-cyber-neon font-bold tracking-widest text-lg">AEGIS-X</span>
          <span className="text-cyber-muted text-xs ml-3">// ЛОББИ</span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="text-cyber-muted">КОД КОМНАТЫ:</span>
          <span className="text-cyber-neon font-bold tracking-[0.4em] text-lg">{roomId}</span>
        </div>
        <div className="flex items-center gap-2 text-cyber-muted text-xs">
          <Users size={14} />
          <span>{totalPlayers} игроков</span>
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col gap-6 max-w-5xl mx-auto w-full">
        {/* Lore banner */}
        <div className="border border-cyber-border bg-cyber-panel p-4 text-cyber-muted text-sm">
          <span className="text-cyber-blue">[СИСТЕМА]</span> Межзвёздный ковчег «Надежда-VII» захвачен рогаи ИИ Aegis-X.
          Выберите команду и ждите сигнала командира. Отсчёт до взлома начнётся по команде учителя.
        </div>

        {/* Team selection grid */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {allTeams.map(team => {
            const style = TEAM_STYLES[team.teamName] || {};
            const isMine = myTeam?.teamName === team.teamName;
            return (
              <div
                key={team.teamName}
                onClick={() => onSelectTeam(team.teamName)}
                className={`border p-4 cursor-pointer transition-all duration-200 bg-cyber-dark hover:bg-cyber-panel
                  ${style.border} ${isMine ? style.glow + ' bg-cyber-panel' : 'border-cyber-border hover:' + style.border}
                `}
              >
                <div className={`text-sm font-bold tracking-widest mb-3 ${isMine ? style.text : 'text-cyber-text'}`}>
                  {isMine && <Crown size={12} className="inline mr-1 mb-0.5" />}
                  КОМАНДА {team.teamName.toUpperCase()}
                </div>
                <div className="space-y-1">
                  {team.members.length === 0 && (
                    <div className="text-cyber-muted text-xs italic">Нет игроков</div>
                  )}
                  {team.members.map(m => (
                    <div key={m.id} className="flex items-center gap-2 text-xs">
                      {m.isCaptain
                        ? <Shield size={10} className={style.text} />
                        : <Zap    size={10} className="text-cyber-muted" />
                      }
                      <span className={m.isCaptain ? style.text : 'text-cyber-text'}>{m.name}</span>
                      {m.isCaptain && <span className="text-[10px] text-cyber-muted">(капитан)</span>}
                    </div>
                  ))}
                </div>
                <div className={`mt-3 text-[10px] tracking-widest ${style.text} opacity-70`}>
                  {team.members.length} / ∞
                </div>
              </div>
            );
          })}
        </div>

        {/* Instructions */}
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
          <div className="text-center text-cyber-muted text-xs animate-pulse-neon">
            Ожидание запуска игры учителем…
          </div>
        )}
      </div>
    </div>
  );
}
