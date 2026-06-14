import { useState, useEffect } from 'react';
import { socket } from '../socket.js';
import { Users, Layers, Cpu, Clock } from 'lucide-react';

// ── Кнопка-вариант в стиле cyber-neon ───────────────────
function OptionBtn({ active, color = 'neon', onClick, children }) {
  const palettes = {
    neon:    { on: 'border-cyber-neon    bg-cyber-neon    text-black',   off: 'border-cyber-border text-cyber-muted hover:border-cyber-neon    hover:text-cyber-neon'    },
    blue:    { on: 'border-cyber-blue    bg-cyber-blue    text-black',   off: 'border-cyber-border text-cyber-muted hover:border-cyber-blue    hover:text-cyber-blue'    },
    yellow:  { on: 'border-cyber-yellow  bg-cyber-yellow  text-black',   off: 'border-cyber-border text-cyber-muted hover:border-cyber-yellow  hover:text-cyber-yellow'  },
    red:     { on: 'border-cyber-red     bg-cyber-red     text-black',   off: 'border-cyber-border text-cyber-muted hover:border-cyber-red     hover:text-cyber-red'     },
    purple:  { on: 'border-cyber-purple  bg-cyber-purple  text-black',   off: 'border-cyber-border text-cyber-muted hover:border-cyber-purple  hover:text-cyber-purple'  },
  };
  const p = palettes[color] ?? palettes.neon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 py-2 border text-xs font-bold tracking-widest transition-all duration-150
        ${active ? p.on : p.off}`}
    >
      {children}
    </button>
  );
}

// ── Секция с иконкой и заголовком ───────────────────────
function Section({ icon: Icon, title, children }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-[10px] text-cyber-muted tracking-widest uppercase">
        <Icon size={11} className="text-cyber-purple" />
        {title}
      </div>
      {children}
    </div>
  );
}

const DIFFICULTY_META = {
  easy:     { label: 'Лёгкая',           sub: 'Упор на уровни 1-3',   color: 'neon'   },
  balanced: { label: 'Сбалансированная', sub: 'Равномерно 1-5',        color: 'blue'   },
  hardcore: { label: 'Хардкор',          sub: 'Упор на уровни 3-5',   color: 'red'    },
};

export default function AdminPanel({ notification, onCreateRoom, roomId }) {
  const [adminName,        setAdminName]        = useState('');
  const [duration,         setDuration]         = useState(45);
  const [maxTeams,         setMaxTeams]         = useState(4);
  const [totalTasksCount,  setTotalTasksCount]  = useState(50);
  const [difficultyPreset, setDifficultyPreset] = useState('balanced');
  const [created,          setCreated]          = useState(false);

  useEffect(() => {
    const handler = ({ roomId: id }) => {
      setCreated(true);
      socket.emit('join_room', { roomId: id, playerName: adminName });
    };
    socket.on('room_created', handler);
    return () => socket.off('room_created', handler);
  }, [adminName]);

  const handleCreate = () => {
    if (!adminName.trim() || created) return;
    onCreateRoom({ adminName: adminName.trim(), duration, maxTeams, totalTasksCount, difficultyPreset });
  };

  // Счётчик команд: ±1 c зажатием
  const changeTeams = (delta) =>
    setMaxTeams(n => Math.max(2, Math.min(25, n + delta)));

  return (
    <div className="min-h-screen bg-cyber-dark cyber-grid flex flex-col items-center justify-center p-6 font-mono">
      {notification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-cyber-panel border border-cyber-neon text-cyber-neon px-6 py-3 text-sm shadow-neon">
          {notification}
        </div>
      )}

      <div className="w-full max-w-lg bg-cyber-panel border border-cyber-border p-8 space-y-6">

        {/* Заголовок */}
        <div>
          <div className="text-cyber-purple text-lg font-bold tracking-widest mb-0.5">ПАНЕЛЬ УЧИТЕЛЯ</div>
          <div className="text-cyber-muted text-xs">Настройте параметры игровой сессии</div>
        </div>

        {/* Имя */}
        <Section icon={Cpu} title="Имя учителя">
          <input
            className="w-full bg-cyber-dark border border-cyber-border text-cyber-text px-4 py-2.5 text-sm focus:outline-none focus:border-cyber-purple placeholder:text-cyber-muted"
            value={adminName}
            onChange={e => setAdminName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            placeholder="Введите имя"
            disabled={created}
          />
        </Section>

        {/* Длительность */}
        <Section icon={Clock} title="Длительность (минут)">
          <div className="flex gap-2">
            {[20, 30, 45, 60].map(m => (
              <OptionBtn key={m} active={duration === m} color="blue" onClick={() => setDuration(m)}>
                {m}
              </OptionBtn>
            ))}
          </div>
        </Section>

        {/* Количество команд */}
        <Section icon={Users} title={`Количество команд`}>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => changeTeams(-1)}
              className="w-9 h-9 border border-cyber-border text-cyber-muted hover:border-cyber-purple hover:text-cyber-purple text-lg transition">
              −
            </button>
            <div className="flex-1 text-center">
              <span className="text-2xl font-bold text-cyber-neon">{maxTeams}</span>
              <span className="text-cyber-muted text-xs ml-2">команд(ы)</span>
            </div>
            <button type="button" onClick={() => changeTeams(+1)}
              className="w-9 h-9 border border-cyber-border text-cyber-muted hover:border-cyber-purple hover:text-cyber-purple text-lg transition">
              +
            </button>
          </div>
          {/* Быстрый выбор */}
          <div className="flex gap-2">
            {[2, 4, 6, 8, 10].map(n => (
              <OptionBtn key={n} active={maxTeams === n} color="purple" onClick={() => setMaxTeams(n)}>
                {n}
              </OptionBtn>
            ))}
          </div>
          <div className="text-[10px] text-cyber-muted">Допустимо от 2 до 25 команд</div>
        </Section>

        {/* Размер пула задач */}
        <Section icon={Layers} title="Задач в пуле">
          <div className="flex gap-2">
            {[30, 40, 50, 60, 80].map(n => (
              <OptionBtn key={n} active={totalTasksCount === n} color="yellow" onClick={() => setTotalTasksCount(n)}>
                {n}
              </OptionBtn>
            ))}
          </div>
        </Section>

        {/* Пресет сложности */}
        <Section icon={Cpu} title="Сложность">
          <div className="flex gap-2">
            {Object.entries(DIFFICULTY_META).map(([key, meta]) => (
              <OptionBtn key={key} active={difficultyPreset === key} color={meta.color}
                onClick={() => setDifficultyPreset(key)}>
                {meta.label}
              </OptionBtn>
            ))}
          </div>
          <div className="text-[10px] text-cyber-muted">
            {DIFFICULTY_META[difficultyPreset].sub}
          </div>
        </Section>

        {/* Кнопка создать */}
        <button
          onClick={handleCreate}
          disabled={!adminName.trim() || created}
          className="w-full py-3 bg-cyber-purple text-black font-bold tracking-widest uppercase hover:opacity-90 transition disabled:opacity-30"
        >
          {created ? '✓ КОМНАТА СОЗДАНА' : 'Создать комнату'}
        </button>

        {/* Код комнаты */}
        {roomId && (
          <div className="border border-cyber-neon/30 p-4 text-center space-y-2">
            <div className="text-cyber-muted text-[10px] tracking-widest">КОД ДЛЯ УЧЕНИКОВ</div>
            <div className="text-4xl font-bold text-cyber-neon tracking-[0.5em] py-1">
              {roomId}
            </div>
            <div className="text-cyber-muted text-[10px]">
              {maxTeams} команд · {totalTasksCount} задач · {DIFFICULTY_META[difficultyPreset].label}
            </div>
            <div className="text-cyber-muted text-[10px]">Ожидание игроков в лобби…</div>
          </div>
        )}
      </div>
    </div>
  );
}
