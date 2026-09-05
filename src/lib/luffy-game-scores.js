import { createHmac } from "crypto";
import config from "../../config.js";

const SEED = [
  "luffy-j2-scores",
  config.bot?.name,
  config.bot?.version,
  config.owner?.name,
].join("::");

const TOKEN_TTL_MS = 90 * 60 * 1000;
const MAX_SCORE = 5_000_000;

function normalizeGameName(game) {
  return String(game || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .slice(0, 40);
}

function getGameScoreSeed() {
  return SEED;
}

function signScorePayload(game, score, nonce, timestamp) {
  const payload = `${game}:${score}:${nonce}:${timestamp}`;
  return createHmac("sha256", SEED).update(payload).digest("hex").slice(0, 32);
}

function createScoreToken(game, score) {
  const cleanGame = normalizeGameName(game);
  const nonce = Math.random().toString(36).slice(2, 10);
  const timestamp = Date.now();
  const sig = signScorePayload(cleanGame, score, nonce, timestamp);
  const payload = Buffer.from(
    `${cleanGame}:${score}:${nonce}:${timestamp}`,
    "utf8",
  ).toString("base64url");
  return `${payload}.${sig}`;
}

function verifyScoreToken(token, expectedGame = null) {
  if (typeof token !== "string" || !token.includes(".")) {
    return { ok: false, error: "Token inválido." };
  }
  const idx = token.lastIndexOf(".");
  const payloadB64 = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  if (!payloadB64 || !sig) return { ok: false, error: "Token inválido." };

  let raw;
  try {
    raw = Buffer.from(payloadB64, "base64url").toString("utf8");
  } catch {
    return { ok: false, error: "Token inválido." };
  }

  const parts = raw.split(":");
  if (parts.length !== 4) return { ok: false, error: "Token inválido." };
  const [game, scoreRaw, nonce, tsRaw] = parts;
  const score = Number(scoreRaw);
  const timestamp = Number(tsRaw);
  if (!game || !Number.isFinite(score) || !nonce || !Number.isFinite(timestamp)) {
    return { ok: false, error: "Token inválido." };
  }

  if (expectedGame && normalizeGameName(game) !== normalizeGameName(expectedGame)) {
    return { ok: false, error: `El token pertenece al juego *${game}*, no a *${expectedGame}*.` };
  }
  if (!Number.isFinite(score) || score < 0 || score > MAX_SCORE) {
    return { ok: false, error: `Puntaje fuera del rango permitido (0-${MAX_SCORE}).` };
  }

  const now = Date.now();
  if (timestamp > now + 5 * 60 * 1000) {
    return { ok: false, error: "Token con fecha futura." };
  }
  if (now - timestamp > TOKEN_TTL_MS) {
    return { ok: false, error: "El token expiró. Vuelve a jugar para generar uno nuevo." };
  }

  const expected = signScorePayload(game, score, nonce, timestamp);
  if (expected !== sig) {
    return { ok: false, error: "La firma del puntaje no es válida." };
  }

  return { ok: true, game, score, timestamp };
}

function saveScore(db, jid, game, score) {
  const cleanGame = normalizeGameName(game);
  if (!cleanGame) return { ok: false, error: "Juego inválido." };
  const parsedScore = Number(score);
  if (!Number.isFinite(parsedScore) || parsedScore < 1 || parsedScore > MAX_SCORE) {
    return { ok: false, error: "Puntaje no válido." };
  }

  const user = db.getUser(jid);
  if (!user) return { ok: false, error: "No encontré tu registro." };

  const current = user.gameScores || {};
  const prev = current[cleanGame] ? { ...current[cleanGame] } : null;
  if (prev && parsedScore <= prev.best) {
    return { ok: true, saved: false, prevBest: prev.best };
  }

  current[cleanGame] = { best: parsedScore, date: Date.now() };
  db.setUser(jid, { gameScores: current });
  db.markDirty?.("users");

  return { ok: true, saved: true, prevBest: prev ? prev.best : 0, newBest: parsedScore };
}

function getGameRanking(db, game, limit = 10) {
  const cleanGame = normalizeGameName(game);
  const users = db.getAllUsers?.() || {};
  const list = [];
  for (const jid of Object.keys(users)) {
    const u = users[jid];
    const entry = u?.gameScores?.[cleanGame];
    if (entry && Number.isFinite(entry.best) && entry.best >= 1) {
      list.push({
        jid,
        name: u?.j2Name || u?.regName || u?.name || jid,
        best: entry.best,
        date: entry.date || 0,
      });
    }
  }
  list.sort((a, b) => (b.best - a.best) || ((a.date || 0) - (b.date || 0)));
  return list.slice(0, Math.max(1, Math.min(50, Number(limit) || 10)));
}

function listRankedGames(db) {
  const users = db.getAllUsers?.() || {};
  const games = new Map();
  for (const jid of Object.keys(users)) {
    const scores = users[jid]?.gameScores;
    if (!scores) continue;
    for (const game of Object.keys(scores)) {
      const entry = scores[game];
      if (!entry || !Number.isFinite(entry.best)) continue;
      if (!games.has(game)) games.set(game, { best: 0, holder: "", date: 0 });
      if (entry.best > games.get(game).best) {
        games.set(game, {
          best: entry.best,
          holder: users[jid]?.j2Name || users[jid]?.regName || users[jid]?.name || jid,
          date: entry.date || 0,
        });
      }
    }
  }
  return [...games.entries()].sort((a, b) => b[1].best - a[1].best);
}

export {
  getGameScoreSeed,
  createScoreToken,
  verifyScoreToken,
  saveScore,
  getGameRanking,
  listRankedGames,
  normalizeGameName,
  MAX_SCORE,
};