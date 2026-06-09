// ============================================================
// CodeBlock — лёгкий подсветчик синтаксиса для Python/КуМир/Pascal
// Без внешних зависимостей. Распознаёт: keywords, строки,
// комментарии, числа и плейсхолдер ▓▓▓ (для code_repair).
// ============================================================

const KEYWORDS = {
  python: new Set([
    'if','elif','else','for','while','def','return','in','not','and','or',
    'true','false','none','import','from','as','lambda','print','input',
    'int','str','float','range','len','sum','max','min','set','dict','list','tuple',
    'try','except','finally','raise','with','class','pass','break','continue','yield','global','nonlocal',
  ]),
  kumir: new Set([
    'алг','нач','кон','цел','вещ','лог','сим','лит','таб','таблица',
    'арг','рез','аргрез','знач',
    'если','то','иначе','все',
    'нц','кц','для','от','до','шаг','пока','раз',
    'да','нет','и','или','не',
    'ввод','вывод','утв','утверждение','выход','стоп',
    'div','mod','мод','длин',
  ]),
  pascal: new Set([
    'program','var','const','type','begin','end','if','then','else',
    'while','do','for','to','downto','repeat','until',
    'procedure','function','integer','real','boolean','char','string',
    'and','or','not','div','mod','xor','shl','shr',
    'write','writeln','read','readln','true','false','of','array','record','case',
    'break','continue','exit',
  ]),
};

const COMMENT_MARKERS = {
  python: { line: '#' },
  pascal: { block: ['{', '}'], altLine: '//' },
  kumir:  { line: '|' },
};

// Простой токенизатор: возвращает массив сегментов { type, text }
function tokenize(code, lang) {
  const kw = KEYWORDS[lang] || new Set();
  const cm = COMMENT_MARKERS[lang] || {};
  const tokens = [];
  let i = 0;

  const isIdentStart = ch => /[a-zA-Zа-яА-Я_]/.test(ch);
  const isIdentCont  = ch => /[a-zA-Zа-яА-Я0-9_]/.test(ch);

  while (i < code.length) {
    const ch  = code[i];
    const two = code.slice(i, i + 2);
    const tri = code.slice(i, i + 3);

    // Плейсхолдер ▓▓▓ (для code_repair)
    if (tri === '▓▓▓') {
      tokens.push({ type: 'placeholder', text: '▓▓▓' });
      i += 3;
      continue;
    }

    // Перевод строки — сохраняем как есть, обработает <pre>
    if (ch === '\n') {
      tokens.push({ type: 'newline', text: '\n' });
      i++;
      continue;
    }

    // Блочный комментарий { ... } (Pascal)
    if (cm.block && ch === cm.block[0]) {
      const end = code.indexOf(cm.block[1], i + 1);
      const stop = end === -1 ? code.length : end + 1;
      tokens.push({ type: 'comment', text: code.slice(i, stop) });
      i = stop;
      continue;
    }

    // Однострочный комментарий
    if (cm.altLine && two === cm.altLine) {
      const end = code.indexOf('\n', i);
      const stop = end === -1 ? code.length : end;
      tokens.push({ type: 'comment', text: code.slice(i, stop) });
      i = stop;
      continue;
    }
    if (cm.line && ch === cm.line) {
      const end = code.indexOf('\n', i);
      const stop = end === -1 ? code.length : end;
      tokens.push({ type: 'comment', text: code.slice(i, stop) });
      i = stop;
      continue;
    }

    // Строковый литерал
    if (ch === '"' || ch === "'") {
      const quote = ch;
      let j = i + 1;
      while (j < code.length && code[j] !== quote && code[j] !== '\n') j++;
      const stop = code[j] === quote ? j + 1 : j;
      tokens.push({ type: 'string', text: code.slice(i, stop) });
      i = stop;
      continue;
    }

    // Число (включая дробное)
    if (/\d/.test(ch)) {
      let j = i;
      while (j < code.length && /[\d.]/.test(code[j])) j++;
      tokens.push({ type: 'number', text: code.slice(i, j) });
      i = j;
      continue;
    }

    // Идентификатор → может оказаться ключевым словом
    if (isIdentStart(ch)) {
      let j = i;
      while (j < code.length && isIdentCont(code[j])) j++;
      const word = code.slice(i, j);
      tokens.push({
        type: kw.has(word.toLowerCase()) ? 'keyword' : 'identifier',
        text: word,
      });
      i = j;
      continue;
    }

    // Операторы := и ==
    if (two === ':=' || two === '==' || two === '<=' || two === '>=' || two === '!=' || two === '<>' || two === '+=' || two === '-=') {
      tokens.push({ type: 'operator', text: two });
      i += 2;
      continue;
    }

    // Одиночный оператор/символ
    if (/[+\-*/%=<>!()[\]{}:;,.]/.test(ch)) {
      tokens.push({ type: 'operator', text: ch });
      i++;
      continue;
    }

    // Пробел/таб — как есть
    tokens.push({ type: 'space', text: ch });
    i++;
  }
  return tokens;
}

const TOKEN_CLASS = {
  keyword:     'text-cyber-purple font-bold',
  string:      'text-cyber-yellow',
  comment:     'text-cyber-muted italic',
  number:      'text-cyber-blue',
  operator:    'text-cyber-text',
  identifier:  'text-cyber-text',
  space:       '',
  newline:     '',
  placeholder: 'bg-cyber-red text-black px-1.5 py-0.5 rounded font-bold animate-pulse-neon mx-0.5',
};

const LANG_LABEL = {
  python: 'PYTHON',
  kumir:  'КУМИР',
  pascal: 'PASCAL',
};

export default function CodeBlock({ code, language, showHeader = true }) {
  if (!code) return null;
  const tokens = tokenize(code, language);

  return (
    <div className="border border-cyber-border bg-cyber-black">
      {showHeader && (
        <div className="flex items-center justify-between px-3 py-1 border-b border-cyber-border bg-cyber-panel">
          <div className="flex items-center gap-2 text-[10px] tracking-widest">
            <span className="w-2 h-2 rounded-full bg-cyber-red" />
            <span className="w-2 h-2 rounded-full bg-cyber-yellow" />
            <span className="w-2 h-2 rounded-full bg-cyber-neon" />
            <span className="text-cyber-muted ml-2">// ПОВРЕЖДЁННЫЙ КОД</span>
          </div>
          <span className="text-[10px] text-cyber-blue tracking-[0.2em]">
            [ {LANG_LABEL[language] || language?.toUpperCase()} ]
          </span>
        </div>
      )}
      <pre className="px-3 py-2.5 overflow-x-auto text-[11px] leading-relaxed font-mono whitespace-pre">
        <code>
          {tokens.map((tok, idx) => (
            <span key={idx} className={TOKEN_CLASS[tok.type] || ''}>{tok.text}</span>
          ))}
        </code>
      </pre>
    </div>
  );
}
