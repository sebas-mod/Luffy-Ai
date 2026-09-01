import { prepareWAMessageMedia } from "ourin";
import config from "../../config.js";
import {
  getCommandsByCategory,
} from "../../src/lib/luffy-plugins.js";
import { getTimeGreeting } from "../../src/lib/luffy-formatter.js";
import { getAssetBuffer } from "../../src/lib/luffy-asset-manager.js";

const pluginConfig = {
  name: "menu_juegos2",
  alias: ["menujuegos2", "mj2", "juegos2menu"],
  category: "main",
  description: "Mostrar el sub-menú con todos los juegos de la categoría juegos2",
  usage: ".menujuegos2",
  example: ".menujuegos2",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  carne: 0,
  isEnabled: true,
};

function toSmallCaps(text) {
  const smallCaps = {
    a: "ᴀ", b: "ʙ", c: "ᴄ", d: "ᴅ", e: "ᴇ", f: "ꜰ", g: "ɢ",
    h: "ʜ", i: "ɪ", j: "ᴊ", k: "ᴋ", l: "ʟ", m: "ᴍ", n: "ɴ",
    o: "ᴏ", p: "ᴘ", q: "ǫ", r: "ʀ", s: "s", t: "ᴛ", u: "ᴜ",
    v: "ᴠ", w: "ᴡ", x: "x", y: "ʏ", z: "ᴢ", 0: "0", 1: "1",
    2: "2", 3: "3", 4: "4", 5: "5", 6: "6", 7: "7", 8: "8", 9: "9",
  };
  return text
    .toLowerCase()
    .split("")
    .map((c) => smallCaps[c] || c)
    .join("");
}

async function handler(m, { sock }) {
  const prefix = config.command?.prefix || ".";
  const greeting = getTimeGreeting();

  const commandsByCategory = getCommandsByCategory();
  const games = (commandsByCategory["juegos2"] || []).filter(
    (name) => name !== "menu_juegos2",
  );

  let txt = "";
  txt += `╔═══════════════════════╗\n`;
  txt += `║   🕹️  *JUEGOS DE LUFFY*  ║\n`;
  txt += `╚═══════════════════════╝\n\n`;

  if (games.length === 0) {
    txt += `> No hay juegos disponibles en esta categoría.`;
  } else {
    txt += `*✦ ${toSmallCaps("Total")}:*\`${games.length}\` ${toSmallCaps("juegos")}\n\n`;
    let chunk = [];
    for (const cmd of games) {
      chunk.push(`${prefix}${cmd}`);
      if (chunk.length === 3) {
        txt += `╭─────────────────────────╮\n`;
        for (const line of chunk) {
          txt += `│  ▪ ${line}\n`;
        }
        txt += `╰─────────────────────────╯\n`;
        chunk = [];
      }
    }
    if (chunk.length) {
      txt += `╭─────────────────────────╮\n`;
      for (const line of chunk) {
        txt += `│  ▪ ${line}\n`;
      }
      txt += `╰─────────────────────────╯\n`;
    }
  }

  txt += `\n> Para reportar tu puntaje al ranking global usa:\n> \`${prefix}rl <juego> <puntos>\`\n> Escribe \`${prefix}rl\` para ver el leaderboard.\n`;

  txt += `\n> ${config.bot?.name || "Luffy-Ai"} • ${toSmallCaps("juegos2")}`;

  const media = await prepareWAMessageMedia(
    {
      image: getAssetBuffer("luffy-games") || getAssetBuffer("luffy2"),
    },
    { upload: sock.waUploadToServer },
  ).catch(() => null);

  if (!media) {
    return m.reply(txt);
  }

  try {
    await sock.relayMessage(
      m.chat,
      {
        viewOnceMessage: {
          message: {
            messageContextInfo: {},
            interactiveMessage: {
              header: {
                title: "🕹️ Menú de Juegos",
                subtitle: config.bot?.name || "Luffy-Ai",
                hasMediaAttachment: true,
                imageMessage: media.imageMessage,
              },
              body: {
                text: txt,
              },
              footer: {
                text: "Toca un comando para jugar • Credits: yosoyyo",
              },
              contextInfo: {
                isForwarded: true,
                forwardingScore: 9,
                participant: "0@s.whatsapp.net",
                quotedMessage: {
                  conversation: `${config.bot?.name || "Luffy-Ai"}`,
                },
                mentionedJid: [`${m.sender}`],
              },
              nativeFlowMessage: {
                messageParamsJson: JSON.stringify({
                  limited_time_offer: {
                    text: `${greeting}`,
                    url: "Hai",
                    copy_code: "Creado por " + config.bot?.developer,
                    expiration_time: Date.now() + 1000000,
                  },
                }),
                buttons: [
                  {
                    name: "quick_reply",
                    buttonParamsJson: JSON.stringify({
                      display_text: "🍅 Volver al Menú Principal",
                      id: m.prefix + "menu",
                    }),
                  },
                ],
              },
            },
          },
        },
      },
      {},
    );
  } catch (err) {
    await m.reply(txt);
  }
}

export { pluginConfig as config, handler };
