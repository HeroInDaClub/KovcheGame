import { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Save, UserMinus, Users } from 'lucide-react';

const FIELDS = [
  { key: 'email',  label: 'Почта',  placeholder: 'you@mail.ru' },
  { key: 'vk',     label: 'VK',     placeholder: 'vk.com/id…'  },
  { key: 'github', label: 'GitHub', placeholder: 'github.com/…' },
];

// Раздел «Мой профиль»: имя, контакты и переключатели видимости каждого.
export default function ProfilePanel({ profile, onSave, onClose, onRemoveFriend, onViewFriend }) {
  const [name,     setName]     = useState('');
  const [contacts, setContacts] = useState({ email: '', vk: '', github: '' });
  const [privacy,  setPrivacy]  = useState({ email: false, vk: false, github: false });

  // Синхронизируемся с серверным профилем при каждом обновлении.
  useEffect(() => {
    if (!profile) return;
    setName(profile.name || '');
    setContacts({ email: '', vk: '', github: '', ...profile.contacts });
    setPrivacy({ email: false, vk: false, github: false, ...profile.privacy });
  }, [profile]);

  if (!profile) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-cyber-dark/90 backdrop-blur-sm font-mono">
      <div className="w-full max-w-lg max-h-[90vh] bg-cyber-panel border border-cyber-neon shadow-neon flex flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-cyber-border px-5 py-3">
          <span className="text-cyber-neon font-bold tracking-widest text-sm">// МОЙ ПРОФИЛЬ</span>
          <button onClick={onClose} className="text-cyber-muted hover:text-cyber-red"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
          {/* Имя */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] tracking-widest text-cyber-muted">ОТОБРАЖАЕМОЕ ИМЯ</label>
            <input
              value={name} maxLength={32} onChange={e => setName(e.target.value)}
              className="bg-cyber-dark border border-cyber-border text-cyber-text px-3 py-2 text-sm focus:outline-none focus:border-cyber-neon"
            />
          </div>

          {/* Контакты + переключатели приватности */}
          <div className="flex flex-col gap-3">
            <div className="text-[10px] tracking-widest text-cyber-blue">// КОНТАКТЫ И ПРИВАТНОСТЬ</div>
            {FIELDS.map(({ key, label, placeholder }) => {
              const pub = privacy[key];
              return (
                <div key={key} className="flex items-center gap-2">
                  <span className="w-16 text-[11px] text-cyber-muted flex-shrink-0">{label}</span>
                  <input
                    value={contacts[key]} placeholder={placeholder}
                    onChange={e => setContacts(c => ({ ...c, [key]: e.target.value }))}
                    className="flex-1 min-w-0 bg-cyber-dark border border-cyber-border text-cyber-text px-3 py-1.5 text-xs focus:outline-none focus:border-cyber-neon"
                  />
                  <button
                    onClick={() => setPrivacy(p => ({ ...p, [key]: !p[key] }))}
                    title={pub ? 'Публично — виден другим' : 'Скрыто — виден только вам'}
                    className={`flex items-center gap-1 px-2 py-1.5 text-[10px] tracking-widest border transition
                      ${pub ? 'border-cyber-neon text-cyber-neon' : 'border-cyber-border text-cyber-muted'}`}
                  >
                    {pub ? <Eye size={12} /> : <EyeOff size={12} />}
                    {pub ? 'ПОКАЗАН' : 'СКРЫТ'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Друзья */}
          <div className="flex flex-col gap-2">
            <div className="text-[10px] tracking-widest text-cyber-blue flex items-center gap-1.5">
              <Users size={12} /> ДРУЗЬЯ ({profile.friends?.length || 0})
            </div>
            {(!profile.friends || profile.friends.length === 0) && (
              <div className="text-[11px] text-cyber-muted italic">Список друзей пуст.</div>
            )}
            {(profile.friends || []).map(f => (
              <div key={f.id} className="flex items-center justify-between gap-2 border border-cyber-border px-3 py-1.5">
                <button onClick={() => onViewFriend(f.id)} className="text-xs text-cyber-text hover:text-cyber-neon truncate">
                  {f.name}
                </button>
                <button onClick={() => onRemoveFriend(f.id)} title="Удалить из друзей"
                  className="text-cyber-muted hover:text-cyber-red flex-shrink-0"><UserMinus size={14} /></button>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-cyber-border p-4">
          <button
            onClick={() => onSave({ name, contacts, privacy })}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-cyber-neon text-black font-bold tracking-widest text-sm hover:opacity-90"
          >
            <Save size={15} /> СОХРАНИТЬ
          </button>
        </div>
      </div>
    </div>
  );
}
