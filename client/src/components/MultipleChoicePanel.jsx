import { CheckCircle, X, Zap } from 'lucide-react';

// Cyber-style кнопки-варианты. При клике (только капитан) — отправка ответа.
// Подсветка зелёным/красным по результату; для не-капитана кнопки disabled.

export default function MultipleChoicePanel({ task, result, isCaptain, onSubmit, onAbandon }) {
  const solved = result?.correct === true;

  const letterFor = idx => String.fromCharCode(65 + idx); // 0→A, 1→B…

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-cyber-border px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-cyber-blue animate-pulse-neon" />
          <span className="text-cyber-blue text-xs font-bold tracking-widest">ВЫБОР ВАРИАНТА</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-cyber-muted">
          <span>УР.{task.level}</span><span>·</span>
          <span>СЕКТОР {task.sector}</span><span>·</span>
          <span>#{task.id}</span>
        </div>
      </div>

      {/* Lore */}
      <div className="px-4 py-2 text-[10px] text-cyber-muted italic border-b border-cyber-border flex-shrink-0">
        <span className="text-cyber-purple">[ЛОРE]</span> {task.lore_description_ru}
      </div>

      {/* Question + options */}
      <div className="px-4 py-3 flex-1 overflow-y-auto space-y-3">
        <div className="text-cyber-text text-sm leading-snug">{task.question_ru}</div>

        <div className="space-y-2 pt-1">
          {task.options.map((opt, idx) => {
            const isCorrect = solved && opt === task.correct_answer;
            const isPicked  = result && !result.correct && false; // server не присылает выбор → подсвечиваем только верный
            const disabled  = solved || !isCaptain;

            return (
              <button
                key={idx}
                onClick={() => !disabled && onSubmit(opt)}
                disabled={disabled}
                className={`w-full flex items-start gap-3 px-3 py-2.5 border text-left text-xs transition-all duration-150
                  ${isCorrect
                    ? 'border-cyber-neon bg-cyber-neon/10 text-cyber-neon shadow-neon'
                    : 'border-cyber-border bg-cyber-dark hover:border-cyber-blue hover:bg-cyber-panel hover:shadow-blue'
                  }
                  ${disabled && !isCorrect ? 'opacity-50 cursor-not-allowed hover:border-cyber-border hover:bg-cyber-dark hover:shadow-none' : 'cursor-pointer'}
                `}
              >
                <span className={`flex-shrink-0 w-6 h-6 flex items-center justify-center text-[10px] font-bold border
                  ${isCorrect ? 'border-cyber-neon text-cyber-neon' : 'border-cyber-border text-cyber-muted'}`}>
                  {letterFor(idx)}
                </span>
                <span className="flex-1 leading-snug pt-1">{opt}</span>
                {isCorrect && <CheckCircle size={14} className="text-cyber-neon flex-shrink-0 mt-1" />}
              </button>
            );
          })}
        </div>

        {/* Result feedback */}
        {result && (
          <div className={`text-xs border px-3 py-2 mt-3
            ${result.correct
              ? 'border-cyber-neon text-cyber-neon shadow-neon'
              : 'border-cyber-red text-cyber-red'}`}>
            {result.message_ru}
          </div>
        )}

        {!isCaptain && !solved && (
          <div className="text-[10px] text-cyber-muted text-center pt-2 italic">
            Ожидайте решения капитана…
          </div>
        )}
      </div>

      {/* Abandon */}
      {!solved && isCaptain && (
        <div className="border-t border-cyber-border p-3 flex-shrink-0">
          <button
            onClick={onAbandon}
            className="w-full flex items-center justify-center gap-1 py-2 border border-cyber-red text-cyber-red text-xs hover:bg-cyber-red hover:text-black transition"
          >
            <X size={12} />
            Покинуть задачу
          </button>
        </div>
      )}
    </div>
  );
}
