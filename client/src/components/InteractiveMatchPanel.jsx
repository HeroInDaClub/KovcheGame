import { useState, useEffect, useMemo } from 'react';
import { Link2, X, Send, Check } from 'lucide-react';
import TaskImage from './TaskImage.jsx';

// Панель для type='interactive_match'. Игрок выбирает элемент слева,
// затем его пару справа. Ответ уходит структурой { matches: { [left]: right } }.
// Проверка структуры на полное совпадение — на сервере. Попытки не ограничены.

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function InteractiveMatchPanel({ task, result, isCaptain, onSubmit, onAbandon }) {
  const pairs  = Array.isArray(task.pairs) ? task.pairs : [];
  const lefts  = useMemo(() => pairs.map(p => p.left),            [task.id]); // eslint-disable-line
  const rights = useMemo(() => shuffle(pairs.map(p => p.right)),  [task.id]); // eslint-disable-line

  const [selectedLeft, setSelectedLeft] = useState(null);
  const [matches,      setMatches]      = useState({});   // { [left]: right }
  const solved = result?.correct === true;

  useEffect(() => { setMatches({}); setSelectedLeft(null); }, [task.id]);

  const rightOwner = (right) => Object.keys(matches).find(l => matches[l] === right);

  const assign = (right) => {
    if (solved || !selectedLeft) return;
    setMatches(prev => {
      const next = { ...prev };
      for (const l of Object.keys(next)) if (next[l] === right) delete next[l]; // right уникален
      next[selectedLeft] = right;
      return next;
    });
    setSelectedLeft(null);
  };

  const allMatched = lefts.length > 0 && lefts.every(l => matches[l]);

  const submit = () => {
    if (!allMatched || solved) return;
    onSubmit({ matches });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-cyber-border px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Link2 size={14} className="text-cyber-purple animate-pulse-neon" />
          <span className="text-cyber-purple text-xs font-bold tracking-widest">СОПОСТАВЛЕНИЕ</span>
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

        <div className="text-cyber-text text-sm leading-snug">{task.question_ru}</div>
        <div className="text-[10px] text-cyber-muted italic">
          Выберите элемент слева, затем его пару справа. Повторный выбор переназначает пару.
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Левая колонка */}
          <div className="space-y-2">
            {lefts.map(left => {
              const matched = matches[left];
              const active  = selectedLeft === left;
              return (
                <button key={left} disabled={solved}
                  onClick={() => setSelectedLeft(active ? null : left)}
                  className={`w-full text-left px-3 py-2 border text-xs transition
                    ${active
                      ? 'border-cyber-blue bg-cyber-blue/15 text-cyber-blue'
                      : matched
                        ? 'border-cyber-neon/50 text-cyber-text'
                        : 'border-cyber-border text-cyber-text hover:border-cyber-blue'}
                    ${solved ? 'cursor-default' : 'cursor-pointer'}`}>
                  <div className="font-bold">{left}</div>
                  {matched && (
                    <div className="text-[10px] text-cyber-neon mt-0.5 flex items-center gap-1">
                      <Check size={10} /> {matched}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Правая колонка */}
          <div className="space-y-2">
            {rights.map(right => {
              const owner    = rightOwner(right);
              const disabled = solved || !selectedLeft;
              return (
                <button key={right} disabled={disabled}
                  onClick={() => assign(right)}
                  className={`w-full text-left px-3 py-2 border text-xs transition
                    ${owner ? 'border-cyber-neon/40 bg-cyber-dark text-cyber-muted'
                            : 'border-cyber-border text-cyber-text'}
                    ${disabled ? 'cursor-not-allowed opacity-70' : 'hover:border-cyber-blue cursor-pointer'}`}>
                  {right}
                  {owner && <span className="block text-[9px] text-cyber-muted mt-0.5">↔ {owner}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {result && (
          <div className={`text-xs border px-3 py-2
            ${result.correct
              ? 'border-cyber-neon text-cyber-neon shadow-neon'
              : 'border-cyber-red text-cyber-red'}`}>
            {result.message_ru}
          </div>
        )}
      </div>

      {!solved && (
        <div className="border-t border-cyber-border p-3 flex-shrink-0">
          <div className="flex gap-2">
            <button onClick={submit} disabled={!allMatched}
              className="flex-1 flex items-center justify-center gap-1 py-2 bg-cyber-purple text-black text-xs font-bold tracking-widest hover:opacity-90 transition disabled:opacity-30">
              <Send size={12} />
              ПРОВЕРИТЬ ({Object.keys(matches).length}/{lefts.length})
            </button>
            {isCaptain && (
              <button onClick={onAbandon}
                className="px-3 py-2 border border-cyber-red text-cyber-red text-xs hover:bg-cyber-red hover:text-black transition flex items-center gap-1">
                <X size={12} />
                Покинуть
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
