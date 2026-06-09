import { useState } from 'react';

// ── Ship SVG Layout ──────────────────────────────────────
// 12 sectors arranged as a bird's-eye view of an interstellar ark.
// The ship has a central spine and symmetric wing sections.
// ─────────────────────────────────────────────────────────

const SECTOR_PATHS = [
  // id, label, SVG polygon points (500×340 viewport)
  { id: 1,  label: 'ШЛЮЗ',         points: '245,10 255,10 270,40 230,40' },
  { id: 2,  label: 'НАВИГАЦИЯ',    points: '200,42 300,42 310,90 190,90' },
  { id: 3,  label: 'ВЕБ-ИНТЕРФЕЙС',  points: '160,92 190,92 200,145 150,140' },
  { id: 4,  label: 'ЯДРО ОС',      points: '190,92 230,92 230,145 200,145' },
  { id: 5,  label: 'КОД-СЕРВЕР',   points: '230,92 270,92 270,145 230,145' },
  { id: 6,  label: 'РЕАКТОР',      points: '270,92 310,92 350,140 300,145' },
  { id: 7,  label: 'АНГАР',        points: '110,142 150,142 160,195 105,190' },
  { id: 8,  label: 'СКЛАД',        points: '150,142 230,145 230,195 150,195' },
  { id: 9,  label: 'КОМ. ЦЕНТР',   points: '230,145 270,145 270,195 230,195' },
  { id: 10, label: 'СЕРВЕРНАЯ',    points: '270,145 350,142 395,190 270,195' },
  { id: 11, label: 'БЕЗОПАСНОСТЬ', points: '105,192 230,197 230,245 100,240' },
  { id: 12, label: 'КАПСУЛЫ',      points: '230,197 395,192 400,242 230,245' },
];

// Hex tail / engine nozzle
const TAIL_PATH = 'M 220,247 L 280,247 L 295,290 L 205,290 Z';
const HULL_PATH = `M 250,5
  L 320,42 L 360,90 L 400,140 L 410,195 L 400,245 L 290,290 L 210,290 L 100,245
  L 90,195 L 100,140 L 140,90 L 180,42 Z`;

export default function ShipMap({ mapSectors, teams }) {
  const [hovered, setHovered] = useState(null);

  const teamColorMap = {};
  for (const t of Object.values(teams)) {
    teamColorMap[t.teamName] = t.color;
  }

  function getSectorColor(sectorId) {
    const sector = mapSectors.find(s => s.id === sectorId);
    if (!sector?.capturedBy) return '#0d1526';
    return teamColorMap[sector.capturedBy] || '#0d1526';
  }

  function getSectorOpacity(sectorId) {
    const sector = mapSectors.find(s => s.id === sectorId);
    return sector?.capturedBy ? 0.5 : 0.3;
  }

  const hoveredSector = hovered ? mapSectors.find(s => s.id === hovered) : null;

  return (
    <div className="relative">
      {/* Tooltip */}
      {hoveredSector && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 bg-cyber-panel border border-cyber-border px-3 py-1 text-xs text-cyber-text whitespace-nowrap pointer-events-none">
          <span className="text-cyber-blue">{hoveredSector.name_ru}</span>
          {hoveredSector.capturedBy
            ? <span className="ml-2" style={{ color: teamColorMap[hoveredSector.capturedBy] }}>→ {hoveredSector.capturedBy}</span>
            : <span className="ml-2 text-cyber-muted">→ нейтральный</span>
          }
          <span className="ml-2 text-cyber-muted">({hoveredSector.points} очков)</span>
        </div>
      )}

      <svg
        viewBox="80 0 340 300"
        className="w-full max-w-xs mx-auto drop-shadow-lg"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Hull outline */}
        <path d={HULL_PATH} fill="none" stroke="#1a2744" strokeWidth="1.5" />

        {/* Sector fills */}
        {SECTOR_PATHS.map(sec => (
          <polygon
            key={sec.id}
            points={sec.points}
            fill={getSectorColor(sec.id)}
            fillOpacity={getSectorOpacity(sec.id)}
            stroke={getSectorColor(sec.id) === '#0d1526' ? '#1a2744' : getSectorColor(sec.id)}
            strokeWidth="0.8"
            strokeOpacity={getSectorColor(sec.id) === '#0d1526' ? 0.6 : 1}
            className="transition-all duration-700 cursor-pointer"
            onMouseEnter={() => setHovered(sec.id)}
            onMouseLeave={() => setHovered(null)}
          />
        ))}

        {/* Sector labels */}
        {SECTOR_PATHS.map(sec => {
          const pts = sec.points.split(' ').map(p => p.split(',').map(Number));
          const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
          const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
          const color = getSectorColor(sec.id);
          const captured = color !== '#0d1526';
          return (
            <text
              key={sec.id}
              x={cx}
              y={cy}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="5.5"
              fontFamily="monospace"
              fill={captured ? color : '#4a6080'}
              fillOpacity={captured ? 1 : 0.8}
            >
              {sec.label}
            </text>
          );
        })}

        {/* Engine nozzle */}
        <path d={TAIL_PATH} fill="#0a0f1e" stroke="#1a2744" strokeWidth="1" />

        {/* Nose cone accent */}
        <circle cx="250" cy="12" r="4" fill="#00c8ff" fillOpacity="0.4" />
        <circle cx="250" cy="12" r="2" fill="#00c8ff" fillOpacity="0.9" />
      </svg>

      {/* Legend */}
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
    </div>
  );
}
