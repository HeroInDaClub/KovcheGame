import { io } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

export const socket = io(SERVER_URL, {
  autoConnect: false,
  // Бесконечные попытки переподключения: при прежнем лимите 5 сокет «умирал»
  // навсегда после короткого обрыва — учитель потом не мог начать игру
  // («комната не найдена»). Теперь сокет всегда восстанавливается.
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
});

export const connect = () => socket.connect();
export const disconnect = () => socket.disconnect();
