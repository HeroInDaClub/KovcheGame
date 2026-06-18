// ============================================================
// Aegis-X: Cyber-Siege — Main Server Entry Point
// Port: 3001  |  CORS: localhost:5173 (Vite dev) + production
// ============================================================

const express   = require('express');
const http      = require('http');
const { Server } = require('socket.io');
const cors      = require('cors');
const path      = require('path');

const { registerHandlers } = require('./socketHandlers');
const { startRoomReaper }  = require('./gameState');

const PORT = process.env.PORT || 3001;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

const app    = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [CLIENT_ORIGIN, 'http://localhost:4173'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout:  30000,
  pingInterval: 10000,
});

app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json());

// Serve built React client in production
app.use(express.static(path.join(__dirname, '../client/dist')));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString() });
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

io.on('connection', (socket) => {
  console.log(`[+] Подключение: ${socket.id}`);
  registerHandlers(io, socket);
});

server.listen(PORT, () => {
  console.log(`\n╔══════════════════════════════════════╗`);
  console.log(`║   Aegis-X: Cyber-Siege — СЕРВЕР     ║`);
  console.log(`║   Порт: ${PORT}                         ║`);
  console.log(`╚══════════════════════════════════════╝\n`);
  startRoomReaper(io);   // фоновая очистка мёртвых комнат
  console.log('[REAPER] Room Reaper запущен');
});

process.on('unhandledRejection', (err) => console.error('[ОШИБКА]', err));
