import { useState, useEffect } from 'react';
import { socket } from '../socket.js';
import { History, ChevronLeft, Clock, LogIn, Crosshair, CheckCircle, XCircle, LogOut, Flag } from 'lucide-react';

const fmtClock = (ms) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};
const fmtDate = (ts) => (ts ? new Date(ts).toLocaleString('ru') : '—');
const fmtDur  = (sec) => (sec == null ? '—' : `${Math.floor(sec / 60)} мин ${sec % 60} сек`);

// ── Строка таймлайна ─────────────────────────────────────
function TimelineRow({ e }) {
  const color = e.color || '#4a6080';
  let icon, body;

  if (e.type === 'join') {
    icon = <LogIn size={12} className="text-cyber-muted" />;
    body = <><b style={{ color }}>{e.player}</b> вошёл в «{e.team}»{e.captain && <span className="text-cyber-neon"> · капитан</span>}</>;
  } else if (e.type === 'pick') {
    icon = <Crosshair size={12} className="text-cyber-blue" />;
    body = <><b style={{ color }}>{e.team}</b> выбрала задачу <span className="text-cyber-text">#{e.taskId}</span> <span className="text-cyber-muted">(ур.{e.level})</span></>;
  } else if (e.type === 'answer') {
    icon = e.correct ? <CheckCircle size={12} className="text-cyber-neon" /> : <XCircle size={12} className="text-cyber-red" />;
    body = (
      <>
        <b style={{ color }}>{e.team}</b>{' '}
        {e.correct ? <span className="text-cyber-neon">верно</span> : <span className="text-cyber-red">неверно</span>}
        {e.answer != null && <span className="text-cyber-muted"> «{e.answer}»</span>}
        {typeof e.points === 'number' && e.points !== 0 && (
          <span className={e.points > 0 ? 'text-cyber-neon' : 'text-cyber-red'}> {e.points > 0 ? '+' : ''}{e.points}</span>
        )}
        {e.sector && <span className="text-cyber-yellow"> · 🚩 {e.sector}</span>}
        {e.attempt != null && <span className="text-cyber-muted"> · попытка {e.attempt}</span>}
        {e.locked && <span className="text-cyber-red"> · заблокировано</span>}
      </>
    );
  } else if (e.type === 'abandon') {
    icon = <LogOut size={12} className="text-cyber-red" />;
    body = <><b style={{ color }}>{e.team}</b> покинула задачу <span className="text-cyber-text">#{e.taskId}</span></>;
  } else if (e.type === 'end') {
    icon = <Flag size={12} className="text-cyber-purple" />;
    body = <span className="text-cyber-purple tracking-widest">— матч завершён —</span>;
  } else {
    return null;
  }

  return (
    <div className="flex items-start gap-2 px-3 py-1.5 text-[11px]">
      <span className="text-cyber-muted tabular-nums w-10 flex-shrink-0">{fmtClock(e.t)}</span>
      <span className="flex-shrink-0 mt-0.5">{icon}</span>
      <span className="leading-snug">{body}</span>
    </div>
  );
}

// ── Детальный просмотр матча ─────────────────────────────
function MatchDetail({ match, onBack }) {
  return (
    <div className="space-y-3">
      <button onClick={onBack} className="text-[11px] text-cyber-muted hover:text-cyber-text flex items-center gap-1">
        <ChevronLeft size={13} /> к списку матчей
      </button>

      <div className="border border-cyber-border p-3 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-cyber-neon font-bold tracking-widest text-sm">КОМНАТА {match.code}</span>
          <span className={`text-[10px] ${match.endedAt ? 'text-cyber-muted' : 'text-cyber-yellow'}`}>
            {match.endedAt ? 'завершён' : 'прерван / идёт'}
          </span>
        </div>
        <div className="text-[11px] text-cyber-muted">👨‍🏫 {match.teacherName}</div>
        <div className="text-[11px] text-cyber-muted flex items-center gap-1">
          <Clock size={10} /> {fmtDate(match.startedAt)} → {fmtDate(match.endedAt)} · длительность {fmtDur(match.durationSec)}
        </div>
        {match.standings.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {match.standings.map((t, i) => (
              <span key={t.teamName} className="text-[11px] border px-2 py-0.5" style={{ borderColor: t.color, color: t.color }}>
                {i + 1}. {t.teamName} — {t.score}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="border border-cyber-border">
        <div className="text-[10px] text-cyber-muted tracking-widest px-3 py-1.5 border-b border-cyber-border">
          ТАЙМЛАЙН · {match.timeline.length} событий
        </div>
        <div className="max-h-[50vh] overflow-y-auto divide-y divide-cyber-border/40">
          {match.timeline.map((e, i) => <TimelineRow key={i} e={e} />)}
        </div>
      </div>
    </div>
  );
}

// ── Главный компонент ────────────────────────────────────
export default function MatchHistory() {
  const [matches, setMatches] = useState([]);
  const [detail, setDetail]   = useState(null);

  useEffect(() => {
    socket.emit('admin_get_matches');
    const onList   = ({ matches }) => setMatches(matches);
    const onDetail = ({ match })   => setDetail(match);
    socket.on('matches_list', onList);
    socket.on('match_detail', onDetail);
    return () => { socket.off('matches_list', onList); socket.off('match_detail', onDetail); };
  }, []);

  if (detail) return <MatchDetail match={detail} onBack={() => setDetail(null)} />;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-cyber-purple text-xs tracking-widest flex items-center gap-1"><History size={13} /> ИСТОРИЯ МАТЧЕЙ</div>
        <button onClick={() => socket.emit('admin_get_matches')} className="text-[10px] text-cyber-muted hover:text-cyber-text">обновить</button>
      </div>

      {matches.length === 0 && (
        <div className="text-center text-cyber-muted text-sm py-10 italic">Сыгранных матчей пока нет</div>
      )}

      {matches.map(m => (
        <button key={m.id} onClick={() => socket.emit('admin_get_match', { id: m.id })}
          className="w-full text-left border border-cyber-border bg-cyber-dark hover:border-cyber-purple p-3 transition">
          <div className="flex items-center justify-between">
            <span className="text-cyber-neon font-bold tracking-widest text-sm">{m.code}</span>
            <span className={`text-[10px] ${m.finished ? 'text-cyber-muted' : 'text-cyber-yellow'}`}>
              {m.finished ? 'завершён' : 'прерван / идёт'}
            </span>
          </div>
          <div className="text-[11px] text-cyber-muted mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
            <span>👨‍🏫 {m.teacherName}</span>
            <span>👥 {m.teamsCount} команд</span>
            <span>🏆 {m.winner || '—'}</span>
            <span className="flex items-center gap-1"><Clock size={9} /> {fmtDur(m.durationSec)}</span>
          </div>
          <div className="text-[10px] text-cyber-muted mt-0.5">{fmtDate(m.startedAt)} · {m.events} событий</div>
        </button>
      ))}
    </div>
  );
}
