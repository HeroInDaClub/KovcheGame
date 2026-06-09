import { Lock, CheckCircle, Circle, Loader, Star } from 'lucide-react';

const STATUS_CONFIG = {
  available:   { icon: Circle,      color: 'text-cyber-muted',   border: 'border-cyber-border',  label: 'Доступна' },
  in_progress: { icon: Loader,      color: 'text-cyber-blue',    border: 'border-cyber-blue',    label: 'В процессе' },
  solved:      { icon: CheckCircle, color: 'text-cyber-neon',    border: 'border-cyber-neon',    label: 'Решена' },
  abandoned:   { icon: Lock,        color: 'text-cyber-red',     border: 'border-cyber-red',     label: 'Заблокирована' },
};

const LEVEL_COLORS = ['', 'text-[#4ae54a]', 'text-[#99ff44]', 'text-cyber-yellow', 'text-[#ff9f0a]', 'text-cyber-red'];

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

      {/* Question preview (truncated) */}
      <div className={`leading-tight ${status === 'abandoned' ? 'text-cyber-muted line-through' : 'text-cyber-text'}`}>
        {status === 'abandoned'
          ? <span className="text-cyber-red text-[10px] tracking-widest">// ЗАБЛОКИРОВАНА</span>
          : status === 'solved'
            ? <span className="text-cyber-neon text-[10px] tracking-widest">// РЕШЕНА ✓</span>
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
