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

export default function TaskModal({ task, result, isCaptain, onSubmit, onAbandon }) {
  if (!task) return null;

  const Panel = PANELS[task.type];
  const common = { task, result, isCaptain, onSubmit, onAbandon };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cyber-dark/90 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] bg-cyber-panel border border-cyber-blue shadow-blue flex flex-col overflow-hidden font-mono">
        {Panel
          ? <Panel {...common} />
          : <div className="p-6 text-cyber-red text-xs">Неизвестный тип задачи: {task.type}</div>}
      </div>
    </div>
  );
}
