import { Lock, CheckCircle, Circle, Loader, Star, ListChecks, Code2, Brain, AlertOctagon, Terminal, Link2 } from 'lucide-react';

const STATUS_CONFIG = {
  available:   { icon: Circle,       color: 'text-cyber-muted',  border: 'border-cyber-border',  label: 'Доступна' },
  in_progress: { icon: Loader,       color: 'text-cyber-blue',   border: 'border-cyber-blue',    label: 'В процессе' },
  solved:      { icon: CheckCircle,  color: 'text-cyber-neon',   border: 'border-cyber-neon',    label: 'Решена' },
  abandoned:   { icon: Lock,         color: 'text-cyber-red',    border: 'border-cyber-red',     label: 'Покинута' },
  failed:      { icon: AlertOctagon, color: 'text-cyber-red',    border: 'border-cyber-red',     label: 'Сбой' },
};

const LEVEL_COLORS = ['', 'text-[#4ae54a]', 'text-[#99ff44]', 'text-cyber-yellow', 'text-[#ff9f0a]', 'text-cyber-red'];

const LANG_TAG = {
  python: { label: 'PY', cls: 'border-[#3776ab] text-[#3776ab]' },
  kumir:  { label: 'KU', cls: 'border-cyber-purple text-cyber-purple' },
  pascal: { label: 'PA', cls: 'border-cyber-yellow text-cyber-yellow' },
};

export default function TaskCard({ task, status = 'available', isCaptain, onPick, isActive }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.available;
  const StatusIcon = cfg.icon;
  const clickable = status === 'available' && isCaptain && !isActive;

  return (
    <div
      onClick={clickable ? () => onPick(task.id) : undefined}
      className={`border p-3 transition-all duration-200 relative text-xs
        ${cfg.border}
        ${clickable ? 'cursor-pointer hover:bg-cyber-panel hover:shadow-md' : 'cursor-default'}
        ${status === 'solved'    ? 'bg-cyber-dark opacity-80' : ''}
        ${status === 'abandoned' ? 'bg-cyber-dark opacity-50' : ''}
        ${status === 'in_progress' ? 'bg-cyber-panel shadow-blue' : ''}
        ${isActive ? 'ring-1 ring-cyber-blue' : ''}
      `}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-cyber-muted text-[10px]">#{task.id}</span>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={8}
              fill={i < task.level ? 'currentColor' : 'none'}
              className={i < task.level ? LEVEL_COLORS[task.level] : 'text-cyber-border'}
            />
          ))}
        </div>
        <StatusIcon size={12} className={cfg.color + (status === 'in_progress' ? ' animate-spin' : '')} />
      </div>

      {/* Type badge row */}
      <div className="flex items-center gap-1 mb-1">
        {task.type === 'text_phrase' && (
          <span className="flex items-center gap-1 text-[9px] tracking-widest border border-cyber-yellow text-cyber-yellow px-1 py-px">
            <Brain size={8} /> ЛОГИКА
          </span>
        )}
        {task.type === 'multiple_choice' && (
          <span className="flex items-center gap-1 text-[9px] tracking-widest border border-cyber-blue text-cyber-blue px-1 py-px">
            <ListChecks size={8} /> ТЕСТ · 1
          </span>
        )}
        {task.type === 'code_repair' && (
          <>
            <span className="flex items-center gap-1 text-[9px] tracking-widest border border-cyber-purple text-cyber-purple px-1 py-px">
              <Code2 size={8} /> КОД
            </span>
            {LANG_TAG[task.language] && (
              <span className={`text-[9px] tracking-widest border px-1 py-px ${LANG_TAG[task.language].cls}`}>
                {LANG_TAG[task.language].label}
              </span>
            )}
          </>
        )}
        {task.type === 'full_code' && (
          <span className="flex items-center gap-1 text-[9px] tracking-widest border border-cyber-neon text-cyber-neon px-1 py-px">
            <Terminal size={8} /> КОД+
          </span>
        )}
        {task.type === 'interactive_match' && (
          <span className="flex items-center gap-1 text-[9px] tracking-widest border border-cyber-purple text-cyber-purple px-1 py-px">
            <Link2 size={8} /> ПАРЫ
          </span>
        )}
      </div>

      {/* Preview (truncated) */}
      <div className={`leading-tight ${status === 'abandoned' || status === 'failed' ? 'text-cyber-muted line-through' : 'text-cyber-text'}`}>
        {status === 'failed'
          ? <span className="text-cyber-red text-[10px] tracking-widest">// СБОЙ ✗</span>
          : status === 'abandoned'
            ? <span className="text-cyber-red text-[10px] tracking-widest">// ПОКИНУТА</span>
            : status === 'solved'
              ? <span className="text-cyber-neon text-[10px] tracking-widest">// РЕШЕНА ✓</span>
              : task.type === 'code_repair'
                ? <code className="block bg-cyber-black px-1 py-0.5 text-[9.5px] text-cyber-blue/80 truncate font-mono">
                    {(task.code_snippet || '').split('\n').find(l => l.includes('▓▓▓'))?.trim() || task.question_ru.slice(0, 50) + '…'}
                  </code>
                : task.question_ru.length > 55
                  ? task.question_ru.slice(0, 55) + '…'
                  : task.question_ru
        }
      </div>

      {/* Sector badge */}
      <div className="mt-1.5 text-[9px] text-cyber-muted tracking-widest">
        СЕКТОР {task.sector} · УР.{task.level}
      </div>

      {/* Captain hint overlay */}
      {clickable && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-cyber-dark/80">
          <span className="text-cyber-blue text-[10px] tracking-widest">[ ОТКРЫТЬ ДЛЯ КОМАНДЫ ]</span>
        </div>
      )}
    </div>
  );
}
