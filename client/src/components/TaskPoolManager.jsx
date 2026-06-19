import { useMemo, useRef, useState } from 'react';
import { X, Download, Upload, Check, Search, ListChecks } from 'lucide-react';

const TYPE_LABELS = {
  text_phrase:       'ЛОГИКА',
  multiple_choice:   'ТЕСТ',
  code_repair:       'КОД',
  full_code:         'КОД·ФН',
  interactive_match: 'ПАРЫ',
};
const TYPE_COLORS = {
  text_phrase: '#00f5a0', multiple_choice: '#00c8ff', code_repair: '#ffd60a',
  full_code: '#ff9f0a', interactive_match: '#bf5af2',
};
const LEVEL_COLORS = ['', '#4ae54a', '#99ff44', '#ffd60a', '#ff9f0a', '#ff2d55'];

// Менеджер пула задач (учитель, перед стартом). Выбор чекбоксами + экспорт/импорт пака.
export default function TaskPoolManager({
  catalog, selectedIds, onToggle, onSetMany, onApply, onExport, onImportFile, onClose,
}) {
  const [q,        setQ]        = useState('');
  const [lvl,      setLvl]      = useState(0);     // 0 = все
  const [type,     setType]     = useState('all');
  const fileRef = useRef(null);

  const selected = useMemo(() => new Set((selectedIds || []).map(String)), [selectedIds]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return catalog.filter(t => {
      if (lvl !== 0 && t.level !== lvl) return false;
      if (type !== 'all' && t.type !== type) return false;
      if (needle && !(`${t.question_ru} ${t.id}`.toLowerCase().includes(needle))) return false;
      return true;
    });
  }, [catalog, q, lvl, type]);

  const filteredIds = useMemo(() => filtered.map(t => String(t.id)), [filtered]);
  const allShownSelected = filteredIds.length > 0 && filteredIds.every(id => selected.has(id));

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (f) onImportFile(f);
    e.target.value = '';   // позволяем повторно выбрать тот же файл
  };

  return (
    <div className="fixed inset-0 z-[135] flex items-center justify-center p-4 bg-cyber-dark/90 backdrop-blur-sm font-mono">
      <div className="w-full max-w-3xl h-[88vh] bg-cyber-panel border border-cyber-purple shadow-neon flex flex-col overflow-hidden">

        {/* Шапка */}
        <div className="flex items-center justify-between border-b border-cyber-border px-5 py-3 flex-shrink-0">
          <span className="text-cyber-purple font-bold tracking-widest text-sm flex items-center gap-2">
            <ListChecks size={16} /> ПУЛ ЗАДАЧ МАТЧА
          </span>
          <span className="text-xs text-cyber-muted">
            Выбрано: <span className="text-cyber-neon font-bold">{selected.size}</span> / {catalog.length}
          </span>
          <button onClick={onClose} className="text-cyber-muted hover:text-cyber-red"><X size={18} /></button>
        </div>

        {/* Фильтры */}
        <div className="border-b border-cyber-border px-4 py-2 flex items-center gap-2 flex-wrap flex-shrink-0">
          <div className="flex items-center gap-1.5 bg-cyber-dark border border-cyber-border px-2 py-1 flex-1 min-w-[160px]">
            <Search size={13} className="text-cyber-muted" />
            <input
              value={q} onChange={e => setQ(e.target.value)} placeholder="Поиск по тексту / id…"
              className="bg-transparent text-cyber-text text-xs focus:outline-none w-full"
            />
          </div>
          <div className="flex gap-1">
            <button onClick={() => setLvl(0)}
              className={`px-2 py-1 text-[10px] tracking-widest ${lvl === 0 ? 'bg-cyber-border text-cyber-text' : 'text-cyber-muted hover:text-cyber-text'}`}>ВСЕ</button>
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} onClick={() => setLvl(n)}
                className={`px-2 py-1 text-[10px] tracking-widest ${lvl === n ? 'text-black font-bold' : 'text-cyber-muted hover:text-cyber-text'}`}
                style={lvl === n ? { background: LEVEL_COLORS[n] } : {}}>L{n}</button>
            ))}
          </div>
          <div className="flex gap-1">
            {[['all', 'ВСЕ'], ['text_phrase', 'ЛОГ'], ['multiple_choice', 'ТЕСТ'], ['code_repair', 'КОД'], ['full_code', 'ФН'], ['interactive_match', 'ПАРЫ']].map(([k, l]) => (
              <button key={k} onClick={() => setType(k)}
                className={`px-2 py-1 text-[10px] tracking-widest ${type === k ? 'bg-cyber-blue text-black font-bold' : 'text-cyber-muted hover:text-cyber-text'}`}>{l}</button>
            ))}
          </div>
        </div>

        {/* Действие над показанными */}
        <div className="border-b border-cyber-border px-4 py-1.5 flex items-center justify-between text-[10px] text-cyber-muted flex-shrink-0">
          <span>Показано: {filtered.length}</span>
          <button
            onClick={() => onSetMany(filteredIds, !allShownSelected)}
            className="px-2 py-1 border border-cyber-border text-cyber-text hover:border-cyber-neon hover:text-cyber-neon tracking-widest">
            {allShownSelected ? 'СНЯТЬ ПОКАЗАННЫЕ' : 'ОТМЕТИТЬ ПОКАЗАННЫЕ'}
          </button>
        </div>

        {/* Список */}
        <div className="flex-1 overflow-y-auto p-2">
          {filtered.length === 0 && (
            <div className="text-center text-cyber-muted text-xs italic py-10">Ничего не найдено.</div>
          )}
          {filtered.map(t => {
            const id = String(t.id);
            const on = selected.has(id);
            return (
              <label key={id}
                className="flex items-start gap-2 px-2 py-1.5 border-b border-cyber-border/40 cursor-pointer hover:bg-cyber-dark/60">
                <input type="checkbox" checked={on} onChange={() => onToggle(id)} className="mt-0.5 accent-cyber-neon flex-shrink-0" />
                <span className="text-[9px] px-1 py-0.5 font-bold flex-shrink-0 tabular-nums" style={{ color: LEVEL_COLORS[t.level] }}>L{t.level}</span>
                <span className="text-[9px] px-1 py-0.5 font-bold flex-shrink-0 tracking-widest" style={{ color: TYPE_COLORS[t.type] || '#9fb3c8' }}>
                  {TYPE_LABELS[t.type] || t.type}
                </span>
                <span className="text-xs text-cyber-text flex-1 min-w-0 truncate" title={t.question_ru}>
                  {t.imported && <span className="text-cyber-purple mr-1">[пак]</span>}
                  {t.isCustom && !t.imported && <span className="text-cyber-yellow mr-1">[свой]</span>}
                  {t.question_ru}
                </span>
                <span className="text-[9px] text-cyber-muted flex-shrink-0">#{id}</span>
              </label>
            );
          })}
        </div>

        {/* Подвал: импорт / экспорт / применить */}
        <div className="border-t border-cyber-border p-3 flex items-center gap-2 flex-wrap flex-shrink-0">
          <input ref={fileRef} type="file" accept="application/json,.json" onChange={handleFile} className="hidden" />
          <button onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 border border-cyber-blue text-cyber-blue text-xs font-bold tracking-widest hover:bg-cyber-blue hover:text-black transition">
            <Upload size={14} /> ИМПОРТ ПАКА
          </button>
          <button onClick={onExport} disabled={selected.size === 0}
            className="flex items-center gap-1.5 px-3 py-2 border border-cyber-purple text-cyber-purple text-xs font-bold tracking-widest hover:bg-cyber-purple hover:text-black transition disabled:opacity-30">
            <Download size={14} /> ЭКСПОРТ ПАКА
          </button>
          <button onClick={() => onApply()} disabled={selected.size === 0}
            className="ml-auto flex items-center gap-1.5 px-5 py-2 bg-cyber-neon text-black text-xs font-bold tracking-widest hover:opacity-90 transition disabled:opacity-30">
            <Check size={14} /> ПРИМЕНИТЬ ПУЛ ({selected.size})
          </button>
        </div>
      </div>
    </div>
  );
}
