import { useState, useEffect } from 'react';
import { Terminal, X, Send } from 'lucide-react';
import TaskImage from './TaskImage.jsx';

// Панель для type='full_code'. Игрок пишет функцию целиком; код уходит строкой
// на сервер, где прогоняется в vm против набора тестов. Попытки не ограничены,
// отвечать может любой участник (как в text_phrase). Покидать — только капитан.

export default function FullCodePanel({ task, result, isCaptain, onSubmit, onAbandon }) {
  const [code, setCode] = useState('');
  const solved = result?.correct === true;

  useEffect(() => { setCode(''); }, [task.id]);

  const submit = () => {
    if (!code.trim() || solved) return;
    onSubmit(code);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-cyber-border px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-cyber-neon animate-pulse-neon" />
          <span className="text-cyber-neon text-xs font-bold tracking-widest">НАПИСАТЬ КОД</span>
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
        <TaskImage url={task.image_url} />

        <div className="text-cyber-text text-sm leading-snug whitespace-pre-wrap">{task.question_ru}</div>

        {task.entry && (
          <div className="text-[10px] text-cyber-muted">
            Имя функции: <code className="text-cyber-blue font-mono">{task.entry}</code> · язык: JavaScript
          </div>
        )}

        {result && (
          <div className={`text-xs border px-3 py-2
            ${result.correct
              ? 'border-cyber-neon text-cyber-neon shadow-neon'
              : 'border-cyber-red text-cyber-red'}`}>
            {result.message_ru}
            {!result.correct && result.total != null && (
              <div className="mt-1 text-[10px] text-cyber-muted">Тесты пройдены: {result.passed}/{result.total}</div>
            )}
          </div>
        )}
      </div>

      {!solved && (
        <div className="border-t border-cyber-border p-3 flex-shrink-0 space-y-2">
          <textarea
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder={`function ${task.entry || 'solve'}(...) {\n  // ваш код\n}`}
            spellCheck={false}
            rows={8}
            className="w-full bg-cyber-black border border-cyber-border text-cyber-text px-3 py-2 text-xs font-mono focus:outline-none focus:border-cyber-neon placeholder:text-cyber-muted resize-y"
          />
          <div className="flex gap-2">
            <button onClick={submit} disabled={!code.trim()}
              className="flex-1 flex items-center justify-center gap-1 py-2 bg-cyber-neon text-black text-xs font-bold tracking-widest hover:opacity-90 transition disabled:opacity-30">
              <Send size={12} />
              ЗАПУСТИТЬ ТЕСТЫ
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
              Код может отправить любой участник — попыток сколько угодно.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
