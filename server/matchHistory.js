// ============================================================
// matchHistory.js — подробная история сыгранных матчей (в памяти).
// Сброс при перезапуске процесса (допустимо по ТЗ).
// Таймлайн: посекундный лог ключевых событий комнаты для учителя.
// ============================================================

const matches = new Map();   // matchId -> record
let seq = 0;

// Старт матча: снимок состава команд (кто в какой команде / кто капитан).
function startMatch(room) {
  const id = `M${++seq}`;
  const startedAt = Date.now();
  const timeline = [];
  for (const team of Object.values(room.teams)) {
    for (const m of team.members) {
      timeline.push({
        t: 0, type: 'join',
        team: team.teamName, color: team.color,
        player: m.name, captain: !!m.isCaptain,
      });
    }
  }
  const rec = {
    id,
    code:        room.roomId,
    teacherName: room.adminName,
    startedAt,
    endedAt:     null,
    durationSec: null,
    standings:   [],
    timeline,
  };
  matches.set(id, rec);
  room.matchId = id;
  return rec;
}

// Записать событие в таймлайн (t — мс от старта матча).
function log(room, event) {
  const rec = room && room.matchId ? matches.get(room.matchId) : null;
  if (!rec || rec.endedAt) return;
  rec.timeline.push({ t: Date.now() - rec.startedAt, ...event });
}

// Завершение матча: длительность + итоговые места.
function finishMatch(room, standings) {
  const rec = room && room.matchId ? matches.get(room.matchId) : null;
  if (!rec || rec.endedAt) return;
  rec.endedAt = Date.now();
  rec.durationSec = Math.round((rec.endedAt - rec.startedAt) / 1000);
  rec.standings = Array.isArray(standings) ? standings : [];
  rec.timeline.push({ t: rec.endedAt - rec.startedAt, type: 'end' });
}

// Краткие сводки для списка (без полного таймлайна).
function summaries() {
  return [...matches.values()]
    .sort((a, b) => b.startedAt - a.startedAt)
    .map(r => ({
      id:          r.id,
      code:        r.code,
      teacherName: r.teacherName,
      startedAt:   r.startedAt,
      endedAt:     r.endedAt,
      durationSec: r.durationSec,
      teamsCount:  new Set(r.timeline.filter(e => e.type === 'join').map(e => e.team)).size,
      winner:      r.standings[0]?.teamName || null,
      events:      r.timeline.length,
      finished:    !!r.endedAt,
    }));
}

function getMatch(id) {
  return matches.get(id) || null;
}

module.exports = { startMatch, log, finishMatch, summaries, getMatch };
