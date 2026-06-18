import { useState, useEffect, useRef } from 'react';
import { Settings, X, Sparkles, Square, Moon, Sun } from 'lucide-react';

// Кнопка-шестерёнка в углу: кастомизация вида (стиль + тема).
// Состояние хранится в localStorage и применяется к <html> через data-атрибуты,
// на которые навешаны CSS-переопределения (см. index.css).

const LS_KEY = 'aegis_ui_prefs';

const loadPrefs = () => {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; } catch { return {}; }
};

function applyPrefs({ minimal, theme }) {
  const root = document.documentElement;
  root.dataset.style = minimal ? 'minimal' : 'standard';
  root.dataset.theme = theme === 'light' ? 'light' : 'dark';
}

// Применяем сохранённые настройки сразу при импорте модуля (до первого рендера) —
// чтобы не было вспышки стандартного оформления.
applyPrefs(loadPrefs());

export default function SettingsButton() {
  const init = loadPrefs();
  const [open, setOpen]       = useState(false);
  const [minimal, setMinimal] = useState(!!init.minimal);
  const [theme, setTheme]     = useState(init.theme === 'light' ? 'light' : 'dark');
  const ref = useRef(null);

  useEffect(() => {
    applyPrefs({ minimal, theme });
    localStorage.setItem(LS_KEY, JSON.stringify({ minimal, theme }));
  }, [minimal, theme]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const Toggle = ({ active, color, onClick, icon: Icon, children }) => (
    <button
      onClick={onClick}
      className={`flex-1 py-1.5 text-[11px] font-bold tracking-widest flex items-center justify-center gap-1 transition
        ${active ? `${color} text-black` : 'text-cyber-muted hover:text-cyber-text'}`}
    >
      <Icon size={11} /> {children}
    </button>
  );

  return (
    <div ref={ref} className="fixed bottom-4 right-4 z-[200] font-mono">
      {open && (
        <div className="mb-2 w-60 bg-cyber-panel border border-cyber-border shadow-md p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] tracking-widest text-cyber-blue">// НАСТРОЙКИ ВИДА</span>
            <button onClick={() => setOpen(false)} className="text-cyber-muted hover:text-cyber-text"><X size={13} /></button>
          </div>

          <div className="space-y-1">
            <div className="text-[10px] text-cyber-muted tracking-widest uppercase">Стиль</div>
            <div className="flex border border-cyber-border">
              <Toggle active={!minimal} color="bg-cyber-blue" onClick={() => setMinimal(false)} icon={Sparkles}>Стандарт</Toggle>
              <Toggle active={minimal}  color="bg-cyber-blue" onClick={() => setMinimal(true)}  icon={Square}>Минимализм</Toggle>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-[10px] text-cyber-muted tracking-widest uppercase">Тема</div>
            <div className="flex border border-cyber-border">
              <Toggle active={theme === 'dark'}  color="bg-cyber-purple" onClick={() => setTheme('dark')}  icon={Moon}>Тёмная</Toggle>
              <Toggle active={theme === 'light'} color="bg-cyber-purple" onClick={() => setTheme('light')} icon={Sun}>Светлая</Toggle>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(o => !o)}
        title="Настройки интерфейса"
        className="w-10 h-10 flex items-center justify-center bg-cyber-panel border border-cyber-border text-cyber-muted hover:text-cyber-blue hover:border-cyber-blue transition shadow-md"
      >
        <Settings size={18} />
      </button>
    </div>
  );
}
