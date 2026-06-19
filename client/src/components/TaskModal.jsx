import { useState } from 'react';
import { AlertTriangle, Check, X } from 'lucide-react';
import MultipleChoicePanel   from './MultipleChoicePanel.jsx';
import CodeRepairPanel       from './CodeRepairPanel.jsx';
import TextPhrasePanel       from './TextPhrasePanel.jsx';
import FullCodePanel         from './FullCodePanel.jsx';
import InteractiveMatchPanel from './InteractiveMatchPanel.jsx';

// Модальное окно активной задачи. Открыто, пока task != null
// (источник истины — activeTaskId в room_state). Диспатчит панель по типу.

const PANELS = {
  multiple_choice:   MultipleChoicePanel,
  code_repair:       CodeRepairPanel,
  text_phrase:       TextPhrasePanel,
  full_code:         FullCodePanel,
  interactive_match: InteractiveMatchPanel,
};

const isEmpty = (a) => a == null || (typeof a === 'string' && !a.trim());

// Человекочитаемое превью отправляемого ответа для окна подтверждения.
function previewAnswer(answer) {
  if (typeof answer === 'string') return answer.length > 280 ? answer.slice(0, 280) + '…' : answer;
  const matches = (answer && answer.matches) ? answer.matches : answer;
  if (matches && typeof matches === 'object') {
    return Object.entries(matches).map(([l, r]) => `${l} → ${r}`).join('\n');
  }
  return String(answer);
}

export default function TaskModal({ task, result, isCaptain, onSubmit, onAbandon }) {
  // Ответ, ожидающий подтверждения перед отправкой на сервер.
  const [pending, setPending] = useState(null);

  if (!task) return null;

  // Перехватываем отправку из панели: пустой ответ пропускаем как есть
  // (сервер вернёт «Введите ответ»), непустой — требуем подтверждения.
  const requestSubmit = (answer) => {
    if (isEmpty(answer)) return onSubmit(answer);
    setPending({ answer });
  };
  const confirmSubmit = () => { onSubmit(pending.answer); setPending(null); };

  const Panel = PANELS[task.type];
  const common = { task, result, isCaptain, onSubmit: requestSubmit, onAbandon };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cyber-dark/90 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] bg-cyber-panel border border-cyber-blue shadow-blue flex flex-col overflow-hidden font-mono">
        {Panel
          ? <Panel {...common} />
          : <div className="p-6 text-cyber-red text-xs">Неизвестный тип задачи: {task.type}</div>}
      </div>

      {/* Подтверждение отправки ответа */}
      {pending && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-cyber-dark/80 backdrop-blur-sm font-mono"
             onClick={() => setPending(null)}>
          <div className="w-full max-w-md bg-cyber-panel border border-cyber-yellow shadow-neon flex flex-col overflow-hidden"
               onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 border-b border-cyber-border px-4 py-3 text-cyber-yellow text-sm font-bold tracking-widest">
              <AlertTriangle size={16} /> ПОДТВЕРДИТЕ ОТВЕТ
            </div>

            <div className="p-4 flex flex-col gap-3">
              <div className="text-[10px] tracking-widest text-cyber-muted">ВЫ ОТПРАВЛЯЕТЕ:</div>
              <pre className="bg-cyber-dark border border-cyber-border px-3 py-2 text-xs text-cyber-text whitespace-pre-wrap break-words max-h-40 overflow-y-auto">
                {previewAnswer(pending.answer)}
              </pre>
              {task.type === 'multiple_choice' && (
                <div className="text-cyber-red text-[11px]">
                  ⚠ У теста только одна попытка — изменить ответ потом нельзя.
                </div>
              )}
            </div>

            <div className="border-t border-cyber-border p-3 flex gap-2">
              <button onClick={() => setPending(null)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-cyber-border text-cyber-muted text-xs font-bold tracking-widest hover:text-cyber-text hover:border-cyber-text transition">
                <X size={14} /> ОТМЕНА
              </button>
              <button onClick={confirmSubmit}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-cyber-neon text-black text-xs font-bold tracking-widest hover:opacity-90 transition">
                <Check size={14} /> ОТПРАВИТЬ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
