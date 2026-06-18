// ============================================================
// codeRunner.worker.js — дочерний поток для full_code.
// Выполняет код игрока в vm-контексте ИЗОЛИРОВАННО от основного
// event loop. Родитель убивает поток по таймауту (worker.terminate),
// защищая сервер от DoS бесконечными циклами / тяжёлым кодом.
// ============================================================

const { parentPort, workerData } = require('worker_threads');
const vm = require('vm');

const { code, entry, tests } = workerData;

const harness = `
  ${code}
  ;(function () {
    if (typeof ${entry} !== 'function') return { defined: false };
    var __t = ${JSON.stringify(tests)};
    var passed = 0;
    for (var i = 0; i < __t.length; i++) {
      try {
        var out = ${entry}.apply(null, __t[i].args || []);
        if (JSON.stringify(out) === JSON.stringify(__t[i].expected)) passed++;
      } catch (e) { /* провал отдельного теста */ }
    }
    return { defined: true, passed: passed, total: __t.length };
  })()
`;

try {
  const context = vm.createContext(Object.create(null));
  // Вторичный синхронный предохранитель внутри потока.
  const res = vm.runInContext(harness, context, { timeout: 1000 });
  parentPort.postMessage({ ok: true, res });
} catch (e) {
  parentPort.postMessage({ ok: false, error: String((e && e.message) || e) });
}
