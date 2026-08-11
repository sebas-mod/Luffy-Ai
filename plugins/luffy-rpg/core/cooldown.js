import { updateUser, getUser } from "./user.js";
import { now } from "./utils.js";

export function getCooldown(jid, key) {
  const u = getUser(jid);
  const ts = u?.cooldowns?.[key] || 0;
  return ts;
}

export function getRemaining(jid, key, seconds) {
  const last = getCooldown(jid, key);
  const remaining = last + seconds * 1000 - now();
  return remaining > 0 ? remaining : 0;
}

export function isOnCooldown(jid, key, seconds) {
  return getRemaining(jid, key, seconds) > 0;
}

export function setCooldown(jid, key) {
  return updateUser(jid, (u) => {
    if (!u.cooldowns) u.cooldowns = {};
    u.cooldowns[key] = now();
    return u.cooldowns[key];
  });
}

export function clearCooldown(jid, key) {
  return updateUser(jid, (u) => {
    if (u.cooldowns) delete u.cooldowns[key];
    return u.cooldowns || {};
  });
}

export function checkAndSet(jid, key, seconds) {
  const remaining = getRemaining(jid, key, seconds);
  if (remaining > 0) return remaining;
  setCooldown(jid, key);
  return 0;
}

export function formatCooldown(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d} día(s) ${h % 24}h`;
  if (h > 0) return `${h}h ${m % 60}m`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}
