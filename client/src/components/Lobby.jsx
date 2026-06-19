import { useState } from 'react';
import { Users, Shield, Zap, Crown, Plus, UserX, Trash2, LogIn, User, Clock } from 'lucide-react';

const DURATIONS = [15, 30, 45, 60, 90];   // минуты

export default function Lobby({
  roomState, roomId, playerName, isAdmin, notification,
  onSelectTeam, onCreateTeam, onKickMember, onDeleteTeam, onStartGame,
  onOpenProfile, onViewPlayer, myUserId,
}) {
  const allTeams     = Object.values(roomState.teams);
  const totalPlayers = allTeams.reduce((s, t) => s + t.members.length, 0);
  const maxTeams     = roomState.maxTeams ?? 25;
  const myTeam       = allTeams.find(t => t.members.some(m => m.name === playerName));
  const iAmCaptain   = !!myTeam && myTeam.members.find(m => m.name === playerName)?.isCaptain;
  const canCreate    = allTeams.length < maxTeams;

  const [newName, setNewName]   = useState('');
  const [creating, setCreating] = useState(false);
  const [duration, setDuration] = useState(Math.round((roomState.gameDuration || 2700) / 60));

  const submitCreate = () => {
    const n = newName.trim();
    if (!n) return;
    onCreateTeam(n);
    setNewName('');
    setCreating(false);
  };

  return (
    <div className="min-h-screen bg-cyber-dark cyber-grid flex flex-col font-mono">
      {notification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-cyber-panel border border-cyber-neon text-cyber-neon px-6 py-3 rounded text-sm shadow-neon animate-pulse-neon max-w-lg text-center">
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
          <span>{allTeams.length}/{maxTeams} команд</span>
          <span>{roomState.totalTasksCount ?? '?'} задач</span>
          {!isAdmin && (
            <button onClick={onOpenProfile}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-cyber-neon text-cyber-neon hover:bg-cyber-neon hover:text-black transition tracking-widest">
              <User size={13} /> МОЙ ПРОФИЛЬ
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 max-w-6xl mx-auto w-full">

        {/* Lore + статус игрока */}
        <div className="border border-cyber-border bg-cyber-panel p-4 text-cyber-muted text-sm flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-cyber-blue">[СИСТЕМА]</span> Создайте команду или войдите в существующую.
            {isAdmin
              ? <span className="text-cyber-purple"> Вы — учитель: можно удалять команды.</span>
              : myTeam
                ? <span style={{ color: myTeam.color }}> Вы в команде «{myTeam.teamName}»{iAmCaptain ? ' (капитан)' : ''}.</span>
                : <span className="text-cyber-yellow"> Вы пока не распределены.</span>}
          </div>
          {canCreate && !isAdmin && (
            creating ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={newName}
                  maxLength={24}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && submitCreate()}
                  placeholder="Название команды"
                  className="bg-cyber-dark border border-cyber-neon text-cyber-text px-3 py-1.5 text-xs focus:outline-none w-44"
                />
                <button onClick={submitCreate} disabled={!newName.trim()}
                  className="px-3 py-1.5 bg-cyber-neon text-black text-xs font-bold tracking-widest hover:opacity-90 disabled:opacity-30">
                  СОЗДАТЬ
                </button>
                <button onClick={() => { setCreating(false); setNewName(''); }}
                  className="text-cyber-muted text-xs hover:text-cyber-text">✕</button>
              </div>
            ) : (
              <button onClick={() => setCreating(true)}
                className="flex items-center gap-1.5 px-4 py-2 border border-cyber-neon text-cyber-neon text-xs font-bold tracking-widest hover:bg-cyber-neon hover:text-black transition">
                <Plus size={13} /> СОЗДАТЬ КОМАНДУ
              </button>
            )
          )}
          {!canCreate && !isAdmin && (
            <span className="text-cyber-red text-xs">Достигнут лимит команд ({maxTeams})</span>
          )}
        </div>

        {/* Team grid */}
        <div className={`grid gap-3
          ${allTeams.length <= 4  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : ''}
          ${allTeams.length > 4  && allTeams.length <= 9  ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' : ''}
          ${allTeams.length > 9 ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5' : ''}
        `}>
          {allTeams.length === 0 && (
            <div className="col-span-full text-center text-cyber-muted text-sm italic py-10 border border-dashed border-cyber-border">
              Команд пока нет. {isAdmin ? 'Ожидайте, пока игроки создадут команды.' : 'Создайте первую командой!'}
            </div>
          )}

          {allTeams.map(team => {
            const isMine = myTeam?.teamName === team.teamName;
            const c = team.color;
            return (
              <div
                key={team.teamName}
                className="border p-3 transition-all duration-200 bg-cyber-dark flex flex-col gap-2"
                style={{
                  borderColor: isMine ? c : '#1a2744',
                  boxShadow:   isMine ? `0 0 12px ${c}44, 0 0 24px ${c}22` : 'none',
                }}
              >
                {/* Name */}
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <div className="text-xs font-bold tracking-widest flex items-center gap-1 min-w-0"
                    style={{ color: isMine ? c : '#c8d8f0' }}>
                    {isMine && <Crown size={10} className="flex-shrink-0" />}
                    <span className="truncate" title={team.teamName}>{team.teamName.toUpperCase()}</span>
                  </div>
                  {isAdmin && (
                    <button onClick={() => onDeleteTeam(team.teamName)}
                      title="Удалить команду"
                      className="flex-shrink-0 text-cyber-muted hover:text-cyber-red transition">
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>

                {/* Members */}
                <div className="space-y-0.5 min-h-[24px] flex-1">
                  {team.members.length === 0 && (
                    <div className="text-cyber-muted text-[10px] italic">Нет игроков</div>
                  )}
                  {team.members.map(m => {
                    const isSelf = m.name === playerName;
                    const canKick = iAmCaptain && isMine && !isSelf;
                    return (
                      <div key={m.id} className="flex items-center gap-1.5 text-[10px] group">
                        {m.isCaptain
                          ? <Shield size={9} style={{ color: c }} className="flex-shrink-0" />
                          : <Zap size={9} className="text-cyber-muted flex-shrink-0" />}
                        <button
                          onClick={() => (isSelf && !isAdmin ? onOpenProfile() : onViewPlayer?.(m.userId))}
                          title="Открыть профиль"
                          className="truncate text-left hover:underline"
                          style={{ color: m.isCaptain ? c : '#a0b4c8' }}
                        >{m.name}</button>
                        {canKick && (
                          <button onClick={() => onKickMember(m.id)}
                            title={`Выгнать ${m.name}`}
                            className="ml-auto flex-shrink-0 text-cyber-muted hover:text-cyber-red transition">
                            <UserX size={11} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Footer / join */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[9px] tracking-widest" style={{ color: c, opacity: 0.6 }}>
                    {team.members.length} игр.
                  </span>
                  {!isMine && !isAdmin && (
                    <button onClick={() => onSelectTeam(team.teamName)}
                      className="flex items-center gap-1 px-2.5 py-1 border text-[10px] font-bold tracking-widest transition hover:text-black"
                      style={{ borderColor: c, color: c }}
                      onMouseEnter={e => { e.currentTarget.style.background = c; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                      <LogIn size={10} /> ВОЙТИ
                    </button>
                  )}
                  {isMine && (
                    <span className="text-[10px] font-bold tracking-widest" style={{ color: c }}>[ ВЫ ЗДЕСЬ ]</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Rules */}
        <div className="border border-cyber-border p-4 text-xs text-cyber-muted space-y-1">
          <div className="text-cyber-blue mb-2 font-bold">// ПРАВИЛА</div>
          <div>• Первый вошедший в команду становится <span className="text-cyber-neon">капитаном</span>.</div>
          <div>• Капитан может <span className="text-cyber-red">выгнать</span> участника — тот вернётся в выбор команд.</div>
          <div>• Учитель может <span className="text-cyber-red">удалить</span> команду целиком.</div>
          <div>• Правильный ответ захватывает сектор корабля и приносит очки.</div>
          <div>• Побеждает команда с наибольшим счётом по истечении времени.</div>
        </div>

        {isAdmin && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <Clock size={14} className="text-cyber-purple" />
              <span className="text-cyber-muted tracking-widest">ДЛИТЕЛЬНОСТЬ:</span>
              {DURATIONS.map(m => (
                <button key={m} onClick={() => setDuration(m)}
                  className={`px-3 py-1 tracking-widest border transition
                    ${duration === m ? 'bg-cyber-purple text-black border-cyber-purple font-bold'
                                     : 'border-cyber-border text-cyber-muted hover:text-cyber-text'}`}>
                  {m} мин
                </button>
              ))}
            </div>
            <button
              onClick={() => onStartGame(duration)}
              disabled={totalPlayers < 1}
              className="w-full py-4 bg-cyber-neon text-black font-bold tracking-widest uppercase text-lg hover:opacity-90 transition disabled:opacity-30"
            >
              ⚡ НАЧАТЬ ИГРУ ({duration} мин · {totalPlayers} игроков)
            </button>
          </div>
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
