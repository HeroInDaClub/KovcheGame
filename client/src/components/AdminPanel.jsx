import { useState, useEffect } from 'react';
import { socket } from '../socket.js';

export default function AdminPanel({ notification, onCreateRoom, onRoomCreated, roomId }) {
  const [adminName, setAdminName] = useState('');
  const [duration,  setDuration]  = useState(45);
  const [created,   setCreated]   = useState(false);

  useEffect(() => {
    const handler = ({ roomId: id }) => {
      setCreated(true);
      // Now join_room with actual ID
      socket.emit('join_room', { roomId: id, playerName: adminName });
    };
    socket.on('room_created', handler);
    return () => socket.off('room_created', handler);
  }, [adminName]);

  const handleCreate = () => {
    if (!adminName.trim()) return;
    onCreateRoom({ adminName: adminName.trim(), duration });
  };

  return (
    <div className="min-h-screen bg-cyber-dark cyber-grid flex flex-col items-center justify-center p-6 font-mono">
      {notification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-cyber-panel border border-cyber-neon text-cyber-neon px-6 py-3 rounded text-sm shadow-neon">
          {notification}
        </div>
      )}

      <div className="w-full max-w-md bg-cyber-panel border border-cyber-border p-8">
        <div className="text-cyber-purple text-lg font-bold tracking-widest mb-1">ПАНЕЛЬ УЧИТЕЛЯ</div>
        <div className="text-cyber-muted text-xs mb-6">Создайте игровую сессию для класса</div>

        <label className="text-cyber-muted text-xs block mb-1">ИМЯ УЧИТЕЛЯ</label>
        <input
          className="w-full bg-cyber-dark border border-cyber-border text-cyber-text px-4 py-3 mb-4 focus:outline-none focus:border-cyber-purple"
          value={adminName}
          onChange={e => setAdminName(e.target.value)}
          placeholder="Введите имя"
        />

        <label className="text-cyber-muted text-xs block mb-1">ДЛИТЕЛЬНОСТЬ ИГРЫ (МИНУТ)</label>
        <div className="flex gap-3 mb-6">
          {[20, 30, 45, 60].map(m => (
            <button
              key={m}
              onClick={() => setDuration(m)}
              className={`flex-1 py-2 border text-sm transition ${
                duration === m
                  ? 'border-cyber-purple bg-cyber-purple text-black font-bold'
                  : 'border-cyber-border text-cyber-muted hover:border-cyber-purple hover:text-cyber-purple'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <button
          onClick={handleCreate}
          disabled={!adminName.trim() || created}
          className="w-full py-3 bg-cyber-purple text-black font-bold tracking-widest uppercase hover:opacity-90 transition disabled:opacity-30"
        >
          {created ? '✓ КОМНАТА СОЗДАНА' : 'Создать комнату'}
        </button>

        {roomId && (
          <div className="mt-6 text-center">
            <div className="text-cyber-muted text-xs mb-2">КОД КОМНАТЫ ДЛЯ УЧЕНИКОВ:</div>
            <div className="text-4xl font-bold text-cyber-neon tracking-[0.5em] text-shadow-neon py-2">
              {roomId}
            </div>
            <div className="text-cyber-muted text-xs mt-2">Ожидание игроков в лобби…</div>
          </div>
        )}
      </div>
    </div>
  );
}
