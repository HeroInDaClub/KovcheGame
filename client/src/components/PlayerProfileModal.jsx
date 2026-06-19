import { Mail, Github, Link2, X, UserPlus, UserMinus, Users, LogIn, Send } from 'lucide-react';

const CONTACT_META = {
  email:  { label: 'Почта',  Icon: Mail },
  vk:     { label: 'VK',     Icon: Link2 },
  github: { label: 'GitHub', Icon: Github },
};

// Мини-профиль другого игрока: только публичные контакты, друзья,
// кнопки дружбы и командные действия (инвайт / запрос на вступление).
export default function PlayerProfileModal({
  data, canSocial, onClose, onAddFriend, onRemoveFriend, onInvite, onRequestJoin, onViewFriend,
}) {
  if (!data?.profile) return null;
  const { profile, context = {} } = data;
  const contacts = Object.entries(profile.contacts || {});
  const actionable = canSocial && !profile.self;

  // Инвайт: я капитан и цель не в моей команде. Запрос: цель состоит в команде (не моей).
  const canInvite  = actionable && context.iAmCaptainOf && context.targetTeam !== context.iAmCaptainOf;
  const canRequest = actionable && context.targetTeam && context.targetTeam !== context.iAmCaptainOf;

  return (
    <div className="fixed inset-0 z-[125] flex items-center justify-center p-4 bg-cyber-dark/90 backdrop-blur-sm font-mono">
      <div className="w-full max-w-md max-h-[90vh] bg-cyber-panel border border-cyber-blue shadow-blue flex flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-cyber-border px-5 py-3">
          <span className="text-cyber-blue font-bold tracking-widest text-sm truncate">👤 {profile.name}</span>
          <button onClick={onClose} className="text-cyber-muted hover:text-cyber-red"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
          {context.targetTeam && (
            <div className="text-[11px] text-cyber-muted">
              Команда: <span className="text-cyber-text">{context.targetTeam}</span>
              {context.online ? <span className="text-cyber-neon"> · онлайн</span> : null}
            </div>
          )}

          {/* Публичные контакты */}
          <div className="flex flex-col gap-2">
            <div className="text-[10px] tracking-widest text-cyber-blue">// КОНТАКТЫ</div>
            {contacts.length === 0 && (
              <div className="text-[11px] text-cyber-muted italic">Игрок не открыл контакты.</div>
            )}
            {contacts.map(([k, v]) => {
              const M = CONTACT_META[k] || { label: k, Icon: Link2 };
              return (
                <div key={k} className="flex items-center gap-2 text-xs">
                  <M.Icon size={13} className="text-cyber-muted flex-shrink-0" />
                  <span className="w-14 text-cyber-muted flex-shrink-0">{M.label}</span>
                  <span className="text-cyber-text truncate">{v}</span>
                </div>
              );
            })}
          </div>

          {/* Друзья */}
          <div className="flex flex-col gap-2">
            <div className="text-[10px] tracking-widest text-cyber-blue flex items-center gap-1.5">
              <Users size={12} /> ДРУЗЬЯ ({profile.friendCount ?? profile.friends?.length ?? 0})
            </div>
            {(profile.friends || []).map(f => (
              <button key={f.id} onClick={() => onViewFriend(f.id)}
                className="text-left text-xs text-cyber-text hover:text-cyber-neon truncate">{f.name}</button>
            ))}
            {(!profile.friends || profile.friends.length === 0) && (
              <div className="text-[11px] text-cyber-muted italic">Нет друзей.</div>
            )}
          </div>
        </div>

        {/* Действия */}
        {actionable && (
          <div className="border-t border-cyber-border p-4 flex flex-col gap-2">
            {profile.isFriend ? (
              <button onClick={() => onRemoveFriend(profile.id)}
                className="flex items-center justify-center gap-2 py-2 border border-cyber-red text-cyber-red text-xs font-bold tracking-widest hover:bg-cyber-red hover:text-black">
                <UserMinus size={14} /> УДАЛИТЬ ИЗ ДРУЗЕЙ
              </button>
            ) : (
              <button onClick={() => onAddFriend(profile.id)}
                className="flex items-center justify-center gap-2 py-2 border border-cyber-neon text-cyber-neon text-xs font-bold tracking-widest hover:bg-cyber-neon hover:text-black">
                <UserPlus size={14} /> ДОБАВИТЬ В ДРУЗЬЯ
              </button>
            )}

            {canInvite && (
              <button onClick={() => onInvite(profile.id)}
                className="flex items-center justify-center gap-2 py-2 border border-cyber-purple text-cyber-purple text-xs font-bold tracking-widest hover:bg-cyber-purple hover:text-black">
                <Send size={14} /> ПРИГЛАСИТЬ В «{context.iAmCaptainOf}»
              </button>
            )}
            {canRequest && (
              <button onClick={() => onRequestJoin(profile.id)}
                className="flex items-center justify-center gap-2 py-2 border border-cyber-blue text-cyber-blue text-xs font-bold tracking-widest hover:bg-cyber-blue hover:text-black">
                <LogIn size={14} /> ЗАПРОСИТЬ ВСТУПЛЕНИЕ В «{context.targetTeam}»
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
