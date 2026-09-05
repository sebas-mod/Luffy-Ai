import {
  verifyScoreToken,
  saveScore,
  getGameRanking,
  listRankedGames,
} from "../../src/lib/luffy-game-scores.js";

const pluginConfig = {
  name: "rl",
  alias: [],
  category: "main",
  description: "Ranking de juegos (ver top 10 por juego y reportar puntaje firmado).",
  usage: ".rl | .rl <juego> | .rl <juego> <token>",
  example: ".rl dash",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  carne: 0,
  isEnabled: true,
};

const GAME_LABELS = {
  dash: "⚡ Geometry Dash",
  geometrydash: "⚡ Geometry Dash",
  snake: "🐍 Snake",
  dino: "🦖 Dino",
  flappy: "🐤 Flappy Bird",
  "2048": "🔢 2048",
  brickbreaker: "🧱 Brick Breaker",
  buscaminas: "💣 Buscaminas",
  sudoku: "🔢 Sudoku",
  tateti: "⭕ Ta-Ta-Ti",
  conecta4: "🟡 Conecta 4",
  damero: "⬛ Damero",
  ahorcado: "🪢 Ahorcado",
  trivia: "❓ Trivia",
  crucigrama: "📝 Crucigrama",
  memorama: "🃏 Memorama",
  puzzle15: "🧩 Puzzle 15",
  bingo: "🎯 Bingo",
  rasga: "🔮 Rasga",
  dadosuerte: "🎲 Dado Suerte",
  moneda: "🪙 Moneda",
  ruleta: "🎡 Ruleta",
  slot: "🎰 Slot",
  blackjack: "🃏 Blackjack",
  dados: "🎲 Dados",
  pinball: "🕹️ Pinball",
  ajedrez: "♟️ Ajedrez",
  billar: "🎱 Billar",
  bomberman: "💣 Bomberman",
  hundirlaflota: "🚢 Hundir la Flota",
  reaccion: "⚡ Reacción",
  adivinabandera: "🚩 Adivina la Bandera",
  verdadorreto: "🎭 Verdad o Reto",
  pokerdados: "🎲 Póker de Dados",
  pixeldraw: "🎨 Pixel Draw",
  diloseñas: "🤟 Di las Señas",
  puntosycajas: "📦 Puntos y Cajas",
  agarmini: "🗺️ Agar Mini",
  laberinto: "🌀 Laberinto",
  mahjong: "🀄 Mahjong",
  simon: "🔴 Simón Dice",
  secuencia: "🔢 Secuencia",
  piano: "🎹 Piano",
  pupiletras: "🔍 Pupiletras",
};

function gameLabel(game) {
  return GAME_LABELS[game] || `🎮 ${game}`;
}

function formatTop(game, ranking) {
  if (!ranking.length) {
    return (
      `☽◯☾ ╭ ♰ ${gameLabel(game)} ♰ ━╮ ☽◯☾\n\n` +
      `> Aún no hay puntajes registrados para *${game}*.\n` +
      `> Juega y al superar tu record envía el puntaje con \`.rl ${game} <token>\`.`
    );
  }

  const lines = ranking.map((r, i) => {
    const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}º`;
    const date = new Date(r.date || 0).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
    });
    return `${medal} *${r.name}* — \`${r.best}\` (${date})`;
  });

  return (
    `☽◯☾ ╭ ♰ ${gameLabel(game)} ♰ ━╮ ☽◯☾\n\n` +
    `${lines.join("\n")}\n\n` +
    `╰━ ⊱${ranking.length}/10 jugadores⊰ ━╯`
  );
}

async function handler(m, { sock, db }) {
  await m.react("🏆").catch(() => { });

  const args = String(m.args?.[0] || "").trim();
  const token = String(m.args?.[1] || "").trim();

  const isTokenArg = args.includes(".");

  if (isTokenArg && !token) {
    const verdict = verifyScoreToken(args);
    if (!verdict.ok) {
      await m.react("❌").catch(() => { });
      return m.reply(`⛔ *Token inválido*\n\n${verdict.error}`);
    }
    const result = saveScore(db, m.sender, verdict.game, verdict.score);
    if (!result.ok) {
      await m.react("❌").catch(() => { });
      return m.reply(`⛔ *No se guardó el puntaje*\n\n${result.error}`);
    }
    const ranking = getGameRanking(db, verdict.game, 1);
    const myPos = ranking.length ? `Top actual: ${ranking[0].name} con \`${ranking[0].best}\`` : "";
    await m.react("✅").catch(() => { });
    return m.reply(
      result.saved
        ? `🏆 *¡PUNTAJE REGISTRADO!*\n\n> Juego: *${gameLabel(verdict.game)}*\n> Puntaje: *${verdict.score}*\n${myPos ? "\n" + myPos : ""}`
        : `ℹ️ *Tu record ya es mejor o igual.*\n\n> Juego: *${gameLabel(verdict.game)}*\n> Record actual: *${result.prevBest}*`,
    );
  }

  if (token) {
    const game = String(m.args?.[0] || "").trim().toLowerCase().replace(/\s+/g, "");
    if (!game) return m.reply(`Usa: \`.rl <juego> <token>\`.`);
    const verdict = verifyScoreToken(token, game);
    if (!verdict.ok) {
      await m.react("❌").catch(() => { });
      return m.reply(`⛔ *Token inválido*\n\n${verdict.error}`);
    }
    const result = saveScore(db, m.sender, game, verdict.score);
    if (!result.ok) {
      await m.react("❌").catch(() => { });
      return m.reply(`⛔ *No se guardó el puntaje*\n\n${result.error}`);
    }
    await m.react("✅").catch(() => { });
    return m.reply(
      result.saved
        ? `🏆 *¡PUNTAJE REGISTRADO!*\n\n> Juego: *${gameLabel(game)}*\n> Puntaje: *${verdict.score}*\n\nPara ver el top: \`.rl ${game}\``
        : `ℹ️ *Tu record ya es mejor o igual.*\n\n> Juego: *${gameLabel(game)}*\n> Record actual: *${result.prevBest}*`,
    );
  }

  if (!args) {
    const games = listRankedGames(db);
    if (!games.length) {
      return m.reply(
        `☽◯☾ ╭ ♰ 🏆 RANKING DE JUEGOS ♰ ━╮ ☽◯☾\n\n` +
          `> Aún no hay puntajes registrados.\n\n` +
          `> Juega cualquiera de los juegos y al superar tu record usa:\n` +
          `> \`.rl <juego> <token>\`\n\n` +
          `> O consulta un top: \`.rl <juego>\`\n` +
          `╰━ ⊱༺༒༻⊰ ━╯`,
      );
    }
    const lines = games.map(([game, info]) => {
      return `> *${gameLabel(game)}* — \`${info.best}\` · ${info.holder}`;
    });
    return m.reply(
      `☽◯☾ ╭ ♰ 🏆 RANKING DE JUEGOS ♰ ━╮ ☽◯☾\n\n` +
        lines.join("\n") +
        `\n\n> Consulta un top con \`.rl <juego>\`\n` +
        `╰━ ⊱༺༒༻⊰ ━╯`,
    );
  }

  const game = args.toLowerCase().replace(/\s+/g, "");
  const ranking = getGameRanking(db, game);
  return m.reply(formatTop(game, ranking));
}

export { pluginConfig as config, handler };