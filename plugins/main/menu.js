import { getCaseCount, getCasesByCategory } from "../../case/luffy.js";
import {
  prepareWAMessageMedia,
  generateWAMessageFromContent,
  proto,
} from "ourin";
import { createCanvas, loadImage, GlobalFonts } from "@napi-rs/canvas";
import _sharp from "sharp";
import config from "../../config.js";
import {
  formatUptime,
  getTimeGreeting,
} from "../../src/lib/luffy-formatter.js";
import {
  getCommandsByCategory,
  getCategories,
} from "../../src/lib/luffy-plugins.js";
import { getDatabase } from "../../src/lib/luffy-database.js";
import { getAssetBuffer } from "../../src/lib/luffy-asset-manager.js";
import fs from "fs";
import path from "path";

function getSharp() {
  return _sharp;
}
import axios from "axios";
import sharp from "sharp";
const pluginConfig = {
  name: "menu",
  alias: ["help", "ayuda", "commands", "m"],
  category: "main",
  description: "Mostrar el menú principal del bot",
  usage: ".menu",
  example: ".menu",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  carne: 0,
  isEnabled: true,
};
const CATEGORY_EMOJIS = {
  owner: "👑",
  main: "🏠",
  utility: "🔧",
  tools: "🛠️",
  fun: "🎮",
  game: "🎯",
  download: "📥",
  downloader: "📥",
  search: "🔍",
  sticker: "🖼️",
  media: "🎬",
  ai: "🤖",
  group: "👥",
  islamic: "🕌",
  info: "ℹ️",
  cek: "📁",
  user: "📊",
  canvas: "🎨",
  random: "🎲",
  ephoto: "🖌️",
  jpm: "📨",
  anime: "🍥",
  asupan: "🎞️",
  clan: "⚔️",
  convert: "🔄",
  berita: "📰",
  rpg: "🗡️",
  nsfw: "🔞",
  primbon: "🔮",
  cecan: "💃",
  stalker: "🕵️",
  tts: "🗣️"
};
function toSmallCaps(text) {
  const smallCaps = {
    a: "ᴀ",
    b: "ʙ",
    c: "ᴄ",
    d: "ᴅ",
    e: "ᴇ",
    f: "ꜰ",
    g: "ɢ",
    h: "ʜ",
    i: "ɪ",
    j: "ᴊ",
    k: "ᴋ",
    l: "ʟ",
    m: "ᴍ",
    n: "ɴ",
    o: "ᴏ",
    p: "ᴘ",
    q: "ǫ",
    r: "ʀ",
    s: "s",
    t: "ᴛ",
    u: "ᴜ",
    v: "ᴠ",
    w: "ᴡ",
    x: "x",
    y: "ʏ",
    z: "ᴢ",
  };
  return text
    .toLowerCase()
    .split("")
    .map((c) => smallCaps[c] || c)
    .join("");
}
const toMonoUpperBold = (text) => {
  const chars = {
    A: "𝗔",
    B: "𝗕",
    C: "𝗖",
    D: "𝗗",
    E: "𝗘",
    F: "𝗙",
    G: "𝗚",
    H: "𝗛",
    I: "𝗜",
    J: "𝗝",
    K: "𝗞",
    L: "𝗟",
    M: "𝗠",
    N: "𝗡",
    O: "𝗢",
    P: "𝗣",
    Q: "𝗤",
    R: "𝗥",
    S: "𝗦",
    T: "𝗧",
    U: "𝗨",
    V: "𝗩",
    W: "𝗪",
    X: "𝗫",
    Y: "𝗬",
    Z: "𝗭",
  };
  return text
    .toUpperCase()
    .split("")
    .map((c) => chars[c] || c)
    .join("");
};
function getSortedCategories(m, botMode) {
  const categories = getCategories();
  const commandsByCategory = getCommandsByCategory();
  const categoryOrder = [
    "owner",
    "main",
    "utility",
    "tools",
    "fun",
    "game",
    "rpg",
    "download",
    "search",
    "sticker",
    "media",
    "ai",
    "group",
    "info",
    "cek",
    "economy",
    "user",
    "canvas",
    "random",
    "premium",
    "ephoto",
    "jpm",
    "store"
  ];
  let modeAllowedMap = {
    md: null,
    store: ["main", "group", "sticker", "owner", "store"],
  };
  let modeExcludeMap = {
    md: ["store"],
    store: null,
  };
  const allowedCats = modeAllowedMap[botMode];
  const excludeCats = modeExcludeMap[botMode] || [];
  const sortedCats = [...categories].sort((a, b) => {
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });
  const result = [];
  let totalCmds = 0;
  for (const cat of sortedCats) {
    if (cat === "owner" && !m.isOwner) continue;
    if (allowedCats && !allowedCats.includes(cat.toLowerCase())) continue;
    if (excludeCats && excludeCats.includes(cat.toLowerCase())) continue;
    const cmds = commandsByCategory[cat] || [];
    if (cmds.length === 0) continue;
    const emoji = CATEGORY_EMOJIS[cat] || "📁";
    result.push({ cat, cmds, emoji });
  }
  for (const cat of categories) {
    totalCmds += (commandsByCategory[cat] || []).length;
  }
  return { sorted: result, totalCmds, commandsByCategory };
}
async function formatTime(date) {
  const timeHelper = await import("../../src/lib/luffy-time.js");
  return timeHelper.formatTime("HH:mm");
}
async function formatDateShort(date) {
  const timeHelper = await import("../../src/lib/luffy-time.js");
  return timeHelper.formatFull("dddd, DD MMMM YYYY");
}
async function buildMenuText(
  m,
  botConfig,
  db,
  uptime,
  botMode = "md",
  useBracketBoxStyle = false,
) {
  const prefix = botConfig.command?.prefix || ".";
  const user = db.getUser(m.sender);
  const timeHelper = await import("../../src/lib/luffy-time.js");
  const timeStr = timeHelper.formatTime("HH:mm");
  const dateStr = timeHelper.formatFull("dddd, DD MMMM YYYY");
  const categories = getCategories();
  const commandsByCategory = getCommandsByCategory();
  let totalCommands = 0;
  for (const category of categories) {
    totalCommands += (commandsByCategory[category] || []).length;
  }
  const totalCases = getCaseCount();
  const casesByCategory = getCasesByCategory();
  const totalFeatures = totalCommands + totalCases;
  let userRole = "User",
    roleEmoji = "👤";
  if (m.isOwner) {
    userRole = "Owner";
    roleEmoji = "👑";
  } else if (m.isPremium) {
    userRole = "Premium";
    roleEmoji = "💎";
  }
  const greeting = getTimeGreeting();
  const uptimeFormatted = formatUptime(uptime);
  const totalUsers = db.getUserCount();
  let txt = `╔═══════════════════╗\n`;
  txt += `║  🏴‍☠️ *${(botConfig.bot?.name || "Luffy-Ai").toUpperCase()}* 🏴‍☠️\n`;
  txt += `╚═══════════════════╝\n\n`;
  txt += `${greeting}, *${m.pushName || "User"}*! 👋\n`;
  txt += `⚓ Tu bot pirata listo para ayudarte: descargas, juegos, búsquedas, stickers y mucho más.\n\n`;

  txt += `╔══「 👑 𝗜𝗡𝗙𝗢 𝗨𝗦𝗨𝗔𝗥𝗜𝗢 」\n`;
  txt += `║ ▸ *Nombre* : ${m.pushName || "User"}\n`;
  txt += `║ ▸ *Estado* : ${roleEmoji} ${userRole}\n`;
  txt += `║ ▸ *Modo* : ${(botConfig.mode || "public").toUpperCase()}\n`;
  txt += `║ ▸ *Número* : ${m.sender.split("@")[0]}\n`;
  txt += `║ ▸ *Hora* : ${timeStr}\n`;
  txt += `╚═══════════════════╝\n\n`;

  txt += `╔══「 🤖 𝗜𝗡𝗙𝗢 𝗕𝗢𝗧 」\n`;
  txt += `║ ▸ *Nombre* : ${botConfig.bot?.name || "Luffy-Ai"}\n`;
  txt += `║ ▸ *Autor* : ${botConfig.bot?.developer || "Owner"}\n`;
  txt += `║ ▸ *Versión* : ${botConfig.bot?.version || "1.2.0"}\n`;
  txt += `║ ▸ *Script* : Luffy-Ai x ${botConfig.bot?.developer || "Owner"}\n`;
  txt += `║ ▸ *Activo* : ${uptimeFormatted}\n`;
  txt += `╚═══════════════════╝\n\n`;
  const categoryOrder = [
    "owner",
    "main",
    "utility",
    "tools",
    "fun",
    "game",
    "rpg",
    "download",
    "search",
    "sticker",
    "media",
    "ai",
    "group",
    "info",
    "cek",
    "economy",
    "user",
    "canvas",
    "random",
    "premium",
    "ephoto",
    "jpm",
    "store"
  ];
  const sortedCategories = [...categories].sort((a, b) => {
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });
  let modeAllowedMap = {
    md: null,
    store: ["main", "group", "sticker", "owner", "store"],
  };
  let modeExcludeMap = {
    md: ["store"],
    store: null,
  };
  try {
    const botmodePlugin = await import("../group/botmode.js");
    if (botmodePlugin && botmodePlugin.MODES) {
      const modes = botmodePlugin.MODES;
      modeAllowedMap = {};
      modeExcludeMap = {};
      for (const [key, val] of Object.entries(modes)) {
        modeAllowedMap[key] = val.allowedCategories;
        modeExcludeMap[key] = val.excludeCategories;
      }
    }
  } catch (e) { }
  const allowedCategories = modeAllowedMap[botMode];
  const excludeCategories = modeExcludeMap[botMode] || [];
  const categoryLines = [];
  for (const category of sortedCategories) {
    if (category === "owner" && !m.isOwner) continue;
    if (
      allowedCategories &&
      !allowedCategories.includes(category.toLowerCase())
    )
      continue;
    if (excludeCategories && excludeCategories.includes(category.toLowerCase()))
      continue;
    const pluginCmds = commandsByCategory[category] || [];
    const caseCmds = casesByCategory[category] || [];
    const totalCmds = pluginCmds.length + caseCmds.length;
    if (totalCmds === 0) continue;
    const emoji = CATEGORY_EMOJIS[category] || "📁";
    categoryLines.push(`${prefix}menucat ${category} ${emoji}`);
  }
  if (categoryLines.length > 0) {
    txt += `╔══「 📜 𝗟𝗜𝗦𝗧𝗔 𝗗𝗘 𝗠𝗘𝗡ú 」\n`;
    txt += `║ ${categoryLines[0]}\n`;
    for (let i = 1; i < categoryLines.length; i++) {
      txt += `║ ${categoryLines[i]}\n`;
    }
    txt += `╚═══════════════════╝\n`;
  }
  return txt;
}

function createBracketBox(title, lines = [], emoji = "🤖") {
  let text = `╭─〔 ${emoji} \`${title}\`〕─⬣\n`;
  for (const line of lines) {
    text += `│ ✦ *${line}*\n`;
  }
  text += `╰─⬣\n\n`;
  return text;
}

function getContextInfo(
  botConfig,
  m,
  thumbBuffer,
  renderLargerThumbnail = false,
) {
  const saluranId = botConfig.saluran?.canalId || "120363425262664012@newsletter";
  const saluranName =
    botConfig.saluran?.name || botConfig.bot?.name || "Luffy-Ai";
  const saluranLink = botConfig.saluran?.canalLink || "https://whatsapp.com/channel/0029Vb8GuvGDZ4LWNa7sTi3O";
  const ctx = {
    mentionedJid: [m.sender],
    forwardingScore: 9,
    isForwarded: true,
    externalAdReply: {
      title: botConfig.bot?.name || "Luffy-Ai",
      body: `BOT WHATSAPP MULTI DEVICE`,
      sourceUrl: saluranLink,
      previewType: "VIDEO",
      showAdAttribution: false,
      renderLargerThumbnail,
    },
  };
  if (thumbBuffer) ctx.externalAdReply.thumbnail = thumbBuffer;
  return ctx;
}
function getVerifiedQuoted(botConfig, m) {
  if (m) {
    return {
      key: {
        participant: `${m.sender}`,
        remoteJid: `status@broadcast`,
      },
      message: {
        contactMessage: {
          displayName: `🍂 Yth. ${m.pushName}`,
          vcard: `BEGIN:VCARD\nVERSION:3.0\nN:XL;ttname,;;;\nFN:ttname\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
          sendEphemeral: true,
        },
      },
    };
  }
  return {
    key: {
      participant: `0@s.whatsapp.net`,
      remoteJid: `status@broadcast`,
    },
    message: {
      contactMessage: {
        displayName: `🪸 ${botConfig.bot?.name}`,
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:XL;ttname,;;;\nFN:ttname\nitem1.TEL;waid=13135550002:+1 (313) 555-0002\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
        sendEphemeral: true,
      },
    },
  };
}

async function handler(m, { sock, config: botConfig, db, uptime }) {
  const savedVariant = db.setting("menuVariant");
  const menuVariant = savedVariant || botConfig.ui?.menuVariant || 2;
  const groupData = m.isGroup ? db.getGroup(m.chat) || {} : {};
  const botMode = groupData.botMode || "md";
  const text = await buildMenuText(
    m,
    botConfig,
    db,
    uptime,
    botMode,
    menuVariant === 9,
  );

  let imageBuffer = null;
  let thumbBuffer = null;
  let videoBuffer = null;

  try {
    imageBuffer = getAssetBuffer("luffy")
    thumbBuffer = getAssetBuffer("luffy2")
  } catch (e) {
    console.error("Error al cargar assets:", e.message);
  }
  const prefix = botConfig.command?.prefix || ".";
  const saluranId = botConfig.saluran?.canalId || "120363425262664012@newsletter";
  const saluranName =
    botConfig.saluran?.name || botConfig.bot?.name || "Luffy-Ai";
  const saluranLink =
    botConfig.saluran?.canalLink ||
    "https://whatsapp.com/channel/0029Vb8GuvGDZ4LWNa7sTi3O";
  const {
    sorted: menuSorted,
    totalCmds,
    commandsByCategory,
  } = getSortedCategories(m, botMode);
  const greeting = getTimeGreeting();
  const uptimeFormatted = formatUptime(uptime);
  const user = await db.getUser(m.sender) || {}
  try {
    const categories = getSortedCategories(m, botMode);
    const zann_pengin_rehat = categories.sorted.map(({ cat, cmds, emoji }) => {
      return {
        title: `${emoji} ${toMonoUpperBold(cat)}`,
        description: `Contiene ${cmds.length} comandos`,
        id: `${m.prefix}menu_categoria ${cat}`,
      };
    });
    switch (menuVariant) {
      case 1:
        if (imageBuffer) {
          await sock.sendMessage(m.chat, {
            image: fs.readFileSync(config.assets["luffy"]),
            caption: ``,
            footer: `¡Holaa ${m.pushName}! 👋

⚓ Bienvenido a bordo de *${config.bot?.name}*

╭━━━〔 🤖 INFORMACIÓN DEL BOT 〕━━━╮
┃ ╰┈➤ *Nombre del Bot* : *${config.bot?.name}*
┃ ╰┈➤ *Versión* : *${config.bot.version}*
┃ ╰┈➤ *Desarrollador* : *${config.bot.developer}*
┃ ╰┈➤ *Librería* : \`luffy-baileys\`
╰━━━━━━━━━━━━━━╯

╭━━━〔 👑 INFORMACIÓN DEL USUARIO 〕━━━╮
┃ ╰┈➤ *Nombre* : *${m.pushName}*
┃ ╰┈➤ *Rango* : *${m?.isOwner ? "👑 Owner" : m?.isPremium ? "💎 Premium" : "👤 Usuario"}*
┃ ╰┈➤ *Nivel* : *${user.level || 0}*
┃ ╰┈➤ *Exp* : *${user.exp || 0}*
┃ ╰┈➤ *Carne* : *${user.carne || 0}*
┃ ╰┈➤ *Berry* : *${user.berry || 0}*
┃ ╰┈➤ *Registro* : *${user.isRegistered ? "Sí" : "No"}*
╰━━━━━━━━━━━━━━╯

Toca el botón de abajo para más información y elegir la categoría
`,
            interactiveButtons: [
              {
                name: "single_select",
                buttonParamsJson: JSON.stringify({
                  title: "🍃 Menú Principal",
                  sections: [
                    {
                      title: "Aquí están las opciones",
                      rows: zann_pengin_rehat
                    }
                  ],
                  icon: "DEFAULT"
                })
              },
              {
                name: "single_select",
                buttonParamsJson: JSON.stringify({
                  title: "Ver más",
                  sections: [
                    {
                      title: "Aquí están las opciones",
                      rows: [
                        {
                          title: "🍔 Ver todos los menús de este bot",
                          description: "Toca y envía",
                          id: `${m.prefix}sc`
                        },
                        {
                          title: "🥰 ¿Quieres un bot igual a este?",
                          description: "Toca y envía, luego el bot enviará un enlace de descarga",
                          id: `${m.prefix}sc`
                        },
                        {
                          title: "🌾 ¿Quién es el owner de este bot?",
                          description: "Toca y presiona enviar para continuar",
                          id: `${m.prefix}owner`
                        },
                      ]
                    }
                  ],
                  icon: "REVIEW"
                })
              },
            ]
          }, {
            quoted: getVerifiedQuoted(botConfig, m),
          })
        } else {
          await m.reply(text);
        }
        break;
      case 2:
        let s = ""
        categories.sorted.map(({ cat, cmds, emoji }) => {
          s += `╔══「 ${emoji} ${toMonoUpperBold(cat)} 」══╗\n`
          cmds.map((cmd) => {
            s += `║ ▸ ${m.prefix}${cmd}\n`
          })
          s += "╚═══════════════╝\n\n"
        });
        const media = await prepareWAMessageMedia({
          image: fs.readFileSync(config.assets["luffy"])
        }, { upload: sock.waUploadToServer })
        const readmore = String.fromCharCode(8206).repeat(4001)
        await sock.relayMessage(
          m.chat,
          {
            viewOnceMessage: {
              message: {
                messageContextInfo: {},
                interactiveMessage: {
                  header: {
                    title: "",
                    subtitle: "",
                    hasMediaAttachment: true,
                    imageMessage: media.imageMessage
                  },
                  body: {
                    text: `╔═══════════════════╗
║  🏴‍☠️ *${(config.bot?.name || "LUFFY-AI").toUpperCase()}* 🏴‍☠️
╚═══════════════════╝

¡Hola, *${m.pushName}*! 👋 Bienvenido a bordo ⚓

╔══「 🤖 𝗜𝗡𝗙𝗢 𝗕𝗢𝗧 」
║ ▸ *Nombre* : ${config.bot?.name}
║ ▸ *Versión* : ${config.bot?.version}
║ ▸ *Creador* : ${config.bot?.developer}
║ ▸ *Librería* : \`luffy-baileys\`
╚═══════════════════╝

╔══「 👑 𝗧𝗨𝗦 𝗗𝗔𝗧𝗢𝗦 」
║ ▸ *Nombre* : ${m.pushName}
║ ▸ *Rango* : ${m?.isOwner ? "🔥 Owner" : m?.isPremium ? "👑 Premium" : "😊 Usuario"}
║ ▸ *Nivel* : ${user.level || 0}
║ ▸ *Exp* : ${user.exp || 0}
║ ▸ *Carne* : ${user.carne || 0}
║ ▸ *Berry* : ${user.berry || 0}
║ ▸ *Registro* : ${user.isRegistered ? "Sí" : "No"}
╚═══════════════════╝

${readmore}${s}`
                  },
                  footer: {
                    text: "Elige el botón de abajo para más información"
                  },
                  contextInfo: {
                    isForwarded: true,
                    fprwardingScore: 9,
                    participant: "0@s.whatsapp.net",
                    quotedMessage: {
                      conversation: `${config.bot?.name}`
                    },
                    mentionedJid: [
                      `${m.sender}`
                    ]
                  },
                  nativeFlowMessage: {
                    messageParamsJson: JSON.stringify({
                      limited_time_offer: {
                        text: `${greeting}`,
                        url: "Hai",
                        copy_code: "Creado por " + config.bot?.developer,
                        expiration_time: Date.now() + 1000000,
                      },
                      bottom_sheet: {
                        in_thread_buttons_limit: 2,
                        divider_indices: [1, 2, 3, 4, 5, 999],
                        list_title: "Por favor, elige el menú que quieras",
                        button_title: "🍅 Ver más",
                      },
                      tap_target_configuration: {
                        title: " X ",
                        description: "bomboclard",
                        canonical_url: "https://https://example.com",
                        domain: "shop.example.com",
                        button_index: 0,
                      },
                    }),
                    buttons: [
                      {
                        name: "single_select",
                        buttonParamsJson: JSON.stringify({
                          has_multiple_buttons: true
                        })
                      },
                      {
                        name: "cta_url",
                        buttonParamsJson: JSON.stringify({
                          display_text: "🍫 Nuestro Owner",
                          url: `https://wa.me/${botConfig.owner?.number?.[0]}`,
                          merchant_url: `https://wa.me/${config.owner?.number?.[0]}`,
                        })
                      },
                      {
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                          display_text: "🍛 Obtener Script ( Gratis )",
                          id: `${m.prefix}sc`
                        })
                      }
                    ]
                  }
                }
              }
            }
          },
          {}
        )

        break;

      case 3:
        const content = {
          buttonsMessage: {
            buttons: [
              {
                buttonId: `${m.prefix}owner`,
                buttonText: {
                  displayText: '🧀 Owner',
                },
                type: 1,
              },
              {
                buttonId: `${m.prefix}menu_todo`,
                buttonText: {
                  displayText: '💐 Menú Completo',
                },
                type: 1,
              },
            ],
            locationMessage: {
              jpegThumbnail: await sharp(fs.readFileSync(config.assets["luffy"])).resize(300, 170).toBuffer(),
              name: config.bot.name,
              address: `Versión actual: ${config.bot.version}`
            },
            contentText: `╔═══════════════════╗
║  🏴‍☠️ *${(config.bot?.name || "LUFFY-AI").toUpperCase()}* 🏴‍☠️
╚═══════════════════╝

¡Hola, *${m.pushName}*! 👋 Bienvenido a bordo ⚓

╔══「 🤖 𝗜𝗡𝗙𝗢 𝗕𝗢𝗧 」
║ ▸ *Nombre* : ${config.bot?.name}
║ ▸ *Versión* : ${config.bot?.version}
║ ▸ *Creador* : ${config.bot?.developer}
║ ▸ *Librería* : \`luffy-baileys\`
╚═══════════════════╝

╔══「 👑 𝗧𝗨𝗦 𝗗𝗔𝗧𝗢𝗦 」
║ ▸ *Nombre* : ${m.pushName}
║ ▸ *Rango* : ${m?.isOwner ? "🔥 Owner" : m?.isPremium ? "👑 Premium" : "😊 Usuario"}
║ ▸ *Nivel* : ${user.level || 0}
║ ▸ *Exp* : ${user.exp || 0}
║ ▸ *Carne* : ${user.carne || 0}
║ ▸ *Berry* : ${user.berry || 0}
║ ▸ *Registro* : ${user.isRegistered ? "Sí" : "No"}
╚═══════════════════╝

╔══「 📢 𝗖𝗔𝗡𝗔𝗟 」 
║ ▸ Únete: ${config.saluran?.canalLink || "https://whatsapp.com/channel/0029Vb8GuvGDZ4LWNa7sTi3O"}
╚═══════════════════╝`,
            footerText: '⚓ Elige una de las opciones de abajo',
            headerType: 6,
          },
        };

        const msg = generateWAMessageFromContent(m.chat, content, {
          userJid: sock.user.jid,
        });

        await sock.relayMessage(m.chat, msg.message, {
          messageId: msg.key.id,
        });
        break

      case 4: {
        const thumbnail = await sharp(fs.readFileSync(config.assets["luffy"])).resize(300, 300).toBuffer()
        const qvideo = {
          key: {
            fromMe: false,
            participant: m.sender
          },
          message: {
            videoMessage: {
              caption: config.bot.name,
              seconds: 999999999,
              mimetype: "video/mp4",
              jpegThumbnail: thumbnail,
              fileLength: "9999999"
            }
          }
        }
        const media4 = await prepareWAMessageMedia({
          video: fs.readFileSync(config.assets["luffy-mp4"]),
          gifPlayback: true
        }, { upload: sock.waUploadToServer });
        let singlePush = categories.sorted.map(cat => {
          return {
            name: "single_select",
            buttonParamsJson: JSON.stringify({
              title: `${cat.emoji} ${cat.cat} Menu`,
              sections: [
                {
                  title: "Selecciona el comando",
                  highlight_label: config.bot.name,
                  rows: cat.cmds.map((cmd, i) => {
                    return {
                      title: (i + 1).toString() + " " + cmd,
                      description: "¿Usar este comando?",
                      id: `${prefix}${cmd}`
                    }
                  })
                }
              ],
              icon: "REVIEW"
            })
          }
        })
        const msg4 = generateWAMessageFromContent(m.chat, {
          viewOnceMessage: {
            message: {
              messageContextInfo: {},
              interactiveMessage: {
                header: {
                  title: "",
                  subtitle: "",
                  hasMediaAttachment: true,
                  videoMessage: media4.videoMessage
                },
                footer: {
                  text: `Selecciona uno de los botones de abajo`
                },
                body: {
                  text: `╔═══════════════════╗
║  🏴‍☠️ *${(config.bot.name || "LUFFY-AI").toUpperCase()}* 🏴‍☠️
╚═══════════════════╝

*${greeting} ${m.pushName}*! 👋 Listo para ayudarte en WhatsApp con un script *Javascript* armado por mi creador.

╔══「 🤖 𝗜𝗡𝗙𝗢 𝗕𝗢𝗧 」
║ ▸ *Creador* : ${config.bot?.developer}
║ ▸ *Nombre* : ${config.bot?.name}
║ ▸ *Versión* : ${config.bot?.version}
║ ▸ *Tipo* : \`Plugin x Cases\`
║ ▸ *Modo* : *${config.mode === 'public' ? '🍕 Desbloqueado para todos' : '🥖 Solo para el Owner'}*
╚═══════════════════╝

Disfruta su uso, pirata. ⚓`
                },
                contextInfo: {
                  mentionedJid: [m.sender],
                  isForwarded: true,
                  forwardingScore: 9,
                  forwardedNewsletterMessageInfo: {
                    newsletterJid: saluranId,
                    newsletterName: saluranName,
                    serverMessageId: 127,
                  },
                },
                nativeFlowMessage: {
                  messageParamsJson: JSON.stringify({
                    bottom_sheet: {
                      in_thread_buttons_limit: 2,
                      divider_indices: [1, 2, 3, 4, 5, 999],
                      list_title: "Selecciona el menú",
                      button_title: "🍙 Ver categoría",
                    },
                    tap_target_configuration: {
                      title: " X ",
                      description: "bomboclard",
                      canonical_url: "https://https://example.com",
                      domain: "shop.example.com",
                      button_index: 0,
                    },
                  }),
                  buttons: [
                    {
                      name: "cta_url",
                      buttonParamsJson: JSON.stringify({
                        display_text: "🧀 Visit My Creator",
                        url: `https://wa.me/${botConfig.owner?.number?.[0]}`,
                        merchant_url: `https://wa.me/${config.owner?.number?.[0]}`,
                      })
                    },
                    ...singlePush
                  ]
                }
              }
            }
          }
        }, { quoted: qvideo, userJid: sock.user.jid });

        await sock.relayMessage(m.chat, msg4.message, {
          messageId: msg4.key.id,
        });
        break;
      }

      case 5: {
        function runtime(seconds) {
          seconds = Number(seconds);

          const d = Math.floor(seconds / (3600 * 24));
          const h = Math.floor(seconds % (3600 * 24) / 3600);
          const m = Math.floor(seconds % 3600 / 60);
          const s = Math.floor(seconds % 60);

          return `${d} h ${m} min ${s} s`;
        }

        const weatherCode = {
          0: "☀️ Despejado",
          1: "🌤️ Parcialmente nublado",
          2: "⛅ Nublado",
          3: "☁️ Cubierto",
          45: "🌫️ Niebla",
          48: "🌫️ Niebla densa",
          51: "🌦️ Llovizna",
          61: "🌧️ Lluvia ligera",
          63: "🌧️ Lluvia",
          65: "⛈️ Lluvia intensa",
          80: "🌦️ Lluvia local",
          95: "⛈️ Tormenta eléctrica"
        }

        async function weatherMenu(city = "Jakarta") {
          try {
            const geo = await axios.get(
              `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
            )

            const loc = geo.data.results?.[0]
            if (!loc) return "Clima no disponible"

            const res = await axios.get(
              `https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,weather_code`
            )

            const current = res.data.current
            const kondisi = weatherCode[current.weather_code] || "🌍 Desconocido"

            return `${kondisi} | 🌡️ ${Math.round(current.temperature_2m)}°C\n📍 ${loc.name}`
          } catch {
            return "Clima no disponible"
          }
        }
        const thumbnail = await sharp(fs.readFileSync(config.assets["luffy"])).resize(300, 300).toBuffer()
        const qOrder = {
          key: {
            fromMe: false,
            participant: '0@s.whatsapp.net',
            remoteJid: m.sender
          },
          message: {
            locationMessage: {
              degreesLatitude: 0,
              degreesLongitude: 0,
              name: await weatherMenu(),
              jpegThumbnail: thumbnail
            }
          }
        }
        const media4 = await prepareWAMessageMedia({
          video: fs.readFileSync(config.assets["luffy-mp4"]),
          gifPlayback: true
        }, { upload: sock.waUploadToServer });
        const msg4 = generateWAMessageFromContent(m.chat, {
          viewOnceMessage: {
            message: {
              messageContextInfo: {},
              interactiveMessage: {
                header: {
                  title: "",
                  subtitle: "",
                  hasMediaAttachment: true,
                  videoMessage: media4.videoMessage
                },
                footer: {
                  text: `Selecciona uno de los botones de abajo`
                },
                body: {
                  text: `╔═══════════════════╗
║  🏴‍☠️ *${(config.bot.name || "LUFFY-AI").toUpperCase()}* 🏴‍☠️
╚═══════════════════╝

¡Hola, *${m.pushName}*! 👋 _Soy un sistema automatizado (bot de WhatsApp) que puede ayudarte a buscar y obtener datos o información directamente desde WhatsApp._

╔══「 🤖 𝗜𝗡𝗙𝗢 𝗕𝗢𝗧 」
║ ▸ Nombre : ${config.bot.name}
║ ▸ Autor : @${config.bot.developer}
║ ▸ Tipo de Script : Case x Plugins
║ ▸ Tiempo activo : ${runtime(process.uptime())}
║ ▸ Versión : ${config.bot.version}
╚═══════════════════╝

╔══「 👑 𝗜𝗡𝗙𝗢 𝗨𝗦𝗨𝗔𝗥𝗜𝗢 」
║ ▸ Nombre : ${m.pushName}
║ ▸ Estado : ${m.isPremium ? "💎 Premium" : m.isOwner ? "👑 Owner" : "🏷️ Free"}
║ ▸ Modo : ${config.mode === "pblic" ? "Pueden usarlo todos" : "Solo Owner :b"}
║ ▸ Número : @${m.sender.split("@")[0]}
║ ▸ ${greeting}
╚═══════════════════╝
`
                },
                contextInfo: {
                  mentionedJid: [m.sender],
                  isForwarded: true,
                  forwardingScore: 9,
                  forwardedNewsletterMessageInfo: {
                    newsletterJid: saluranId,
                    newsletterName: saluranName,
                    serverMessageId: 127,
                  },
                },
                nativeFlowMessage: {
                  messageParamsJson: JSON.stringify({
                    limited_time_offer: {
                      text: `${greeting}`,
                      url: "Hai",
                      // copy_code: "Dibuat oleh " + config.bot?.developer,
                      expiration_time: Date.now() + 10000,
                    },
                    bottom_sheet: {
                      in_thread_buttons_limit: 2,
                      divider_indices: [1, 2, 3, 4, 5, 999],
                      list_title: "Selecciona el menú",
                      button_title: "🍙 Ver categoría",
                    },
                    tap_target_configuration: {
                      title: " X ",
                      description: "bomboclard",
                      canonical_url: "https://https://example.com",
                      domain: "shop.example.com",
                      button_index: 0,
                    },
                  }),
                  buttons: [
                    {
                      name: "",
                      buttonParamsJson: ""
                    },
                    {
                      name: "quick_reply",
                      buttonParamsJson: JSON.stringify({
                        display_text: "𐔌 Menú Completo  𐦯",
                        id: `${prefix}allmenu`
                      })
                    },
                    {
                      name: "quick_reply",
                      buttonParamsJson: JSON.stringify({
                        display_text: "𐔌 Reglas  𐦯",
                        id: `${prefix}rules`
                      })
                    },
                  ]
                }
              }
            }
          }
        }, { quoted: qOrder, userJid: sock.user.jid });

        await sock.relayMessage(m.chat, msg4.message, {
          messageId: msg4.key.id,
        });
        break;
      }
      case 6: {
        function runtime(seconds) {
          seconds = Number(seconds);

          const d = Math.floor(seconds / (3600 * 24));
          const h = Math.floor(seconds % (3600 * 24) / 3600);
          const m = Math.floor(seconds % 3600 / 60);
          const s = Math.floor(seconds % 60);

          return `${d} h ${m} min ${s} s`;
        }

        const weatherCode = {
          0: "☀️ Despejado",
          1: "🌤️ Parcialmente nublado",
          2: "⛅ Nublado",
          3: "☁️ Cubierto",
          45: "🌫️ Niebla",
          48: "🌫️ Niebla densa",
          51: "🌦️ Llovizna",
          61: "🌧️ Lluvia ligera",
          63: "🌧️ Lluvia",
          65: "⛈️ Lluvia intensa",
          80: "🌦️ Lluvia local",
          95: "⛈️ Tormenta eléctrica"
        }

        async function weatherMenu(city = "Jakarta") {
          try {
            const geo = await axios.get(
              `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
            )

            const loc = geo.data.results?.[0]
            if (!loc) return "Clima no disponible"

            const res = await axios.get(
              `https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,weather_code`
            )

            const current = res.data.current
            const kondisi = weatherCode[current.weather_code] || "🌍 Desconocido"

            return `${kondisi} | 🌡️ ${Math.round(current.temperature_2m)}°C\n📍 ${loc.name}`
          } catch {
            return "Clima no disponible"
          }
        }
        const rawStats = fs.readFileSync(path.join(process.cwd(), 'database/main/stats.json'), 'utf8')
        const statsData = JSON.parse(rawStats)
        const commandStats = Object.entries(statsData)
          .filter(([key]) => key.startsWith('command_'))
          .map(([key, count]) => ({ name: key.replace('command_', ''), count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)

        let topCmdText = "\n╔══「 📜 𝗛𝗜𝗦𝗧𝗢𝗥𝗜𝗔𝗟 」\n"
        if (commandStats.length > 0) {
          topCmdText += `║ ▸ ${m.prefix}${commandStats[0].name} (${commandStats[0].count}x)\n`
          for (let i = 1; i < commandStats.length; i++) {
            topCmdText += `║ ▸ ${m.prefix}${commandStats[i].name} (${commandStats[i].count}x)\n`
          }
          topCmdText += `╚═══════════════╝\n`
        } else {
          topCmdText += `║ ▸ Aún no hay comandos\n╚═══════════════╝\n`
        }

        const thumbnail = await sharp(fs.readFileSync(config.assets["luffy"])).resize(300, 300).toBuffer()
        const msg6 = generateWAMessageFromContent(m.chat, {
          viewOnceMessage: {
            message: {
              messageContextInfo: {},
              interactiveMessage: {
                header: {
                  hasMediaAttachment: true,
                  locationMessage: {
                    degreesLatitude: 0,
                    degreesLongitude: 0,
                    name: config.bot?.name || "Luffy-Ai",
                    address: await weatherMenu(),
                    jpegThumbnail: thumbnail
                  }
                },
                body: {
                  text: text + topCmdText
                },
                contextInfo: {
                  mentionedJid: [m.sender],
                  isForwarded: true,
                  forwardingScore: 9,
                },
                nativeFlowMessage: {
                  messageParamsJson: JSON.stringify({
                    limited_time_offer: {
                      text: `${greeting}`,
                      url: "Hai",
                      expiration_time: Date.now() + 10000,
                    },
                    bottom_sheet: {
                      in_thread_buttons_limit: 2,
                      divider_indices: [1, 2, 3, 4, 5, 999],
                      list_title: "Selecciona el menú",
                      button_title: "🍙 Ver categoría",
                    },
                    tap_target_configuration: {
                      title: " X ",
                      description: "bomboclard",
                      canonical_url: "https://https://example.com",
                      domain: "shop.example.com",
                      button_index: 0,
                    },
                  }),
                  buttons: [
                    {
                      name: "",
                      buttonParamsJson: ""
                    },
                    {
                      name: "quick_reply",
                      buttonParamsJson: JSON.stringify({
                        display_text: "𐔌 Menú Completo  𐦯",
                        id: `${prefix}allmenu`
                      })
                    },
                    {
                      name: "quick_reply",
                      buttonParamsJson: JSON.stringify({
                        display_text: "𐔌 Reglas  𐦯",
                        id: `${prefix}rules`
                      })
                    },
                  ]
                }
              }
            }
          }
        }, { quoted: m, userJid: sock.user.jid });

        await sock.relayMessage(m.chat, msg6.message, {
          messageId: msg6.key.id,
        });
        break;
      }
      case 7: {
        function runtimeStr(seconds) {
          seconds = Number(seconds);
          const d = Math.floor(seconds / (3600 * 24));
          if (d > 0) return `${d} días`;
          const h = Math.floor((seconds % (3600 * 24)) / 3600);
          if (h > 0) return `${h} jam`;
          const m = Math.floor((seconds % 3600) / 60);
          if (m > 0) return `${m} minutos`;
          const s = Math.floor(seconds % 60);
          return `${s} segundos`;
        }

        const toMathSansBold = (text) => {
          const chars = {
            A: "𝗔", B: "𝗕", C: "𝗖", D: "𝗗", E: "𝗘", F: "𝗙", G: "𝗚", H: "𝗛", I: "𝗜", J: "𝗝", K: "𝗞", L: "𝗟", M: "𝗠",
            N: "𝗡", O: "𝗢", P: "𝗣", Q: "𝗤", R: "𝗥", S: "𝗦", T: "𝗧", U: "𝗨", V: "𝗩", W: "𝗪", X: "𝗫", Y: "𝗬", Z: "𝗭"
          };
          return text.toUpperCase().split("").map(c => chars[c] || c).join("");
        };

        const botName = config.bot?.name || "velyx store";
        const botModeLower = (config.mode || "public").toLowerCase();
        const botPrefix = config.command?.prefix || ".";
        const runTime = runtimeStr(process.uptime());

        const userName = m.pushName || "User";
        const userStatus = m.isPremium ? "premium" : "free";
        const userRole = m.isOwner ? "owner" : "user";
        const dbUser = db.getUser(m.sender);
        const userLimit = (dbUser?.limit === Infinity || dbUser?.limit === null || dbUser?.limit === undefined) ? "unlimited" : dbUser.limit;

        let case7Text = `╔═══════════════════╗
║  🏴‍☠️ *¡HOLA, ${(m.pushName || "USER").toUpperCase()}!* 🏴‍☠️
╚═══════════════════╝

⚓ Soy *${botName}*, tu asistente inteligente creado por ${config.bot?.developer}. Información, entretenimiento o utilidades: siempre listo para ayudarte.

`

        case7Text += `╔══「 🤖 𝗗𝗘𝗧𝗔𝗟𝗟𝗘𝗦 𝗕𝗢𝗧 」\n`;
        case7Text += `║ ▸ *nombre* : ${botName}\n`;
        case7Text += `║ ▸ *modo* : ${botModeLower}\n`;
        case7Text += `║ ▸ *prefix* : \`${botPrefix}\`\n`;
        case7Text += `║ ▸ *tiempo activo* : ${runTime}\n`;
        case7Text += `╚═══════════════════╝\n\n`;

        case7Text += `╔══「 ❀ 𝗗𝗘𝗧𝗔𝗟𝗟𝗘𝗦 𝗨𝗦𝗨𝗔𝗥𝗜𝗢 」\n`;
        case7Text += `║ ▸ *nombre* : _${userName}_\n`;
        case7Text += `║ ▸ *estado* : ${userStatus}\n`;
        case7Text += `║ ▸ *rango* : ${userRole}\n`;
        case7Text += `║ ▸ *carne* : ${userLimit}\n`;
        case7Text += `╚═══════════════════╝\n\n`;

        const readmore = String.fromCharCode(8206).repeat(4001);
        case7Text += readmore + "";
        case7Text += `╔══「 ✧ 𝗠𝗘𝗡ú 𝗣𝗢𝗥 𝗖𝗔𝗧𝗘𝗚𝗢𝗥í𝗔𝗦 」\n`;
        const { sorted } = getSortedCategories(m, botMode);
        for (const cat of sorted) {
          case7Text += `║ ▸ ${cat.cat.toLowerCase()} : ${cat.cmds.length} funciones\n`;
        }
        case7Text += `╚═══════════════════╝`;


        const { getAssetBuffer } = await import("../../src/lib/luffy-asset-manager.js");
        const imageBuffer = await getAssetBuffer("luffy2");
        const sharp = (await import("sharp")).default;
        const stickerBuf = await sharp(imageBuffer).resize(512, 512).webp().toBuffer();

        const { prepareWAMessageMedia } = await import("ourin");
        const uploadMedia = await prepareWAMessageMedia({ image: stickerBuf }, { upload: sock.waUploadToServer });

        const fakeQuotedSticker = {
          key: {
            fromMe: false,
            participant: "0@s.whatsapp.net",
            remoteJid: "status@broadcast"
          },
          message: {
            stickerMessage: {
              ...uploadMedia.imageMessage,
              mimetype: "image/webp"
            }
          }
        };

        const { generateWAMessageFromContent } = await import("ourin");
        const menuMedia = await prepareWAMessageMedia({
          image: await getAssetBuffer("luffy")
        }, { upload: sock.waUploadToServer });

        const videoLive = await prepareWAMessageMedia({
          video: await getAssetBuffer("luffy-mp4")
        }, { upload: sock.waUploadToServer });

        const msg = generateWAMessageFromContent(m.chat, {
          viewOnceMessage: {
            message: {
              messageContextInfo: {},
              interactiveMessage: {
                header: {
                  title: "",
                  subtitle: "",
                  hasMediaAttachment: true,
                  imageMessage: {
                    ...menuMedia.imageMessage,
                    contextInfo: {
                      pairedMediaType: 5,
                      statusSourceType: 0
                    }
                  }
                },
                body: { text: case7Text },
                footer: { text: `Usa: ${m?.prefix}menucat <categoría>\n\nSi tienes dudas, contacta con el owner.` },
                contextInfo: {
                  mentionedJid: [m.sender],
                  isForwarded: true,
                  forwardingScore: 99
                },
                nativeFlowMessage: {
                  buttons: [
                    {
                      name: "cta_url",
                      buttonParamsJson: JSON.stringify({
                        display_text: "🥐 Contact Owner",
                        url: "http://wa.me/" + config.owner.number[0],
                        merchant_url: "http://wa.me/" + config.owner.number[0]
                      })
                    }
                  ]
                }
              }
            }
          }
        }, { quoted: fakeQuotedSticker, userJid: sock.user.jid });

        await sock.relayMessage(m.chat, msg.message, {
          messageId: msg.key.id,
        });

        await sock.relayMessage(m.chat, {
          videoMessage: {
            ...videoLive.videoMessage,
            contextInfo: {
              pairedMediaType: 6,
              statusSourceType: 0
            }
          },
          messageContextInfo: {
            messageAssociation: {
              associationType: 12,
              parentMessageKey: msg.key
            }
          }
        }, {});

        break;
      }
      case 8: {
        function runtimeStr(seconds) {
          seconds = Number(seconds);
          const d = Math.floor(seconds / (3600 * 24));
          if (d > 0) return `${d} días`;
          const h = Math.floor((seconds % (3600 * 24)) / 3600);
          if (h > 0) return `${h} jam`;
          const m = Math.floor((seconds % 3600) / 60);
          if (m > 0) return `${m} minutos`;
          const s = Math.floor(seconds % 60);
          return `${s} segundos`;
        }

        const toMathSansBold = (text) => {
          const chars = {
            A: "𝗔", B: "𝗕", C: "𝗖", D: "𝗗", E: "𝗘", F: "𝗙", G: "𝗚", H: "𝗛", I: "𝗜", J: "𝗝", K: "𝗞", L: "𝗟", M: "𝗠",
            N: "𝗡", O: "𝗢", P: "𝗣", Q: "𝗤", R: "𝗥", S: "𝗦", T: "𝗧", U: "𝗨", V: "𝗩", W: "𝗪", X: "𝗫", Y: "𝗬", Z: "𝗭"
          };
          return text.toUpperCase().split("").map(c => chars[c] || c).join("");
        };

        const botName = config.bot?.name || "velyx store";
        const botModeLower = (config.mode || "public").toLowerCase();
        const botPrefix = config.command?.prefix || ".";
        const runTime = runtimeStr(process.uptime());

        const userName = m.pushName || "User";
        const userStatus = m.isPremium ? "premium" : "free";
        const userRole = m.isOwner ? "owner" : "user";
        const dbUser = db.getUser(m.sender);
        const userLimit = (dbUser?.limit === Infinity || dbUser?.limit === null || dbUser?.limit === undefined) ? "unlimited" : dbUser.limit;

        const userLevel = dbUser?.level || 1;
        let userRank = "🛡️ Warrior";
        if (userLevel >= 10) userRank = "⭐ Elite";
        if (userLevel >= 20) userRank = "🎖️ Master";
        if (userLevel >= 40) userRank = "💪 Grandmaster";
        if (userLevel >= 60) userRank = "💜 Epic";
        if (userLevel >= 80) userRank = "⚔️ Legend";
        if (userLevel >= 100) userRank = "🐉 Mythic";

        const userJabatan = m.isOwner ? "[ Owner ]" : (m.isPremium ? "[ Premium ]" : "[ User ]");
        const userBerry = dbUser?.berry || 0;
        const userExp = dbUser?.exp || 0;
        const diasActivos = dbUser?.activeDays || 0;

        let case7Text = `╔══「 👑 𝗧𝗨 𝗘𝗦𝗧𝗔𝗗𝗢 」════╗\n`;
        case7Text += `║ ▸ *Rol* : ${userJabatan}\n`;
        case7Text += `║ ▸ *Rango* : ${userRank}\n`;
        case7Text += `║ ▸ *Nivel* : ${userLevel}\n`;
        case7Text += `║ ▸ *Berry* : ${userBerry}\n`;
        case7Text += `║ ▸ *Exp* : ${userExp}\n`;
        case7Text += `║ ▸ *Carne* : ${userLimit}\n`;
        case7Text += `╚═══════════════╝\n\n`;
        case7Text += `¡Hola, mi amigo *"${m.pushName}"*!\n¿Cómo estás hoy? Te sientes bien, ¿verdad?\n⚓ Llevas activo desde hace *${diasActivos} días*\n\n`;

        const readmore = String.fromCharCode(8206).repeat(4001);
        case7Text += readmore + "";

        const { sorted } = getSortedCategories(m, botMode);

        const catMap = {
          info: "INFO BOT",
          jadibot: "SUB-BOT",
          economy: "ECONOMÍA",
          main: "MENÚ PRINCIPAL",
          owner: "MENÚ OWNER"
        };

        for (const cat of sorted) {
          const catName = catMap[cat.cat.toLowerCase()] || cat.cat.toUpperCase();
          case7Text += `╔══「 ✦ ${catName} 」══╗\n`;
          for (const cmd of cat.cmds) {
            case7Text += `║ ▸ ${botPrefix}${cmd}\n`;
          }
          case7Text += `╚═════════════╝\n\n`;
        }
        case7Text = case7Text.trimEnd();

        const { getAssetBuffer } = await import("../../src/lib/luffy-asset-manager.js");
        const imageBuffer = await getAssetBuffer("luffy");
        const favB = await getAssetBuffer("luffy2");
        const sharp = (await import("sharp")).default;
        const thumbBuf = await sharp(imageBuffer).resize(1280, 720).jpeg().toBuffer();
        const favBuf = await sharp(favB).resize(512, 512).jpeg().toBuffer();

        const { prepareWAMessageMedia, generateWAMessageFromContent } = await import("ourin");
        const uploadMedia = await prepareWAMessageMedia({ image: thumbBuf }, { upload: sock.waUploadToServer, mediaTypeOverride: "thumbnail-link" });
        const uploadFav = await prepareWAMessageMedia({ image: favBuf }, { upload: sock.waUploadToServer, mediaTypeOverride: "thumbnail-link" });

        const randomTitles = [
          "¡Sigue con el gran trabajo! 🌟",
          "No olvides sonreír hoy 😊",
          "¡Sigue sonriendo y mantente positivo! ✨",
          "Qué día tan hermoso para crear algo 💻",
          "Gracias por usar este bot 🙏",
          "¡Espero que tengas un día maravilloso! 🌸",
          "No olvides tomar un descanso 🍵",
          "Empieza tu día con una mentalidad positiva 😇"
        ];
        const randomTitle = randomTitles[Math.floor(Math.random() * randomTitles.length)];

        let cuacaStr = "Despejado";
        let suhuStr = "30°C";
        try {
          const { data } = await axios.get("https://wttr.in/Jakarta?format=%C|%t", { timeout: 3000 });
          if (data) {
            const parts = data.split('|');
            if (parts.length === 2) {
              cuacaStr = parts[0].trim();
              suhuStr = parts[1].trim();
            }
          }
        } catch (e) { }
        const displayWeather = `${cuacaStr} | ${suhuStr}`;
        const senderNum = m.sender.split('@')[0];

        const msg = generateWAMessageFromContent(m.chat, {
          extendedTextMessage: {
            text: config.info.website + " " + case7Text,
            matchedText: config.info.website,
            title: randomTitle,
            description: `¡Hola ${m.pushName}! Soy ${botName}`,
            jpegThumbnail: uploadMedia.imageMessage.jpegThumbnail || thumbBuf,
            previewType: 1,
            thumbnailWidth: uploadMedia.imageMessage.width || 512,
            thumbnailHeight: uploadMedia.imageMessage.height || 512,
            thumbnailDirectPath: uploadMedia.imageMessage.directPath,
            thumbnailSha256: uploadMedia.imageMessage.fileSha256,
            thumbnailEncSha256: uploadMedia.imageMessage.fileEncSha256,
            mediaKey: uploadMedia.imageMessage.mediaKey,
            mediaKeyTimestamp: uploadMedia.imageMessage.mediaKeyTimestamp,
            faviconMMSMetadata: {
              thumbnailDirectPath: uploadFav.imageMessage.directPath,
              thumbnailSha256: uploadFav.imageMessage.fileSha256,
              thumbnailEncSha256: uploadFav.imageMessage.fileEncSha256,
              mediaKey: uploadFav.imageMessage.mediaKey,
              mediaKeyTimestamp: uploadFav.imageMessage.mediaKeyTimestamp,
              thumbnailHeight: uploadFav.imageMessage.height || 512,
              thumbnailWidth: uploadFav.imageMessage.width || 512
            },
            contextInfo: {
              mentionedJid: [m.sender],
              isForwarded: true,
              forwardingScore: 999,
              forwardedNewsletterMessageInfo: {
                newsletterJid: config.saluran.canalId,
                newsletterName: config.saluran.name
              }
            }
          }
        }, {
          quoted: {
            key: {
              fromMe: false,
              participant: "0@s.whatsapp.net",
              remoteJid: "status@broadcast"
            },
            message: {
              contactMessage: {
                displayName: displayWeather,
                vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${displayWeather}\nTEL;type=CELL;type=VOICE;waid=${senderNum}:+${senderNum}\nEND:VCARD`
              }
            }
          }
        });

        await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
        break;
      }
      default:
        await m.reply(text);
    }
    const audioEnabled = db.setting("audioMenu") !== false;
    if (audioEnabled) {
      const audioUrl = botConfig.assets["luffy-mp3"];
      try {
        switch (menuVariant) {
          case 1:
            try {
              const oggPath = await (async () => {
                const tempDir = path.join(process.cwd(), "temp");
                if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
                const destPath = path.join(tempDir, "menu_audio_hq_opus.ogg");
                if (fs.existsSync(destPath)) return destPath;
                const mp3Path = path.join(tempDir, "menu_audio.mp3");
                const res = await axios.get(audioUrl, { responseType: "arraybuffer" });
                fs.writeFileSync(mp3Path, Buffer.from(res.data));
                const { spawn } = await import("child_process");
                return new Promise((resolve, reject) => {
                  const ffmpeg = spawn("ffmpeg", ["-y", "-i", mp3Path, "-c:a", "libopus", "-b:a", "256k", "-vbr", "on", "-compression_level", "10", "-ac", "2", "-ar", "48000", destPath]);
                  ffmpeg.on("close", (code) => {
                    if (fs.existsSync(mp3Path)) fs.unlinkSync(mp3Path);
                    if (code === 0) resolve(destPath);
                    else reject(new Error("FFmpeg error"));
                  });
                  ffmpeg.on("error", (err) => {
                    if (fs.existsSync(mp3Path)) fs.unlinkSync(mp3Path);
                    reject(err);
                  });
                });
              })();
              await sock.sendMessage(m.chat, {
                audio: { url: oggPath },
                mimetype: "audio/ogg; codecs=opus",
                ptt: true,
              }, { quoted: m });
            } catch (err) {
              await sock.sendMessage(m.chat, {
                audio: { url: audioUrl },
                mimetype: "audio/mpeg",
                ptt: false,
              }, { quoted: m });
            }
            break;
          case 2: {
            const qpoll = {
              key: { participant: "0@s.whatsapp.net" },
              message: {
                pollCreationMessage: {
                  name: config.bot.name
                }
              }
            };
            try {
              const oggPath = await (async () => {
                const tempDir = path.join(process.cwd(), "temp");
                if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
                const destPath = path.join(tempDir, "menu_audio_hq_opus.ogg");
                if (fs.existsSync(destPath)) return destPath;
                const mp3Path = path.join(tempDir, "menu_audio.mp3");
                const res = await axios.get(audioUrl, { responseType: "arraybuffer" });
                fs.writeFileSync(mp3Path, Buffer.from(res.data));
                const { spawn } = await import("child_process");
                return new Promise((resolve, reject) => {
                  const ffmpeg = spawn("ffmpeg", ["-y", "-i", mp3Path, "-c:a", "libopus", "-b:a", "256k", "-vbr", "on", "-compression_level", "10", "-ac", "2", "-ar", "48000", destPath]);
                  ffmpeg.on("close", (code) => {
                    if (fs.existsSync(mp3Path)) fs.unlinkSync(mp3Path);
                    if (code === 0) resolve(destPath);
                    else reject(new Error("FFmpeg error"));
                  });
                  ffmpeg.on("error", (err) => {
                    if (fs.existsSync(mp3Path)) fs.unlinkSync(mp3Path);
                    reject(err);
                  });
                });
              })();
              await sock.sendMessage(m.chat, {
                audio: { url: oggPath },
                mimetype: "audio/ogg; codecs=opus",
                ptt: true,
              }, { quoted: qpoll });
            } catch (err) {
              await sock.sendMessage(m.chat, {
                audio: fs.readFileSync(config.assets["luffy-mp3"]),
                mimetype: "audio/mpeg",
                ptt: false,
              }, { quoted: qpoll });
            }
            break;
          }
          case 3: {
            const qtext = {
              key: {
                fromMe: false,
                participant: m.sender,
              },
              message: {
                conversation: "pon la música, papá"
              }
            };
            await sock.sendMessage(m.chat, {
              audio: fs.readFileSync(config.assets["luffy-mp3"]),
              mimetype: "audio/mpeg",
              ptt: false,
            }, { quoted: qtext });
            break;
          }
          case 7: {
            const qChannel = {
              key: {
                fromMe: false,
                participant: "0@s.whatsapp.net",
                remoteJid: typeof saluranId !== "undefined" ? saluranId : "120363294025983803@newsletter",
              },
              message: {
                conversation: "🔊 Playing Audio Menu..."
              }
            };
            try {
              const oggPath = await (async () => {
                const tempDir = path.join(process.cwd(), "temp");
                if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
                const destPath = path.join(tempDir, "menu_audio_hq_opus.ogg");
                if (fs.existsSync(destPath)) return destPath;
                const { spawn } = await import("child_process");
                return new Promise((resolve, reject) => {
                  const ffmpeg = spawn("ffmpeg", ["-y", "-i", audioUrl, "-c:a", "libopus", "-b:a", "256k", "-vbr", "on", "-compression_level", "10", "-ac", "2", "-ar", "48000", destPath]);
                  ffmpeg.on("close", (code) => {
                    if (code === 0) resolve(destPath);
                    else reject(new Error("FFmpeg error"));
                  });
                  ffmpeg.on("error", (err) => {
                    reject(err);
                  });
                });
              })();
              await sock.sendMessage(m.chat, {
                audio: { url: oggPath },
                mimetype: "audio/ogg; codecs=opus",
                ptt: true,
              }, { quoted: qChannel });
            } catch (err) {
              await sock.sendMessage(m.chat, {
                audio: { url: audioUrl },
                mimetype: "audio/mpeg",
                ptt: false,
              }, { quoted: qChannel });
            }
            break;
          }
          case 4:
          default: {
            const ftroliQuoted = {
              key: {
                fromMe: false,
                participant: "0@s.whatsapp.net",
                remoteJid: "status@broadcast",
              },
              message: {
                orderMessage: {
                  orderId: "44444444444444",
                  thumbnail:
                    (thumbBuffer || imageBuffer ? await (await getSharp())(thumbBuffer || imageBuffer)
                      .resize({ width: 300, height: 300 })
                      .toBuffer() : null),
                  itemCount: totalCmds,
                  status: "INQUIRY",
                  surface: "CATALOG",
                  message: `★ ${config.bot.name}`,
                  orderTitle: `📋 ${totalCmds} Comandos`,
                  sellerJid: botConfig.botNumber
                    ? `${botConfig.botNumber}@s.whatsapp.net`
                    : m.sender,
                  token: "luffy-menu-v8",
                  totalAmount1000: 3333333,
                  totalCurrencyCode: "IDR",
                  contextInfo: {
                    isForwarded: true,
                    forwardingScore: 9,
                    forwardedNewsletterMessageInfo: {
                      newsletterJid: saluranId,
                      newsletterName: saluranName,
                      serverMessageId: 127,
                    },
                  },
                },
              },
            };
            try {
              await sock.sendMessage(
                m.chat,
                {
                  audio: fs.readFileSync(config.assets["luffy-mp3"]),
                  mimetype: "audio/mpeg",
                },
                { quoted: ftroliQuoted },
              );
            } catch (ffmpegErr) {
              await sock.sendMessage(
                m.chat,
                {
                  audio: fs.readFileSync(config.assets["luffy-mp3"]),
                  mimetype: "audio/mpeg",
                  contextInfo: getContextInfo(botConfig, m, thumbBuffer),
                },
                { quoted: getVerifiedQuoted(botConfig) },
              );
            }
            break;
          }
        }
      } catch (e) {
        console.error("[Menu] Error sending dynamic audio:", e.message);
      }
    }
  } catch (error) {
    console.error("[Menu] Error on command execution:", error.message);
  }
}
export default {
  config: pluginConfig,
  handler,
};
