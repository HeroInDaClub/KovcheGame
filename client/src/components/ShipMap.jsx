import { useState } from 'react';

// ── Ship SVG Layout ──────────────────────────────────────
// 12 sectors arranged as a bird's-eye view of an interstellar ark.
// variant='panel'     — компактная карта для сайдбара (с легендой).
// variant='projector' — карта на весь контейнер для вывода на проектор.
// ─────────────────────────────────────────────────────────

const SECTOR_PATHS = [
  { id: 1,  label: 'ШЛЮЗ',          points: '245,10 255,10 270,40 230,40' },
  { id: 2,  label: 'НАВИГАЦИЯ',     points: '200,42 300,42 310,90 190,90' },
  { id: 3,  label: 'ВЕБ-ИНТЕРФЕЙС', points: '160,92 190,92 200,145 150,140' },
  { id: 4,  label: 'ЯДРО ОС',       points: '190,92 230,92 230,145 200,145' },
  { id: 5,  label: 'КОД-СЕРВЕР',    points: '230,92 270,92 270,145 230,145' },
  { id: 6,  label: 'РЕАКТОР',       points: '270,92 310,92 350,140 300,145' },
  { id: 7,  label: 'АНГАР',         points: '110,142 150,142 160,195 105,190' },
  { id: 8,  label: 'СКЛАД',         points: '150,142 230,145 230,195 150,195' },
  { id: 9,  label: 'КОМ. ЦЕНТР',    points: '230,145 270,145 270,195 230,195' },
  { id: 10, label: 'СЕРВЕРНАЯ',     points: '270,145 350,142 395,190 270,195' },
  { id: 11, label: 'БЕЗОПАСНОСТЬ',  points: '105,192 230,197 230,245 100,240' },
  { id: 12, label: 'КАПСУЛЫ',       points: '230,197 395,192 400,242 230,245' },
];

const TAIL_PATH = 'M 220,247 L 280,247 L 295,290 L 205,290 Z';
const HULL_PATH = `M 250,5
  L 320,42 L 360,90 L 400,140 L 410,195 L 400,245 L 290,290 L 210,290 L 100,245
  L 90,195 L 100,140 L 140,90 L 180,42 Z`;

const NEUTRAL = '#0d1526';

function centroid(points) {
  const pts = points.split(' ').map(p => p.split(',').map(Number));
  const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
  const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
  return { cx, cy };
}

export default function ShipMap({ mapSectors, teams, variant = 'panel' }) {
  const [hovered, setHovered] = useState(null);
  const projector = variant === 'projector';

  const teamColorMap = {};
  for (const t of Object.values(teams)) teamColorMap[t.teamName] = t.color;

  const getSector      = (id) => mapSectors.find(s => s.id === id);
  const getSectorColor = (id) => {
    const s = getSector(id);
    return s?.capturedBy ? (teamColorMap[s.capturedBy] || NEUTRAL) : NEUTRAL;
  };
  const getSectorOpacity = (id) => (getSector(id)?.capturedBy ? 0.55 : 0.3);

  const hoveredSector = hovered ? getSector(hovered) : null;

  // Размеры подписей/иконок и динамический вертикальный офсет, чтобы
  // номер (сверху), название (по центру) и маркер команды (снизу) не накладывались.
  const fsLabel = projector ? 6   : 5.5;
  const fsNum   = projector ? 5.5 : 5;
  const dotR    = projector ? 2   : 1.6;
  const off     = fsLabel + 4;          // динамический сдвиг от центроида

  return (
    <div className={`relative ${projector ? 'w-full h-full flex items-center justify-center' : ''}`}>
      {/* Tooltip — самый верхний слой (HTML поверх SVG) */}
      {hoveredSector && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[100] bg-cyber-panel border border-cyber-blue px-3 py-1.5 text-xs text-cyber-text whitespace-nowrap pointer-events-none shadow-neon">
          <span className="text-cyber-blue font-bold">#{hoveredSector.id} {hoveredSector.name_ru}</span>
          {hoveredSector.capturedBy
            ? <span className="ml-2 font-bold" style={{ color: teamColorMap[hoveredSector.capturedBy] }}>→ {hoveredSector.capturedBy}</span>
            : <span className="ml-2 text-cyber-muted">→ нейтральный</span>}
          <span className="ml-2 text-cyber-muted">({hoveredSector.points} очков)</span>
        </div>
      )}

      <svg
        viewBox="80 0 340 300"
        className={projector
          ? 'w-full h-full drop-shadow-lg'
          : 'w-full max-w-xs mx-auto drop-shadow-lg'}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Корпус */}
        <path d={HULL_PATH} fill="none" stroke="#1a2744" strokeWidth="1.5" />

        {/* Слой 1: заливки секторов (интерактивные) */}
        {SECTOR_PATHS.map(sec => {
          const color = getSectorColor(sec.id);
          const neutral = color === NEUTRAL;
          return (
            <polygon
              key={sec.id}
              points={sec.points}
              fill={color}
              fillOpacity={getSectorOpacity(sec.id)}
              stroke={neutral ? '#1a2744' : color}
              strokeWidth="0.8"
              strokeOpacity={neutral ? 0.6 : 1}
              className="transition-all duration-700 cursor-pointer"
              onMouseEnter={() => setHovered(sec.id)}
              onMouseLeave={() => setHovered(null)}
            />
          );
        })}

        {/* Слой 2: название сектора + маркер команды (со смещением от центра) */}
        {SECTOR_PATHS.map(sec => {
          const { cx, cy } = centroid(sec.points);
          const color = getSectorColor(sec.id);
          const captured = color !== NEUTRAL;
          return (
            <g key={`lbl-${sec.id}`} pointerEvents="none">
              <text
                x={cx} y={cy}
                textAnchor="middle" dominantBaseline="middle"
                fontSize={fsLabel} fontFamily="monospace"
                fontWeight={captured ? 'bold' : 'normal'}
                fill={captured ? '#e8f0ff' : '#4a6080'}
                fillOpacity={captured ? 1 : 0.85}
              >
                {sec.label}
              </text>
              {/* Маркер захватившей команды — динамически ниже названия */}
              {captured && (
                <circle
                  cx={cx} cy={cy + off} r={dotR}
                  fill={color}
                  stroke="#0a0f1e" strokeWidth="0.5"
                  style={{ filter: `drop-shadow(0 0 2px ${color})` }}
                />
              )}
            </g>
          );
        })}

        {/* Дюзы двигателя + нос */}
        <path d={TAIL_PATH} fill="#0a0f1e" stroke="#1a2744" strokeWidth="1" />
        <circle cx="250" cy="12" r="4" fill="#00c8ff" fillOpacity="0.4" />
        <circle cx="250" cy="12" r="2" fill="#00c8ff" fillOpacity="0.9" />

        {/* Слой 3 (верхний): НОМЕРА секторов — рисуются последними = поверх всего */}
        {SECTOR_PATHS.map(sec => {
          const { cx, cy } = centroid(sec.points);
          const color = getSectorColor(sec.id);
          const captured = color !== NEUTRAL;
          const ny = cy - off;          // динамический сдвиг вверх от центра
          return (
            <g key={`num-${sec.id}`} pointerEvents="none">
              <circle
                cx={cx} cy={ny} r={fsNum * 0.95}
                fill="#0a0f1e"
                stroke={captured ? color : '#2a3a55'}
                strokeWidth="0.7"
              />
              <text
                x={cx} y={ny}
                textAnchor="middle" dominantBaseline="central"
                fontSize={fsNum} fontFamily="monospace" fontWeight="bold"
                fill={captured ? color : '#7090b0'}
              >
                {sec.id}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Легенда — только в компактном режиме */}
      {!projector && (
        <div className="mt-3 flex flex-wrap gap-2 justify-center">
          {Object.values(teams).filter(t => t.members.length > 0).map(t => (
            <div key={t.teamName} className="flex items-center gap-1 text-[10px]">
              <div className="w-3 h-3 rounded-sm" style={{ background: t.color, boxShadow: `0 0 4px ${t.color}` }} />
              <span className="text-cyber-muted">{t.teamName}</span>
            </div>
          ))}
          <div className="flex items-center gap-1 text-[10px]">
            <div className="w-3 h-3 rounded-sm bg-cyber-panel border border-cyber-border" />
            <span className="text-cyber-muted">Нейтральный</span>
          </div>
        </div>
      )}
    </div>
  );
}
