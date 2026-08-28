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
    ['-sSL', '--max-time', '30', '-H', 'User-Agent: Luffy-Ai', url],
    { maxBuffer: 64 * 1024 * 1024 },
  );
}

/**
 * Preload all assets into memory at startup.
 * @param {Object} configAssets - botConfig.assets or config.assets object
 */
export function preloadAssets(configAssets) {
  if (!configAssets) return;
  for (const [key, filepath] of Object.entries(configAssets)) {
    if (typeof filepath === 'string' && filepath.startsWith('http')) {
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
      if (typeof filepath === 'string' && !filepath.startsWith('http')) {
        const fullPath = path.resolve(process.cwd(), filepath);
        if (fs.existsSync(fullPath)) {
          assetCache[key] = fs.readFileSync(fullPath);
          logger.system("CACHE", `Loaded: ${key}`);
        } else {
          logger.warn("CACHE", `File not found: ${fullPath}`);
        }
      }
    } catch (e) {
      logger.error("CACHE", `Failed to load ${key}: ${e.message}`);
    }
  }
}

import config from '../../config.js';

/**
 * Get the cached asset buffer by key (e.g. 'luffy', 'luffy2').
 * If not in cache but available in config, loads it synchronously.
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
  if (assets && assets[key]) {
    const value = assets[key];
    if (typeof value === 'string' && value.startsWith('http')) {
      try {
        const buf = downloadUrlSync(value);
        assetCache[key] = buf;
        return buf;
      } catch (e) {
        console.error(`  ✖  ERR   Failed to fetch ${key} from URL:`, e.message);
        return null;
      }
    }
    try {
      const fullPath = path.resolve(process.cwd(), value);
      if (fs.existsSync(fullPath)) {
        const buf = fs.readFileSync(fullPath);
        assetCache[key] = buf; 
        return buf;
      }
    } catch (e) {
      console.error(`  ✖  ERR   Failed to read ${key} from disk:`, e.message);
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
