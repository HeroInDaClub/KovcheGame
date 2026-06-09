import { Lightbulb } from 'lucide-react';

// Прогрессивные подсказки. Каждая открытая = -10 очков с финальной награды.
// Подсказки требует только капитан (request_hint на сервере); видят все.

export default function HintsBlock({ task, hintsRevealed = 0, revealedHints = {}, canReveal, onRequestHint }) {
  if (!Array.isArray(task.hints) || task.hints.length === 0) return null;

  const total = task.hints.length;
  const canShowNext = canReveal && hintsRevealed < total;

  return (
    <div className="space-y-1.5">
      {/* Уже открытые подсказки */}
      {Array.from({ length: hintsRevealed }).map((_, i) => {
        const text = revealedHints[i] || task.hints[i];   // fallback на локальный текст
        return (
          <div key={i} className="border border-cyber-yellow/40 bg-cyber-yellow/5 px-3 py-2 text-[11px] text-cyber-yellow flex gap-2">
            <Lightbulb size={11} className="flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-[9px] text-cyber-muted tracking-widest mr-1">ПОДСКАЗКА {i + 1}/{total}:</span>
              {text}
            </div>
          </div>
        );
      })}

      {/* Кнопка следующей подсказки */}
      {canShowNext && (
        <button
          onClick={() => onRequestHint(hintsRevealed)}
          className="w-full flex items-center justify-center gap-1 py-1.5 text-[10px] text-cyber-yellow hover:text-cyber-text border border-cyber-yellow/30 hover:border-cyber-yellow transition tracking-widest"
        >
          <Lightbulb size={10} />
          ОТКРЫТЬ ПОДСКАЗКУ {hintsRevealed + 1}/{total} (−10 очков)
        </button>
      )}

      {!canReveal && hintsRevealed === 0 && task.hints.length > 0 && (
        <div className="text-[10px] text-cyber-muted text-center italic">
          Подсказки открывает капитан (штраф −10 очков за каждую)
        </div>
      )}
    </div>
  );
}
