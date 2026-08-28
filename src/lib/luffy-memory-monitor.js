import { logger } from "./luffy-logger.js";
import { clearAllCaches } from "./luffy-performance.js";
const RSS_LIMIT = 1024 * 1024 * 1024;
const CHECK_INTERVAL = 5 * 60 * 1000;
const GC_COOLDOWN = 60 * 1000;

let monitorTimer = null;
let lastGc = 0;

function formatMB(bytes) {
  return (bytes / 1024 / 1024).toFixed(1) + "MB";
}

function startMemoryMonitor() {
  if (monitorTimer) return;

  monitorTimer = setInterval(() => {
    const mem = process.memoryUsage();

    if (mem.rss >= RSS_LIMIT) {
      logger.warn(
        "memory",
        `RSS ${formatMB(mem.rss)} excedió el límite de ${formatMB(RSS_LIMIT)}`,
      );

      clearAllCaches();

      const now = Date.now();
      if (global.gc && now - lastGc > GC_COOLDOWN) {
        lastGc = now;
        try {
          global.gc();
        } catch (e) {
          logger.warn("memory", `GC manual falló: ${e.message}`);
        }
      }

      logger.success(
        "memory",
        `Cachés limpiadas (rss ${formatMB(mem.rss)} · heap ${formatMB(mem.heapUsed)})`,
      );
      return;
    }

    logger.system(
      "memory",
      `rss ${formatMB(mem.rss)} · heap ${formatMB(mem.heapUsed)}/${formatMB(mem.heapTotal)}`,
    );
  }, CHECK_INTERVAL);

  if (monitorTimer.unref) monitorTimer.unref();
  logger.success(
    "memory",
    `Monitor de RAM activo, límite ${formatMB(RSS_LIMIT)}, revisión cada ${CHECK_INTERVAL / 60000} minutos`,
  );
}

function stopMemoryMonitor() {
  if (monitorTimer) {
    clearInterval(monitorTimer);
    monitorTimer = null;
  }
}

export { startMemoryMonitor, stopMemoryMonitor };
