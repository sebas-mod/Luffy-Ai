import { getDatabase } from "../../src/lib/ourin-database.js";
import {
  drawBoard,
  getRandomMap,
  DICE_STICKERS,
} from "../../src/lib/ourin-game-ulartangga.js";
import config from "../../config.js";
import fs from "fs";
import path from "path";
import te from "../../src/lib/ourin-error.js";
const pluginConfig = {
  name: "ulartangga",
  alias: ["ut", "snakeladder", "sl"],
  category: "game",
  description: "Juega serpientes y escaleras con otros jugadores con tablero visual",
  usage: ".ulartangga <create|join|start|info|exit|delete>",
  example: ".ulartangga create",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

if (!global.ulartanggaGames) global.ulartanggaGames = {};

const PLAYER_COLORS = ["🔴", "🟡", "🟢", "🔵"];
const PLAYER_NAMES = ["Rojo", "Amarillo", "Verde", "Azul"];

const WIN_REWARD = { koin: 2000, exp: 1000, energi: 5 };

function uniqueMentions(mentions = []) {
  return [...new Set((mentions || []).filter(Boolean))];
}

let thumbUT = null;
try {
  const thumbPath = path.join(
    process.cwd(),
    "assets",
    "image",
    "ourin-games.jpg",
  );
  if (fs.existsSync(thumbPath)) {
    thumbUT = fs.readFileSync(thumbPath);
  }
} catch (e) { }

function utCtx(mentions) {
  const saluranId = config.saluran?.id || "120363400911374213@newsletter";
  const saluranName = config.saluran?.name || config.bot?.name || "Luffy-AI";
  const normalizedMentions = uniqueMentions(mentions);
  return {
    forwardingScore: 9999,
    isForwarded: true,
    mentionedJid: normalizedMentions.length ? normalizedMentions : undefined,
    forwardedNewsletterMessageInfo: {
      newsletterJid: saluranId,
      newsletterName: saluranName,
      serverMessageId: 127,
    },
  };
}

async function sendUT(sock, jid, text, title, body, mentions, options) {
  const msgId = await sock.sendPreview(
    jid,
    {
      caption: `${config.info.website} ${text}`,
      url: `${config.info.website}`,
      title: title || "🐍🎲 ULAR TANGGA",
      description: body || "¡Juego clasico!",
      jpegThumbnail: thumbUT,
      previewType: 0,
    },
    { contextInfo: utCtx(mentions), ...options },
  );
  return { key: { id: msgId, remoteJid: jid, fromMe: true } };
}

async function handler(m, { sock }) {
  const db = getDatabase();
  const args = m.args || [];
  const action = args[0]?.toLowerCase();
  const ut = global.ulartanggaGames;
  const prefix = m.prefix || config.command?.prefix || ".";

  const commands = {
    create: async () => {
      if (ut[m.chat]) {
        return sendUT(
          sock,
          m.chat,
          `❌ *LA SALA YA EXISTE*\n\n` +
          `> Todavia hay una sesion de juego en este chat!\n` +
          `> Host: @${ut[m.chat].host.split("@")[0]}\n` +
          `> Estado: ${ut[m.chat].status}`,
          "🐍🎲 ULAR TANGGA",
          "¡Juego clasico!",
          [ut[m.chat].host],
          { quoted: m },
        );
      }

      const mapConfig = getRandomMap();

      ut[m.chat] = {
        date: Date.now(),
        status: "WAITING",
        host: m.sender,
        players: {},
        turn: 0,
        map: mapConfig.map,
        mapName: mapConfig.name,
        snakesLadders: mapConfig.snakesLadders,
        stabil_x: mapConfig.stabil_x,
        stabil_y: mapConfig.stabil_y,
      };
      ut[m.chat].players[m.sender] = { rank: "HOST", position: 1 };

      await m.react("🎲");
      await sendUT(
        sock,
        m.chat,
        `🐍🎲 *ULAR TANGGA*\n\n` +
        `¡Sala creada con exito!\n\n` +
        `╭┈┈⬡「 📋 *INFO DE LA SALA* 」\n` +
        `┃ 👑 Host: @${m.sender.split("@")[0]}\n` +
        `┃ 👥 Jugadores: 1/4\n` +
        `┃ 🗺️ Mapa: ${mapConfig.name}\n` +
        `╰┈┈┈┈┈┈┈┈⬡\n\n` +
        `╭┈┈⬡「 🎮 *COMANDOS* 」\n` +
        `┃ ➕ \`${prefix}ut join\` - Unirse\n` +
        `┃ ▶️ \`${prefix}ut start\` - Iniciar\n` +
        `┃ ℹ️ \`${prefix}ut info\` - Info de sala\n` +
        `┃ 🚪 \`${prefix}ut exit\` - Salir\n` +
        `╰┈┈┈┈┈┈┈┈⬡`,
        "🎲 SALA CREADA",
        "¡Unete!",
        [m.sender],
        { quoted: m },
      );
    },

    join: async () => {
      if (!ut[m.chat]) {
        return m.reply(
          `❌ ¡No hay sesion de juego!\n> Escribe \`${prefix}ut create\` para crear una sala.`,
        );
      }

      if (ut[m.chat].players[m.sender]) {
        return m.reply(`❌ ¡Ya te uniste a esta sala!`);
      }

      const playerCount = Object.keys(ut[m.chat].players).length;
      if (playerCount >= 4) {
        return m.reply(`❌ ¡Sala llena! (Max 4 jugadores)`);
      }

      if (ut[m.chat].status === "PLAYING") {
        return m.reply(`❌ ¡El juego esta en curso, no puedes unirte!`);
      }

      ut[m.chat].players[m.sender] = { rank: "MEMBER", position: 1 };

      const players = Object.keys(ut[m.chat].players);
      const playerList = players
        .map(
          (p, i) =>
            `${PLAYER_COLORS[i]} ${PLAYER_NAMES[i]}: @${p.split("@")[0]}`,
        )
        .join("\n");

      await m.react("✅");
      await sendUT(
        sock,
        m.chat,
        `✅ *JUGADOR SE UNIO*\n\n` +
        `@${m.sender.split("@")[0]} entro!\n\n` +
        `╭┈┈⬡「 👥 *PLAYERS* 」\n` +
        `${playerList
          .split("\n")
          .map((l) => `┃ ${l}`)
          .join("\n")}\n` +
        `╰┈┈┈┈┈┈┈┈⬡\n\n` +
        `> Total: ${players.length}/4\n` +
        `> ${players.length >= 2 ? `✅ ¡Se puede empezar! \`${prefix}ut start\`` : "🕕 Falta 1 jugador mas"}`,
        "👥 JUGADOR UNIDO",
        `${players.length}/4 jugadores`,
        players,
        { quoted: m },
      );
    },

    start: async () => {
      if (!ut[m.chat]) {
        return m.reply(`❌ ¡No hay sesion de juego!`);
      }

      if (ut[m.chat].status === "PLAYING") {
        return m.reply(`❌ ¡El juego ya esta en curso!`);
      }

      if (ut[m.chat].host !== m.sender && !config.isOwner?.(m.sender)) {
        return m.reply(`❌ ¡Solo el host puede iniciar el juego!`);
      }

      const players = Object.keys(ut[m.chat].players);
      if (players.length < 2) {
        return m.reply(`❌ ¡Minimo 2 jugadores para jugar!`);
      }

      ut[m.chat].status = "PLAYING";
      ut[m.chat].turn = 0;

      const playerList = players
        .map(
          (p, i) =>
            `${PLAYER_COLORS[i]} ${PLAYER_NAMES[i]}: @${p.split("@")[0]}`,
        )
        .join("\n");

      // Draw initial board with all players at position 1
      const positions = players.map((p) => ut[m.chat].players[p].position);
      const boardImage = await drawBoard(
        ut[m.chat].map,
        positions[0] || null,
        positions[1] || null,
        positions[2] || null,
        positions[3] || null,
        ut[m.chat].stabil_x,
        ut[m.chat].stabil_y,
      );

      await m.react("🎮");

      if (boardImage) {
        await sock.sendMessage(
          m.chat,
          {
            image: boardImage,
            caption:
              `🐍🎲 *¡JUEGO INICIADO!*\n\n` +
              `╭┈┈⬡「 👥 *PLAYERS* 」\n` +
              `${playerList
                .split("\n")
                .map((l) => `┃ ${l}`)
                .join("\n")}\n` +
              `╰┈┈┈┈┈┈┈┈⬡\n\n` +
              `> 🎯 Turno: @${players[0].split("@")[0]}\n` +
              `> Escribe *tirar* para lanzar el dado!`,
            contextInfo: utCtx(players),
          },
          { quoted: m },
        );
      } else {
        await sendUT(
          sock,
          m.chat,
          `🐍🎲 *¡JUEGO INICIADO!*\n\n` +
          `╭┈┈⬡「 👥 *JUGADORES* 」\n` +
          `${playerList
            .split("\n")
            .map((l) => `┃ ${l}`)
            .join("\n")}\n` +
          `╰┈┈┈┈┈┈┈┈⬡\n\n` +
          `> 🎯 Turno: @${players[0].split("@")[0]}\n` +
          `> Escribe *tirar* para lanzar el dado!`,
          "🎮 JUEGO INICIADO",
          "¡Lanza el dado!",
          players,
          { quoted: m },
        );
      }
    },

    info: async () => {
      if (!ut[m.chat]) {
        return m.reply(`❌ ¡No hay sesion de juego!`);
      }

      const players = Object.keys(ut[m.chat].players);
      const playerList = players
        .map((p, i) => {
          const pos = ut[m.chat].players[p].position;
          return `${PLAYER_COLORS[i]} ${PLAYER_NAMES[i]}: @${p.split("@")[0]} - Pos: ${pos}`;
        })
        .join("\n");

      const currentTurn =
        ut[m.chat].status === "PLAYING"
          ? players[ut[m.chat].turn % players.length]
          : null;

      await sock.sendMessage(
        m.chat,
        {
          text:
            `🐍🎲 *INFO ROOM*\n\n` +
            `╭┈┈⬡「 📋 *ROOM* 」\n` +
            `┃ 👑 Host: @${ut[m.chat].host.split("@")[0]}\n` +
            `┃ 📍 Status: ${ut[m.chat].status}\n` +
            `┃ 🗺️ Map: ${ut[m.chat].mapName}\n` +
            `┃ 👥 Jugadores: ${players.length}/4\n` +
            `╰┈┈┈┈┈┈┈┈⬡\n\n` +
            `╭┈┈⬡「 👥 *PLAYERS* 」\n` +
            `${playerList
              .split("\n")
              .map((l) => `┃ ${l}`)
              .join("\n")}\n` +
            `╰┈┈┈┈┈┈┈┈⬡` +
            (currentTurn
              ? `\n\n> 🎯 Turno: @${currentTurn.split("@")[0]}`
              : ""),
          contextInfo: utCtx(players),
        },
        { quoted: m },
      );
    },

    exit: async () => {
      if (!ut[m.chat]) {
        return m.reply(`❌ No hay sesion de juego!`);
      }

      if (!ut[m.chat].players[m.sender]) {
        return m.reply(`❌ No estas en esta sala!`);
      }

      delete ut[m.chat].players[m.sender];
      await sendUT(
        sock,
        m.chat,
        `👋 @${m.sender.split("@")[0]} salio del juego.`,
        "🐍🎲 ULAR TANGGA",
        "¡Juego clasico!",
        [m.sender],
        { quoted: m },
      );

      if (Object.keys(ut[m.chat].players).length === 0) {
        delete ut[m.chat];
        return m.reply(`🗑️ Sala eliminada por no tener jugadores.`);
      }

      if (!ut[m.chat].players[ut[m.chat].host]) {
        const newHost = Object.keys(ut[m.chat].players)[0];
        ut[m.chat].host = newHost;
        ut[m.chat].players[newHost].rank = "HOST";
        await sendUT(
          sock,
          m.chat,
          `👑 Host transferido a @${newHost.split("@")[0]}`,
          "🐍🎲 ULAR TANGGA",
          "¡Juego clasico!",
          [newHost],
          { quoted: m },
        );
      }

      // Fix turn if playing
      if (ut[m.chat].status === "PLAYING") {
        const players = Object.keys(ut[m.chat].players);
        ut[m.chat].turn = ut[m.chat].turn % players.length;
        await sendUT(
          sock,
          m.chat,
          `> Turno: @${players[ut[m.chat].turn].split("@")[0]}\n> Escribe *tirar*`,
          "🐍🎲 ULAR TANGGA",
          "¡Juego clasico!",
          [players[ut[m.chat].turn]],
        );
      }
    },

    delete: async () => {
      if (!ut[m.chat]) {
        return m.reply(`❌ No hay sesion de juego!`);
      }

      if (ut[m.chat].host !== m.sender && !config.isOwner?.(m.sender)) {
        return m.reply(`❌ Solo el host puede eliminar la sala!`);
      }

      delete ut[m.chat];
      await m.react("🗑️");
      await m.reply(`🗑️ Sala eliminada con exito!`);
    },
  };

  if (!action || !commands[action]) {
    return sendUT(
      sock,
      m.chat,
      `🐍🎲 *ULAR TANGGA*\n\n` +
      `¡Juego clasico lleno de aventuras!\n` +
      `Sube escaleras, evita serpientes, hasta llegar a 100!\n\n` +
      `╭┈┈⬡「 🎮 *COMANDOS* 」\n` +
      `┃ 🎲 \`${prefix}ut create\` - Crear sala\n` +
      `┃ ➕ \`${prefix}ut join\` - Unirse a sala\n` +
      `┃ ▶️ \`${prefix}ut start\` - Iniciar juego\n` +
      `┃ ℹ️ \`${prefix}ut info\` - Info de sala\n` +
      `┃ 🚪 \`${prefix}ut exit\` - Salir\n` +
      `┃ 🗑️ \`${prefix}ut delete\` - Eliminar sala\n` +
      `╰┈┈┈┈┈┈┈┈⬡\n\n` +
      `╭┈┈⬡「 🏆 *PREMIO* 」\n` +
      `┃ 💰 +${WIN_REWARD.koin.toLocaleString()} Monedas\n` +
      `┃ ⭐ +${WIN_REWARD.exp.toLocaleString()} EXP\n` +
      `┃ ⚡ +${WIN_REWARD.energi} Energia\n` +
      `╰┈┈┈┈┈┈┈┈⬡\n\n` +
      `> Min 2 jugadores, Max 4 jugadores`,
      "🐍🎲 ULAR TANGGA",
      "A Jugar!",
      [],
      { quoted: m },
    );
  }

  try {
    await commands[action]();
  } catch (error) {
    console.error("[ULARTANGGA ERROR]", error);
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

// ==================== Answer Handler (for "kocok") ====================
async function answerHandler(m, sock) {
  if (!m.body) return false;

  const text = m.body.trim().toLowerCase();
  if (text !== "tirar" && text !== "kocok" && text !== "roll" && text !== "dado") return false;

  const ut = global.ulartanggaGames;
  if (!ut[m.chat]) return false;
  if (ut[m.chat].status !== "PLAYING") return false;

  const players = Object.keys(ut[m.chat].players);
  if (!players.includes(m.sender)) return false;

  const currentTurn = ut[m.chat].turn % players.length;
  if (players.indexOf(m.sender) !== currentTurn) {
    await m.reply(
      `❌ ¡No es tu turno!\n> Turno: @${players[currentTurn].split("@")[0]}`,
      {
        mentions: [players[currentTurn]],
      },
    );
    return true;
  }

  const db = getDatabase();

  // Roll dice
  const dadu = Math.floor(Math.random() * 6) + 1;
  const DICE_EMOJI = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

  // Send dice sticker
  try {
    const diceUrl = DICE_STICKERS[dadu - 1];
    await sock.sendMessage(
      m.chat,
      {
        sticker: { url: diceUrl },
        contextInfo: utCtx(),
      },
      { quoted: m },
    );
  } catch (e) {
    // Fallback: just react with dice emoji
    await m.react(DICE_EMOJI[dadu - 1]);
  }

  const oldPos = ut[m.chat].players[m.sender].position;
  let newPos = oldPos + dadu;

  // Bounce back if over 100
  if (newPos > 100) {
    newPos = 100 - (newPos - 100);
  }

  // Check snake/ladder
  let event = "";
  const snakesLadders = ut[m.chat].snakesLadders;
  if (snakesLadders[newPos]) {
    const destination = snakesLadders[newPos];
    if (destination > newPos) {
      event = `\n🪜 *¡Subiste una escalera!*`;
    } else {
      event = `\n🐍 *¡Te mordio la serpiente!*`;
    }
    newPos = destination;
  }

  ut[m.chat].players[m.sender].position = newPos;

  const playerIdx = players.indexOf(m.sender);
  const color = PLAYER_COLORS[playerIdx];
  const name = PLAYER_NAMES[playerIdx];

  // Check win condition
  if (newPos === 100) {
    // Give rewards
    try {
      db.updateKoin(m.sender, WIN_REWARD.koin);
      db.updateEnergi(m.sender, WIN_REWARD.energi);
      const userData = db.getUser(m.sender) || {};
      userData.exp = (userData.exp || 0) + WIN_REWARD.exp;
      db.setUser(m.sender, userData);
    } catch (e) {
      console.log("[UT] Failed to give reward:", e.message);
    }

    // Draw final board
    const positions = players.map(
      (p) => ut[m.chat].players[p]?.position || null,
    );
    const boardImage = await drawBoard(
      ut[m.chat].map,
      positions[0] || null,
      positions[1] || null,
      positions[2] || null,
      positions[3] || null,
      ut[m.chat].stabil_x,
      ut[m.chat].stabil_y,
    );

    await m.react("🎉");

    if (boardImage) {
      await sock.sendMessage(m.chat, {
        image: boardImage,
        caption:
          `🎉 *¡GANADOR!*\n\n` +
          `${color} @${m.sender.split("@")[0]} llego a la casilla 100!\n\n` +
          `╭┈┈⬡「 🎁 *PREMIO* 」\n` +
          `┃ 💰 +${WIN_REWARD.koin.toLocaleString()} Monedas\n` +
          `┃ ⭐ +${WIN_REWARD.exp.toLocaleString()} EXP\n` +
          `┃ ⚡ +${WIN_REWARD.energi} Energia\n` +
          `╰┈┈┈┈┈┈┈┈⬡\n\n` +
          `> ¡GG WP! ¿Jugar de nuevo? \`.ut create\``,
        contextInfo: utCtx([m.sender]),
      });
    } else {
      await sendUT(
        sock,
        m.chat,
        `🎉 *¡GANADOR!*\n\n` +
        `${color} @${m.sender.split("@")[0]} llego a la casilla 100!\n\n` +
        `╭┈┈⬡「 🎁 *PREMIO* 」\n` +
        `┃ 💰 +${WIN_REWARD.koin.toLocaleString()} Monedas\n` +
        `┃ ⭐ +${WIN_REWARD.exp.toLocaleString()} EXP\n` +
        `┃ ⚡ +${WIN_REWARD.energi} Energia\n` +
        `╰┈┈┈┈┈┈┈┈⬡`,
        "🏆 ¡GANADOR!",
        `¡${name} gano!`,
        [m.sender],
      );
    }

    delete ut[m.chat];
    return true;
  }

  // Continue game
  ut[m.chat].turn++;
  const nextTurn = ut[m.chat].turn % players.length;
  const nextPlayer = players[nextTurn];

  // Draw updated board
  const positions = players.map((p) => ut[m.chat].players[p]?.position || null);
  const boardImage = await drawBoard(
    ut[m.chat].map,
    positions[0] || null,
    positions[1] || null,
    positions[2] || null,
    positions[3] || null,
    ut[m.chat].stabil_x,
    ut[m.chat].stabil_y,
  );

  if (boardImage) {
    await sock.sendMessage(m.chat, {
      image: boardImage,
      caption:
        `🎲 *DADU: ${dadu}* ${DICE_EMOJI[dadu - 1]}\n\n` +
        `${color} ${name}: *${oldPos}* → *${newPos}*${event}\n\n` +
        `> 🎯 Turno: @${nextPlayer.split("@")[0]}\n` +
        `> Escribe *tirar*`,
      contextInfo: utCtx([nextPlayer]),
    });
  } else {
    await sendUT(
      sock,
      m.chat,
      `🎲 *DADU: ${dadu}* ${DICE_EMOJI[dadu - 1]}\n\n` +
      `${color} ${name}: *${oldPos}* → *${newPos}*${event}\n\n` +
        `> 🎯 Turno: @${nextPlayer.split("@")[0]}\n` +
        `> Escribe *tirar*`,
        "🎲 TURNO",
      PLAYER_NAMES[nextTurn],
      [nextPlayer],
    );
  }

  return true;
}

export { pluginConfig as config, handler, answerHandler };
