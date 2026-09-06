import crypto from 'crypto';

const UNIT = {
  h: { ms: 3600000, label: 'hora(s)' },
  d: { ms: 86400000, label: 'día(s)' },
  // 1 mes = 30 días (consistente con el sistema de alquiler existente)
  m: { ms: 2592000000, label: 'mes(es) (30 días)' },
};

const LIFETIME_UNITS = ['lifetime', 'permanente', 'infinito', 'lv', '∞'];
const LIFETIME = { value: Infinity, unit: 'lv', label: 'Permanente' };

// Alfabeto sin caracteres confusos (0/O, 1/I)
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateActivationCode(length = 6) {
  const bytes = crypto.randomBytes(length);
  let code = '';
  for (let i = 0; i < length; i++) {
    code += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return code;
}

// Acepta: "7 dias", "3 meses", "1d", "2m", "30", "lifetime"
export function parseActivationInput(text) {
  if (!text) return null;
  const t = String(text).trim().toLowerCase();
  if (LIFETIME_UNITS.includes(t)) return LIFETIME;

  const match = t.match(/^(\d+)\s*(h|horas?|d|d[ií]as?|m|meses?)?$/);
  if (!match) return null;

  const value = parseInt(match[1], 10);
  const raw = match[2] || 'd';
  let unit = 'd';
  if (['h', 'hora', 'horas'].includes(raw)) unit = 'h';
  else if (['m', 'mes', 'meses'].includes(raw)) unit = 'm';

  return { value, unit, label: `${value} ${UNIT[unit].label}` };
}

export function computeEndDate(startTs, dur) {
  if (!dur || dur.value === Infinity) return Infinity;
  return startTs + dur.value * UNIT[dur.unit].ms;
}

export function formatDurationLabel(dur) {
  if (!dur) return '-';
  if (dur.value === Infinity) return 'Permanente';
  return dur.label;
}

export function formatDateEs(ts) {
  if (ts === Infinity || !ts) return 'Permanente';
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'full',
    timeStyle: 'medium',
  }).format(new Date(ts));
}

export function getCodes(db) {
  return db.setting('botActivationCodes') || {};
}

export function saveCodes(db, codes) {
  db.setting('botActivationCodes', codes);
  return codes;
}

export function ensureSewa(db) {
  if (!db.db.data.sewa) db.db.data.sewa = { enabled: false, groups: {} };
  if (!db.db.data.sewa.groups) db.db.data.sewa.groups = {};
  return db.db.data.sewa;
}

export function formatCountdown(expiredAt) {
  if (!expiredAt || expiredAt === Infinity) return null;
  const diff = expiredAt - Date.now();
  if (diff <= 0) return { text: 'EXPIRADO', expired: true };
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  let text = '';
  if (days > 0) text += `${days} día(s) `;
  if (hours > 0) text += `${hours} hora(s) `;
  if (days === 0 && minutes > 0 && hours === 0) text += `${minutes} minuto(s)`;
  return { text: text.trim(), expired: false };
}