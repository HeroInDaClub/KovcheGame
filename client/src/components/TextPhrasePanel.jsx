import { useState, useEffect } from 'react';
import { Brain, Send, X } from 'lucide-react';
import HintsBlock from './HintsBlock.jsx';

// Панель для type='text_phrase' (logic_crypto).
// Любой участник команды может ввести ответ — задача общекомандная,
// чтобы стимулировать обсуждение. Покинуть может только капитан.

export default function TextPhrasePanel({ task, result, isCaptain, hintsRevealed, revealedHints, onSubmit, onAbandon, onRequestHint }) {
  const [answer, setAnswer] = useState('');
  const solved = result?.correct === true;

  useEffect(() => { setAnswer(''); }, [task.id]);

  const submit = () => {
    if (!answer.trim() || solved) return;
    onSubmit(answer.trim());
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-cyber-border px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Brain size={14} className="text-cyber-yellow animate-pulse-neon" />
          <span className="text-cyber-yellow text-xs font-bold tracking-widest">ЛОГИКА И ШИФР</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-cyber-muted">
          <span>УР.{task.level}</span><span>·</span>
          <span>СЕКТОР {task.sector}</span><span>·</span>
          <span>#{task.id}</span>
        </div>
      </div>

      <div className="px-4 py-2 text-[10px] text-cyber-muted italic border-b border-cyber-border flex-shrink-0">
        <span className="text-cyber-purple">[ЛОРE]</span> {task.lore_description_ru}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        <div className="text-cyber-text text-sm leading-snug whitespace-pre-wrap">{task.question_ru}</div>

        {task.code_snippet && (
          <pre className="bg-cyber-black border border-cyber-border text-cyber-blue text-[11px] font-mono p-3 overflow-x-auto whitespace-pre leading-relaxed">
            {task.code_snippet}
          </pre>
        )}

        <HintsBlock task={task} hintsRevealed={hintsRevealed} revealedHints={revealedHints}
                    canReveal={!solved && isCaptain} onRequestHint={onRequestHint} />

        {result && (
          <div className={`text-xs border px-3 py-2
            ${result.correct
              ? 'border-cyber-neon text-cyber-neon shadow-neon'
              : 'border-cyber-red text-cyber-red'}`}>
            {result.message_ru}
            {result.submittedAnswer && !result.correct && (
              <div className="mt-1 text-[10px] text-cyber-muted">
                Вы ввели: «{result.submittedAnswer}»
              </div>
            )}
          </div>
        )}
      </div>

      {!solved && (
        <div className="border-t border-cyber-border p-3 flex-shrink-0 space-y-2">
          <input
            type="text"
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="Введите слово, число или фразу…"
            className="w-full bg-cyber-dark border border-cyber-border text-cyber-text px-3 py-2 text-sm focus:outline-none focus:border-cyber-yellow placeholder:text-cyber-muted"
          />
          <div className="flex gap-2">
            <button onClick={submit} disabled={!answer.trim()}
              className="flex-1 flex items-center justify-center gap-1 py-2 bg-cyber-yellow text-black text-xs font-bold tracking-widest hover:opacity-90 transition disabled:opacity-30">
              <Send size={12} />
              ОТПРАВИТЬ
            </button>
            {isCaptain && (
              <button onClick={onAbandon}
                className="px-3 py-2 border border-cyber-red text-cyber-red text-xs hover:bg-cyber-red hover:text-black transition flex items-center gap-1">
                <X size={12} />
                Покинуть
              </button>
            )}
          </div>
          {!isCaptain && (
            <div className="text-[10px] text-cyber-muted text-center italic">
              Ответить может любой участник — обсудите команды!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
