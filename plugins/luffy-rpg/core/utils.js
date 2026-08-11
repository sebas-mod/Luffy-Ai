import path from "path";
import { fileURLToPath } from "url";

export const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const CORE_DIR = __dirname;
export const RPG_DIR = path.join(CORE_DIR, "..");
export const DATA_DIR = path.join(RPG_DIR, "database");

export function now() {
  return Date.now();
}

export function randomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

export function chance(percent) {
  return Math.random() * 100 < percent;
}

export function pick(arr) {
  if (!arr || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function formatNumber(n) {
  return new Intl.NumberFormat("es-ES").format(n);
}

export function formatBerry(n) {
  return `💰 ${formatNumber(n)} Berrys`;
}

export function formatTime(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${sec}s`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

export function normalizeJid(jid) {
  if (!jid) return "";
  return String(jid).replace(/@.+/g, "");
}

export function toJid(number) {
  return `${String(number).replace(/[^0-9]/g, "")}@s.whatsapp.net`;
}

export function getRemainingCooldown(cooldowns, key, seconds) {
  const last = cooldowns[key] || 0;
  const remaining = last + seconds * 1000 - now();
  return remaining > 0 ? remaining : 0;
}

export function setCooldown(cooldowns, key) {
  cooldowns[key] = now();
}

export function uid() {
  return `id_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export function requireArg(args, index) {
  return args[index]?.trim() || "";
}
