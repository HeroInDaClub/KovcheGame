#!/usr/bin/env bash
# Запуск Aegis-X: Cyber-Siege (dev режим)
set -e

echo "=== Установка зависимостей сервера ==="
cd server && npm install
cd ..

echo "=== Установка зависимостей клиента ==="
cd client && npm install
cd ..

echo "=== Запуск сервера (порт 3001) ==="
(cd server && npm run dev &)

echo "=== Запуск клиента Vite (порт 5173) ==="
(cd client && npm run dev &)

echo ""
echo "Сервер: http://localhost:3001"
echo "Клиент: http://localhost:5173"
echo ""
echo "Откройте http://localhost:5173 в браузере."
wait
