import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';

const TYPES = [
  { key: 'text_phrase',      label: 'Текст',    desc: 'Свободный ответ' },
  { key: 'multiple_choice',  label: 'Выбор',    desc: 'Один из вариантов' },
  { key: 'code_repair',      label: 'Код',      desc: 'Вставить в код' },
];
const CATEGORIES = [
  { key: 'logic_crypto', label: 'Логика / Крипто' },
  { key: 'cs_theory',    label: 'Теория CS' },
  { key: 'programming',  label: 'Программирование' },
];
const LEVEL_COLORS = ['', '#00ff88', '#00cfff', '#ffcc00', '#ff8800', '#ff4455'];
const TYPE_BADGE   = { text_phrase: 'TXT', multiple_choice: 'MC', code_repair: 'CR' };

function CyberInput({ label, value, onChange, placeholder, multiline, disabled, mono }) {
  const cls = `w-full bg-cyber-dark border border-cyber-border text-cyber-text px-3 py-2 text-sm
    focus:outline-none focus:border-cyber-purple placeholder:text-cyber-muted
    ${mono ? 'font-mono text-xs' : ''} ${disabled ? 'opacity-40' : ''}`;
  return (
    <div className="space-y-1">
      {label && <div className="text-[10px] text-cyber-muted tracking-widest uppercase">{label}</div>}
      {multiline
        ? <textarea className={cls} rows={multiline} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled} />
        : <input    className={cls}                  value={value} onChange={onChange} placeholder={placeholder} disabled={disabled} />
      }
    </div>
  );
}

function ToggleBtn({ active, color = '#00ff88', onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 py-1.5 border text-xs font-bold tracking-wide transition-all duration-150"
      style={active
        ? { borderColor: color, background: color + '22', color }
        : { borderColor: '#1a2744', color: '#4a6a8a' }
      }
    >
      {children}
    </button>
  );
}

const EMPTY_FORM = {
  type: 'text_phrase',
  level: 1,
  category: 'logic_crypto',
  question_ru: '',
  correct_answer: '',
  code_snippet: '',
  options: ['', '', '', ''],
  hints: ['', '', ''],
};

export default function TaskEditor({ customTasks = [], onAdd, onDelete, lastSaved }) {
  const [tab,    setTab]    = useState('add');   // 'add' | 'list'
  const [form,   setForm]   = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const setOption = (i, val) => setForm(f => {
    const opts = [...f.options];
    opts[i] = val;
    return { ...f, options: opts };
  });
  const setHint = (i, val) => setForm(f => {
    const hints = [...f.hints];
    hints[i] = val;
    return { ...f, hints };
  });

  const handleSubmit = () => {
    if (saving) return;
    const payload = {
      level:         form.level,
      type:          form.type,
      category:      form.category,
      question_ru:   form.question_ru.trim(),
      correct_answer: form.correct_answer.trim(),
      hints:         form.hints.map(h => h.trim()).filter(Boolean),
      ...(form.code_snippet.trim() && { code_snippet: form.code_snippet.trim() }),
      ...(form.type === 'multiple_choice' && {
        options: form.options.map(o => o.trim()).filter(Boolean),
      }),
    };
    setSaving(true);
    onAdd(payload);
    setTimeout(() => setSaving(false), 1500);
  };

  const isValid = () => {
    if (!form.question_ru.trim() || !form.correct_answer.trim()) return false;
    if (form.type === 'multiple_choice') {
      const filled = form.options.filter(o => o.trim());
      if (filled.length < 2) return false;
      if (!filled.includes(form.correct_answer.trim())) return false;
    }
    return true;
  };

  const afterSave = lastSaved && !saving;

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex border-b border-cyber-border">
        {[
          { key: 'add',  label: 'Новая задача' },
          { key: 'list', label: `Мои задачи (${customTasks.length})` },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-5 py-2 text-xs font-bold tracking-widest transition-colors
              ${tab === t.key
                ? 'border-b-2 border-cyber-purple text-cyber-purple'
                : 'text-cyber-muted hover:text-cyber-text'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── ADD FORM ──────────────────────────────────────── */}
      {tab === 'add' && (
        <div className="space-y-5">
          {/* Type */}
          <div className="space-y-1.5">
            <div className="text-[10px] text-cyber-muted tracking-widest uppercase">Тип задачи</div>
            <div className="flex gap-2">
              {TYPES.map(t => (
                <button key={t.key} type="button" onClick={() => set('type', t.key)}
                  className="flex-1 py-2 border text-xs tracking-wide transition-all"
                  style={form.type === t.key
                    ? { borderColor: '#a855f7', background: '#a855f722', color: '#a855f7' }
                    : { borderColor: '#1a2744', color: '#4a6a8a' }}>
                  <div className="font-bold">{t.label}</div>
                  <div className="text-[9px] opacity-70 mt-0.5">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Level + Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="text-[10px] text-cyber-muted tracking-widest uppercase">Уровень</div>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(n => (
                  <ToggleBtn key={n} active={form.level === n} color={LEVEL_COLORS[n]} onClick={() => set('level', n)}>
                    L{n}
                  </ToggleBtn>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="text-[10px] text-cyber-muted tracking-widest uppercase">Категория</div>
              <select
                className="w-full bg-cyber-dark border border-cyber-border text-cyber-text px-2 py-2 text-xs focus:outline-none focus:border-cyber-purple"
                value={form.category}
                onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
            </div>
          </div>

          {/* Question */}
          <CyberInput label="Вопрос" value={form.question_ru} multiline={3}
            onChange={e => set('question_ru', e.target.value)}
            placeholder="Текст задания…" />

          {/* Code snippet */}
          {(form.type === 'code_repair' || form.type === 'text_phrase') && (
            <CyberInput
              label={form.type === 'code_repair' ? 'Код (▓▓▓ = пропуск)' : 'Блок кода (необязательно)'}
              value={form.code_snippet} multiline={4} mono
              onChange={e => set('code_snippet', e.target.value)}
              placeholder={form.type === 'code_repair'
                ? 'def fib(n):\n    if n <= 1: return n\n    return ▓▓▓'
                : '// вставьте блок кода если нужен…'} />
          )}

          {/* Options (MC) */}
          {form.type === 'multiple_choice' && (
            <div className="space-y-1.5">
              <div className="text-[10px] text-cyber-muted tracking-widest uppercase">Варианты ответа</div>
              <div className="space-y-2">
                {form.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-[10px] text-cyber-muted w-4">{i + 1}.</span>
                    <input
                      className="flex-1 bg-cyber-dark border border-cyber-border text-cyber-text px-3 py-1.5 text-xs focus:outline-none focus:border-cyber-purple placeholder:text-cyber-muted"
                      value={opt}
                      onChange={e => setOption(i, e.target.value)}
                      placeholder={`Вариант ${i + 1}`}
                    />
                    {opt.trim() && opt.trim() === form.correct_answer.trim() && (
                      <CheckCircle size={14} className="text-cyber-neon flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
              <div className="text-[10px] text-cyber-muted pt-1">Правильный ответ должен совпадать с одним из вариантов</div>
            </div>
          )}

          {/* Correct answer */}
          <CyberInput
            label={form.type === 'multiple_choice' ? 'Правильный ответ (точное совпадение с вариантом)' : 'Правильный ответ'}
            value={form.correct_answer}
            onChange={e => set('correct_answer', e.target.value)}
            placeholder={form.type === 'code_repair' ? 'fib(n-1) + fib(n-2)' : '42'} />

          {/* Hints */}
          <div className="space-y-1.5">
            <div className="text-[10px] text-cyber-muted tracking-widest uppercase">Подсказки (−10 очков каждая)</div>
            <div className="space-y-2">
              {form.hints.map((h, i) => (
                <CyberInput key={i}
                  value={h}
                  onChange={e => setHint(i, e.target.value)}
                  placeholder={`Подсказка ${i + 1} (необязательно)`} />
              ))}
            </div>
          </div>

          {/* Validation warning for MC */}
          {form.type === 'multiple_choice' &&
           form.correct_answer.trim() &&
           !form.options.map(o => o.trim()).includes(form.correct_answer.trim()) && (
            <div className="text-cyber-red text-xs border border-cyber-red/30 px-3 py-2">
              ⚠ Правильный ответ не совпадает ни с одним вариантом
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!isValid() || saving}
            className="w-full py-2.5 font-bold tracking-widest text-sm uppercase transition-all disabled:opacity-30"
            style={{ background: afterSave ? '#00ff8833' : '#a855f7', color: afterSave ? '#00ff88' : '#000' }}>
            {saving      ? '⏳ Сохранение…'
             : afterSave  ? '✓ Задача сохранена'
             : <span className="flex items-center justify-center gap-2"><Plus size={14} /> Добавить задачу</span>}
          </button>

          {afterSave && (
            <button onClick={() => { setForm(EMPTY_FORM); }}
              className="w-full py-1.5 border border-cyber-border text-cyber-muted text-xs hover:text-cyber-text transition">
              + Добавить ещё одну
            </button>
          )}
        </div>
      )}

      {/* ── LIST ──────────────────────────────────────────── */}
      {tab === 'list' && (
        <div className="space-y-2">
          {customTasks.length === 0 && (
            <div className="text-center text-cyber-muted text-sm py-10">
              Пользовательских задач пока нет
            </div>
          )}
          {customTasks.map(task => (
            <div key={task.id} className="border border-cyber-border bg-cyber-dark">
              <div className="flex items-center gap-3 px-3 py-2">
                {/* Level badge */}
                <span className="text-[10px] font-bold px-1.5 py-0.5 border"
                  style={{ borderColor: LEVEL_COLORS[task.level], color: LEVEL_COLORS[task.level] }}>
                  L{task.level}
                </span>
                {/* Type badge */}
                <span className="text-[9px] text-cyber-muted font-mono">{TYPE_BADGE[task.type]}</span>
                {/* Question preview */}
                <span className="flex-1 text-xs text-cyber-text truncate">
                  {task.question_ru.replace(/\n/g, ' ')}
                </span>
                {/* Expand */}
                <button onClick={() => setExpandedId(expandedId === task.id ? null : task.id)}
                  className="text-cyber-muted hover:text-cyber-text transition">
                  {expandedId === task.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>
                {/* Delete */}
                <button onClick={() => onDelete(task.id)}
                  className="text-cyber-muted hover:text-cyber-red transition">
                  <Trash2 size={13} />
                </button>
              </div>

              {expandedId === task.id && (
                <div className="border-t border-cyber-border px-3 py-2 space-y-1.5 text-xs">
                  <div><span className="text-cyber-muted">Вопрос: </span>
                    <span className="text-cyber-text whitespace-pre-wrap">{task.question_ru}</span></div>
                  {task.code_snippet && (
                    <pre className="bg-cyber-black border border-cyber-border text-cyber-blue text-[10px] font-mono p-2 overflow-x-auto">
                      {task.code_snippet}
                    </pre>
                  )}
                  {task.type === 'multiple_choice' && task.options && (
                    <div className="space-y-0.5">
                      {task.options.map((o, i) => (
                        <div key={i} className={o === task.correct_answer ? 'text-cyber-neon' : 'text-cyber-muted'}>
                          {o === task.correct_answer ? '✓ ' : '  '}{o}
                        </div>
                      ))}
                    </div>
                  )}
                  {task.type !== 'multiple_choice' && (
                    <div><span className="text-cyber-muted">Ответ: </span>
                      <span className="text-cyber-neon font-mono">{task.correct_answer}</span></div>
                  )}
                  {task.hints?.length > 0 && (
                    <div className="text-cyber-muted text-[10px]">
                      {task.hints.map((h, i) => <div key={i}>💡 {h}</div>)}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
