import { CheckCircle, XCircle, X, Zap, AlertOctagon } from 'lucide-react';
import TaskImage from './TaskImage.jsx';

// ⚠️ ONE-SHOT: ровно ОДНА попытка. После любого ответа (верный/неверный)
// блок ответов «замораживается» — никаких повторов.
//   • верный   → задача solved (зелёный)
//   • неверный → задача failed (красный, разблокировать нельзя)
// Подсветка: выбор игрока — синим/красным, правильный ответ — зелёным.

export default function MultipleChoicePanel({ task, result, isCaptain, onSubmit, onAbandon }) {
  const solved   = result?.correct === true;
  const failed   = result?.correct === false;
  const answered = solved || failed;
  const picked   = result?.submittedAnswer;

  const letterFor = idx => String.fromCharCode(65 + idx);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-cyber-border px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-cyber-blue animate-pulse-neon" />
          <span className="text-cyber-blue text-xs font-bold tracking-widest">ВЫБОР ВАРИАНТА</span>
          <span className="text-[9px] text-cyber-red tracking-widest border border-cyber-red/50 px-1 ml-1">
            1 ПОПЫТКА
          </span>
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

      {/* Body */}
      <div className="px-4 py-3 flex-1 overflow-y-auto space-y-3">
        <TaskImage url={task.image_url} />

        <div className="text-cyber-text text-sm leading-snug">{task.question_ru}</div>

        {/* 4 кнопки. ВАЖНО: disabled после ЛЮБОГО ответа */}
        <div className="space-y-2 pt-1">
          {task.options.map((opt, idx) => {
            const isCorrect = answered && opt === task.correct_answer;
            const isWrong   = failed && picked && opt === picked;
            const disabled  = answered || !isCaptain;

            let style = 'border-cyber-border bg-cyber-dark hover:border-cyber-blue hover:bg-cyber-panel hover:shadow-blue';
            if (isCorrect) style = 'border-cyber-neon bg-cyber-neon/15 text-cyber-neon shadow-neon';
            else if (isWrong) style = 'border-cyber-red bg-cyber-red/15 text-cyber-red shadow-red';
            else if (answered) style = 'border-cyber-border bg-cyber-dark opacity-40';

            return (
              <button
                key={idx}
                onClick={() => !disabled && onSubmit(opt)}
                disabled={disabled}
                className={`w-full flex items-start gap-3 px-3 py-2.5 border text-left text-xs transition-all duration-200 ${style}
                  ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span className={`flex-shrink-0 w-6 h-6 flex items-center justify-center text-[10px] font-bold border
                  ${isCorrect ? 'border-cyber-neon text-cyber-neon'
                    : isWrong ? 'border-cyber-red text-cyber-red'
                    : 'border-cyber-border text-cyber-muted'}`}>
                  {letterFor(idx)}
                </span>
                <span className="flex-1 leading-snug pt-1">{opt}</span>
                {isCorrect && <CheckCircle size={14} className="text-cyber-neon flex-shrink-0 mt-1" />}
                {isWrong   && <XCircle    size={14} className="text-cyber-red flex-shrink-0 mt-1" />}
              </button>
            );
          })}
        </div>

        {/* Result feedback */}
        {answered && (
          <div className={`text-xs border px-3 py-2.5 flex items-start gap-2
            ${solved
              ? 'border-cyber-neon text-cyber-neon shadow-neon'
              : 'border-cyber-red text-cyber-red shadow-red'}`}>
            {failed && <AlertOctagon size={14} className="flex-shrink-0 mt-0.5" />}
            <span>{result.message_ru}</span>
          </div>
        )}

        {!isCaptain && !answered && (
          <div className="text-[10px] text-cyber-muted text-center italic pt-1">
            Капитан примет финальное решение. Обсудите — это единственная попытка!
          </div>
        )}
      </div>

      {/* Abandon — только до ответа */}
      {!answered && isCaptain && (
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
