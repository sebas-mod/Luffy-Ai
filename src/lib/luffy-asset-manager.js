import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { logger } from './luffy-logger.js';

// Memory cache for all local assets
const assetCache = {};

// Descarga síncronamente una URL (fallback para el acceso en tiempo de import)
function downloadUrlSync(url) {
  return execFileSync(
    'curl',
    ['-f', '-sSL', '--max-time', '30', '-H', 'User-Agent: Luffy-Ai', url],
    { maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] },
  );
}

/**
 * Normaliza un valor de assets (string, [url, local] o {url, file}) a una
 * lista ordenada de fuentes: la URL (principal) primero y lo local después.
 * @param {*} value - El valor definido en config.assets
 * @returns {string[]}
 */
function getConfiguredSources(value) {
  const sources = [];
  if (Array.isArray(value)) {
    for (const v of value) {
      if (typeof v === 'string' && v.trim()) sources.push(v.trim());
    }
  } else if (typeof value === 'string' && value.trim()) {
    sources.push(value.trim());
  } else if (value && typeof value === 'object') {
    if (typeof value.url === 'string' && value.url.trim()) sources.push(value.url.trim());
    if (typeof value.file === 'string' && value.file.trim()) sources.push(value.file.trim());
  }
  return sources;
}

/**
 * Preload all assets into memory at startup.
 * @param {Object} configAssets - botConfig.assets or config.assets object
 */
export function preloadAssets(configAssets) {
  if (!configAssets) return;
  for (const [key, value] of Object.entries(configAssets)) {
    const sources = getConfiguredSources(value);
    for (const filepath of sources) {
      if (typeof filepath !== 'string') continue;
      if (filepath.startsWith('http')) {
        fetch(filepath)
          .then((r) => {
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return r.arrayBuffer();
          })
          .then((ab) => {
            assetCache[key] = Buffer.from(ab);
            logger.system("CACHE", `Downloaded: ${key}`);
          })
          .catch((e) => {
            logger.warn("CACHE", `Failed to fetch ${key}: ${e.message}`);
          });
        continue;
      }
      try {
        const fullPath = path.resolve(process.cwd(), filepath);
        if (fs.existsSync(fullPath)) {
          assetCache[key] = fs.readFileSync(fullPath);
          logger.system("CACHE", `Loaded: ${key}`);
        } else {
          logger.warn("CACHE", `File not found: ${fullPath}`);
        }
      } catch (e) {
        logger.error("CACHE", `Failed to load ${key}: ${e.message}`);
      }
    }
  }
}

import config from '../../config.js';

/**
 * Get the cached asset buffer by key (e.g. 'luffy', 'luffy2').
 * If not in cache but available in config, loads it synchronously.
 * 
 * Solo usa las fuentes definidas en config.assets (URL o ruta local).
 * Las imágenes deben apuntar a una URL directa; no se usan respaldos
 * automáticos de assets/.
 * 
 * @param {string} key - The asset key defined in config.assets
 * @param {Object} [configAssets] - Optional config.assets reference for fallback
 * @returns {Buffer | null} The asset as a Buffer, or null if missing.
 */
export function getAssetBuffer(key, configAssets = null) {
  if (assetCache[key]) {
    return assetCache[key];
  }
  
  const assets = configAssets || config?.assets;
  const value = assets && assets[key];
  const sources = getConfiguredSources(value);

  for (const source of sources) {
    try {
      let buf = null;
      if (typeof source === 'string' && source.startsWith('http')) {
        buf = downloadUrlSync(source);
      } else {
        const fullPath = path.resolve(process.cwd(), source);
        if (fs.existsSync(fullPath)) {
          buf = fs.readFileSync(fullPath);
        }
      }
      if (buf && buf.length > 0) {
        assetCache[key] = buf;
        return buf;
      }
    } catch (e) {
      console.error(`  ✖  ERR   Failed to load ${key} from ${source}:`, e.message);
    }
  }
  
  return null;
}

/**
 * Update an asset buffer in memory and save it to disk (useful for owner commands that change assets).
 * 
 * @param {string} key - Asset key
 * @param {Buffer} buffer - New asset buffer
 * @param {string} filepath - The path where it should be saved
 */
export function updateAssetAndSave(key, buffer, filepath) {
  assetCache[key] = buffer;
  if (filepath && !filepath.startsWith('http')) {
    try {
      const fullPath = path.resolve(process.cwd(), filepath);
      fs.writeFileSync(fullPath, buffer);
    } catch (e) {
      console.error(`  ✖  ERR   Failed to write updated asset ${key} to disk:`, e.message);
    }
  }
}
