import { useState, useEffect } from 'react';
import { Wrench, X, Send, Zap, CheckCircle, AlertTriangle } from 'lucide-react';
import CodeBlock from './CodeBlock.jsx';

// Универсальная панель для code_repair:
//   • если task.options есть → режим выбора строки
//   • иначе → текстовое поле для ввода
// Подсказка прячется/раскрывается отдельно (как у MC панели нет — здесь
// контент сложнее, hint бывает критичен).

export default function CodeRepairPanel({ task, result, isCaptain, onSubmit, onAbandon }) {
  const [answer,   setAnswer]   = useState('');
  const [showHint, setShowHint] = useState(false);
  const solved = result?.correct === true;

  // Сбрасываем поле при смене задачи
  useEffect(() => { setAnswer(''); setShowHint(false); }, [task.id]);

  const hasOptions = Array.isArray(task.options) && task.options.length > 0;
  const letterFor  = idx => String.fromCharCode(65 + idx);

  const submit = () => {
    if (!answer.trim()) return;
    onSubmit(answer.trim());
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-cyber-border px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Wrench size={14} className="text-cyber-blue animate-pulse-neon" />
          <span className="text-cyber-blue text-xs font-bold tracking-widest">ВОССТАНОВЛЕНИЕ КОДА</span>
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

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">

        {/* Code */}
        <CodeBlock code={task.code_snippet} language={task.language} />

        {/* Question */}
        <div className="text-cyber-text text-sm leading-snug">
          {task.question_ru}
        </div>

        {/* Hint */}
        {task.hint_ru && !solved && (
          <div>
            <button
              onClick={() => setShowHint(!showHint)}
              className="text-[10px] text-cyber-muted hover:text-cyber-yellow flex items-center gap-1"
            >
              <AlertTriangle size={10} />
              {showHint ? 'Скрыть подсказку' : 'Показать подсказку'}
            </button>
            {showHint && (
              <div className="mt-1 text-[10px] text-cyber-yellow border border-cyber-yellow/30 px-3 py-2 bg-cyber-dark">
                {task.hint_ru}
              </div>
            )}
          </div>
        )}

        {/* Variants OR text input */}
        {hasOptions ? (
          <div className="space-y-2 pt-1">
            {task.options.map((opt, idx) => {
              const isCorrect = solved && opt === task.correct_answer;
              const disabled  = solved || !isCaptain;
              return (
                <button
                  key={idx}
                  onClick={() => !disabled && onSubmit(opt)}
                  disabled={disabled}
                  className={`w-full flex items-start gap-3 px-3 py-2 border text-left text-[11px] font-mono transition-all
                    ${isCorrect
                      ? 'border-cyber-neon bg-cyber-neon/10 text-cyber-neon shadow-neon'
                      : 'border-cyber-border bg-cyber-dark hover:border-cyber-blue hover:bg-cyber-panel'
                    }
                    ${disabled && !isCorrect ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  <span className={`flex-shrink-0 w-5 h-5 flex items-center justify-center text-[10px] font-bold border
                    ${isCorrect ? 'border-cyber-neon text-cyber-neon' : 'border-cyber-border text-cyber-muted'}`}>
                    {letterFor(idx)}
                  </span>
                  <span className="flex-1">{opt}</span>
                  {isCorrect && <CheckCircle size={12} className="text-cyber-neon flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        ) : (
          /* Текстовое поле */
          <div className="space-y-2 pt-1">
            <input
              type="text"
              value={answer}
              disabled={solved}
              onChange={e => setAnswer(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
              placeholder="Что должно стоять вместо ▓▓▓?"
              className="w-full bg-cyber-dark border border-cyber-border text-cyber-text px-3 py-2 text-xs font-mono focus:outline-none focus:border-cyber-blue placeholder:text-cyber-muted disabled:opacity-50"
            />
            <button
              onClick={submit}
              disabled={!answer.trim() || solved}
              className="w-full flex items-center justify-center gap-1 py-2 bg-cyber-blue text-black text-xs font-bold tracking-widest hover:opacity-90 transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Send size={12} />
              ОТПРАВИТЬ ОТВЕТ
            </button>
            {!isCaptain && !solved && (
              <div className="text-[10px] text-cyber-muted text-center pt-1 italic">
                Любой участник команды может ввести ответ — но решение принимается общим
              </div>
            )}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className={`text-xs border px-3 py-2 mt-2
            ${result.correct
              ? 'border-cyber-neon text-cyber-neon shadow-neon'
              : 'border-cyber-red text-cyber-red'}`}>
            {result.message_ru}
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
