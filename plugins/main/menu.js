import { getCaseCount, getCasesByCategory } from "../../case/ourin.js";
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
} from "../../src/lib/ourin-formatter.js";
import {
  getCommandsByCategory,
  getCategories,
} from "../../src/lib/ourin-plugins.js";
import { getDatabase } from "../../src/lib/ourin-database.js";
import fs from "fs";
import path from "path";

function getSharp() {
  return _sharp;
}
import axios from "axios";
import sharp from "sharp";
const pluginConfig = {
  name: "menu",
  alias: ["help", "bantuan", "commands", "m"],
  category: "main",
  description: "Mostrar menú principal del bot",
  usage: ".menu",
  example: ".menu",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
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
  linode: "☁️",
  primbon: "🔮",
  cecan: "💃",
  stalker: "🕵️",
  tts: "🗣️",
  vps: "🌊",
  panel: "🖥️"
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
    "pushkontak",
    "panel",
    "store"
  ];
  let modeAllowedMap = {
    md: null,
    cpanel: ["main", "group", "sticker", "owner", "tools", "panel"],
    store: ["main", "group", "sticker", "owner", "store"],
    pushkontak: ["main", "group", "sticker", "owner", "pushkontak"],
  };
  let modeExcludeMap = {
    md: ["panel", "pushkontak", "store"],
    cpanel: null,
    store: null,
    pushkontak: null,
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
  const timeHelper = await import("../../src/lib/ourin-time.js");
  return timeHelper.formatTime("HH:mm");
}
async function formatDateShort(date) {
  const timeHelper = await import("../../src/lib/ourin-time.js");
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
  const timeHelper = await import("../../src/lib/ourin-time.js");
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
  let txt = `${greeting}\n\n`;
  txt += `      ${m.pushName || "User"}\n\n`;
  txt += `Hola Amigo 🌱\n`;
  txt += `Permíteme presentarme, soy ${botConfig.bot?.name || "Denia Al"}, creado por ${botConfig.bot?.developer || "Alesha"} Estoy listo para ayudarte\n`;
  txt += `con lo que necesites, desde descargar\n`;
  txt += `videos, jugar, preguntar, buscar\n`;
  txt += `info/algo, crear stickers, y mucho más.\n\n`;

  txt += `    ᯓ INFO USUARIO\n`;
  txt += `╭   • Nombre : ${m.pushName || "User"}\n`;
  txt += `┆   • Estado : ${userRole}\n`;
  txt += `┆   • Modo : ${(botConfig.mode || "public").toUpperCase()}\n`;
  txt += `┆   • Número : ${m.sender.split("@")[0]}\n`;
  txt += `┆   • Hora : ${timeStr} ART\n`;
  txt += `╰➤------------------------------\n`;

  txt += `    ᯓ INFO BOT\n`;
  txt += `╭  • Nombre : ${botConfig.bot?.name || "Luffy-AI"}\n`;
  txt += `┆  • Autor : ${botConfig.bot?.developer || "Owner"}\n`;
  txt += `┆  • Versión : ${botConfig.bot?.version || "1.2.0"}\n`;
  txt += `┆  • Tipo script : OURIN x ${botConfig.bot?.developer || "Owner"}\n`;
  txt += `┆  • Uptime : ${uptimeFormatted}\n`;
  txt += `╰➤------------------------------\n`;
  const categoryOrder = [
    "owner",
    "main",
    "utility",
    "tools",
    "fun",
    "game",
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
    "pushkontak",
    "panel",
    "store"
  ];
  const sortedCategories = [...categories].sort((a, b) => {
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });
  let modeAllowedMap = {
    md: null,
    cpanel: ["main", "group", "sticker", "owner", "tools", "panel"],
    store: ["main", "group", "sticker", "owner", "store"],
    pushkontak: ["main", "group", "sticker", "owner", "pushkontak"],
  };
  let modeExcludeMap = {
    md: ["panel", "pushkontak", "store"],
    cpanel: null,
    store: null,
    pushkontak: null,
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
    txt += ` ✦ LISTA DE MENÚS ✦\n`;
    txt += `╭   • ${categoryLines[0]}\n`;
    for (let i = 1; i < categoryLines.length; i++) {
      txt += `┆   • ${categoryLines[i]}\n`;
    }
    txt += `╰➤------------------------------\n`;
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
  const saluranId = botConfig.saluran?.id || "120363400911374213@newsletter";
  const saluranName =
    botConfig.saluran?.name || botConfig.bot?.name || "Luffy-AI";
  const saluranLink = botConfig.saluran?.link || "";
  const ctx = {
    mentionedJid: [m.sender],
    forwardingScore: 9,
    isForwarded: true,
    externalAdReply: {
      title: botConfig.bot?.name || "Luffy-AI",
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
    imageBuffer = fs.readFileSync(botConfig.assets["ourin"])
    thumbBuffer = fs.readFileSync(botConfig.assets["ourin2"])
  } catch (e) {
    console.error("Gagal load assets:", e.message);
  }
  const prefix = botConfig.command?.prefix || ".";
  const saluranId = botConfig.saluran?.id || "120363400911374213@newsletter";
  const saluranName =
    botConfig.saluran?.name || botConfig.bot?.name || "Luffy-AI";
  const saluranLink =
    botConfig.saluran?.link ||
    "https://whatsapp.com/channel/0029VbB37bgBfxoAmAlsgE0t";
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
        description: `Este comando tiene (${cmds.length}) Comandos`,
        id: `${m.prefix}menucat ${cat}`,
      };
    });
    switch (menuVariant) {
      case 1:
        if (imageBuffer) {
          await sock.sendMessage(m.chat, {
            image: fs.readFileSync(config.assets["ourin"]),
            caption: ``,
            footer: `Hola @${m.pushName} 👋
            
🌿 Bienvenido al asistente ${config.bot?.name}

╭┈┈⫹⫺ *INFORMACIÓN DEL BOT* ⫹⫺┈┈╮
│ ◈ *Nombre Bot* : *${config.bot?.name}*
│ ◈ *Versión* : *${config.bot.version}*  
│ ◈ *Desarrollador* : *${config.bot.developer}*  
│ ◈ *Librería* : \`ourin-baileys\`
╰┈┈┈┈┈┈┈┈

╭┈┈⫹⫺ *INFORMACIÓN DEL USUARIO* ⫹⫺┈┈╮
│ ◈ *Nombre* : *${m.pushName}*
│ ◈ *¿Miembro?* : *${m?.isOwner ? "No, pero Owner" : m?.isPremium ? "No, pero Premium" : "Sí"}*
│ ◈ *Nivel* : *${user.level || 0}*
│ ◈ *Exp* : *${user.exp || 0}* 
│ ◈ *Energía* : *${user.energi || 0}*
│ ◈ *Belly* : *${user.koin || 0}*
│ ◈ *Registro* : *${user.isRegistered ? "Sí" : "No"}*
│ ◈ *Energía* : *${user.energi || 0}*
╰┈┈┈┈┈┈┈┈

Presiona el botón de abajo para más información y para elegir categoría
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
                  title: "Más información",
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
                          title: "🥰 ¿Quieres ser igual que este bot?",
                          description: "Toca y envía, el bot te enviará un link de descarga",
                          id: `${m.prefix}sc`
                        },
                        {
                          title: "🌾 ¿Quién es el dueño de este bot?",
                          description: "Toca y envía para continuar",
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
          s += `╭─☰ ${toMonoUpperBold(cat)}\n`
          cmds.map((cmd) => {
            s += `> ${m.prefix}${cmd}\n`
          })
          s += "╰─⬣\n\n"
        });
        const media = await prepareWAMessageMedia({
          image: fs.readFileSync(config.assets["ourin"])
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
                    text: `🥞 *Hola Hermano*

Bienvenido a ${config.bot?.name}, nuestro bot te ayudará

🍅 *INFORMACIÓN DEL BOT*
> 🤖 *Nombre*: ${config.bot?.name}
> ⚙️ *Versión*: ${config.bot?.version}
> 👨‍💻 *Desarrollador*: ${config.bot?.developer}
> 🧩 *Librería*: \`ourin-baileys\`

🍅 *INFORMACIÓN DEL USUARIO*
> 🧑 *Nombre*: ${m.pushName}
> 🥐 *Rol*: ${m?.isOwner ? "🔥 Owner" : m?.isPremium ? "👑 Premium" : "😊 Usuario"}
> 🧀 *Nivel*: ${user.level || 0}
> 🍗 *Exp*: ${user.exp || 0}
> 🥩 *Energía*: ${user.energi || 0}
> 🎏 *Belly*: ${user.koin || 0}
> 🍬 *Registro*: ${user.isRegistered ? "Sí" : "No"}

${readmore}${s}`
                  },
                  footer: {
                    text: "Selecciona el botón de abajo para más información"
                  },
                  contextInfo: {
                    isForwarded: true,
                    forwardingScore: 9,
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
                        list_title: "Selecciona el menú que desees",
                        button_title: "🍅 Más información",
                      },
                      tap_target_configuration: {
                        title: " X ",
                        description: "bomboclard",
                        canonical_url: "https://ourin.site",
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
                buttonId: `${m.prefix}allmenu`,
                buttonText: {
                  displayText: '💐 Allmenu',
                },
                type: 1,
              },
            ],
            locationMessage: {
              jpegThumbnail: await sharp(fs.readFileSync(config.assets["ourin"])).resize(300, 170).toBuffer(),
              name: config.bot.name,
              address: `Versión actual: ${config.bot.version}`
            },
            contentText: `🥞 *Hola Hermano*

Bienvenido a ${config.bot?.name}, nuestro bot te ayudará

🍅 *INFORMACIÓN DEL BOT*
> 🤖 *Nombre*: ${config.bot?.name}
> ⚙️ *Versión*: ${config.bot?.version}
> 👨‍💻 *Desarrollador*: ${config.bot?.developer}
> 🧩 *Librería*: \`ourin-baileys\`

🍅 *INFORMACIÓN DEL USUARIO*
> 🧑 *Nombre*: ${m.pushName}
> 🥐 *Rol*: ${m?.isOwner ? "🔥 Owner" : m?.isPremium ? "👑 Premium" : "😊 Usuario"}
> 🧀 *Nivel*: ${user.level || 0}
> 🍗 *Exp*: ${user.exp || 0}
> 🥩 *Energía*: ${user.energi || 0}
> 🎏 *Belly*: ${user.koin || 0}
> 🍬 *Registro*: ${user.isRegistered ? "Sí" : "No"}`,
            footerText: '🍔 Selecciona uno de los botones de abajo',
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
        const thumbnail = await sharp(fs.readFileSync(config.assets["ourin"])).resize(300, 300).toBuffer()
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
          video: fs.readFileSync(config.assets["ourin-mp4"]),
          gifPlayback: true
        }, { upload: sock.waUploadToServer });
        let singlePush = categories.sorted.map(cat => {
          return {
            name: "single_select",
            buttonParamsJson: JSON.stringify({
                title: `${cat.emoji} Menú ${cat.cat}`,
                sections: [
                  {
                    title: "Selecciona el comando",
                    highlight_label: config.bot.name,
                    rows: cat.cmds.map((cmd, i) => {
                      return {
                        title: (i + 1).toString() + " " + cmd,
                        description: "¿Seleccionar este comando?",
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
                  text: `Selecciona el botón de abajo`
                },
                body: {
                  text: `*${greeting} ${m.pushName}*, Mi nombre es ${config.bot.name}.

  🏔 Puedo ayudarte con varias cosas dentro de WhatsApp. Y estoy armado con un programa *JavaScript* ensamblado por mi creador.

\`INFORMACIÓN DEL BOT\`
> 🍛 *Creador*: ${config.bot?.developer}
> 🥞 *Nombre*: ${config.bot?.name}
> 🥩 *Versión*: ${config.bot?.version}
> 🍂 *Tipo*: \`Plugin x Cases\`
> 🦴 *Modo*: *${config.mode === 'public' ? '🍕 Desbloqueado para todos' : '🥖 Solo para el Owner'}*

Disfruta tu uso, hermano.`
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
                      button_title: "🍙 Ver Categoría",
                    },
                    tap_target_configuration: {
                      title: " X ",
                      description: "bomboclard",
                      canonical_url: "https://ourin.site",
                      domain: "shop.example.com",
                      button_index: 0,
                    },
                  }),
                  buttons: [
                    {
                      name: "cta_url",
                      buttonParamsJson: JSON.stringify({
                        display_text: "🧀 Visita a mi Creador",
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

          return `${d} Horas ${m} Minutos ${s} Segundos`;
        }

        const weatherCode = {
          0: "☀️ Despejado",
          1: "🌤️ Despejado con nubes",
          2: "⛅ Nublado",
          3: "☁️ Cielo cubierto",
          45: "🌫️ Neblinoso",
          48: "🌫️ Niebla espesa",
          51: "🌦️ Lluvia ligera",
          61: "🌧️ Lluvia",
          63: "🌧️ Lluvia fuerte",
          65: "⛈️ Tormenta",
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
        const thumbnail = await sharp(fs.readFileSync(config.assets["ourin"])).resize(300, 300).toBuffer()
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
          video: fs.readFileSync(config.assets["ourin-mp4"]),
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
                  text: `Selecciona el botón de abajo`
                },
                body: {
                  text: `🍟 Hola *${m.pushName}* 
                  
_Soy un sistema automatizado (bot de WhatsApp) que puede ayudarte a buscar y obtener datos/información solo a través de WhatsApp._

*\`乂 I N F O - B O T\`*
┌ ◦ Nombre : ${config.bot.name}
│ ◦ Autor : @${config.bot.developer}
│ ◦ Tipo Script : Case x Plugins
│ ◦ Uptime : ${runtime(process.uptime())}
└ ◦ Versión : ${config.bot.version}

*\`乂 I N F O - U S U A R I O\`*
┌ ◦ Nombre : ${m.pushName}
│ ◦ Estado : ${m.isPremium ? "💎 Premium" : m.isOwner ? "👑 Owner" : "🏷️ Gratis"}
│ ◦ Modo : ${config.mode === "public" ? "Disponible para todos" : "Solo Owner :b"}
│ ◦ Número : @${m.sender.split("@")[0]}
└ ◦ ${greeting}
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
                      button_title: "🍙 Ver Categoría",
                    },
                    tap_target_configuration: {
                      title: " X ",
                      description: "bomboclard",
                      canonical_url: "https://ourin.site",
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
                        display_text: "𐔌 Allmenu  𐦯",
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

          return `${d} Horas ${m} Minutos ${s} Segundos`;
        }

        const weatherCode = {
          0: "☀️ Despejado",
          1: "🌤️ Despejado con nubes",
          2: "⛅ Nublado",
          3: "☁️ Cielo cubierto",
          45: "🌫️ Neblinoso",
          48: "🌫️ Niebla espesa",
          51: "🌦️ Lluvia ligera",
          61: "🌧️ Lluvia",
          63: "🌧️ Lluvia fuerte",
          65: "⛈️ Tormenta",
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

        let topCmdText = "\n ✦ History ✦\n"
        if (commandStats.length > 0) {
          topCmdText += `╭   • ${m.prefix}${commandStats[0].name} (${commandStats[0].count}x)\n`
          for (let i = 1; i < commandStats.length; i++) {
            topCmdText += `┆   • ${m.prefix}${commandStats[i].name} (${commandStats[i].count}x)\n`
          }
          topCmdText += `╰➤------------------------------\n`
        } else {
          topCmdText += `╭   • Aún no hay comandos\n╰➤------------------------------\n`
        }

        const thumbnail = await sharp(fs.readFileSync(config.assets["ourin"])).resize(300, 300).toBuffer()
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
                    name: config.bot?.name || "Luffy-AI",
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
                      button_title: "🍙 Ver Categoría",
                    },
                    tap_target_configuration: {
                      title: " X ",
                      description: "bomboclard",
                      canonical_url: "https://ourin.site",
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
                        display_text: "𐔌 Allmenu  𐦯",
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
          if (h > 0) return `${h} horas`;
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

        let case7Text = `Hey, *${m.pushName}*! ✨

I'm ${botName}, your intelligent assistant powered by ${config.bot?.developer}. Whether you need information, entertainment, or utilities, I'm always ready to help.

`

        case7Text += `╭╮ \`✯ ${toMathSansBold("BOT DETAIL")}\`\n`;
        case7Text += `││  name : ${botName}\n`;
        case7Text += `││  mode : ${botModeLower}\n`;
        case7Text += `││  prefix : \`${botPrefix}\`\n`;
        case7Text += `││  runtime : ${runTime}\n`;
        case7Text += `╰╯\n`;

        case7Text += `╭╮ \`❀ ${toMathSansBold("USER DETAIL")}\`\n`;
        case7Text += `││  name : _${userName}_\n`;
        case7Text += `││  status : ${userStatus}\n`;
        case7Text += `││  role : ${userRole}\n`;
        case7Text += `││  energi : ${userLimit}\n`;
        case7Text += `╰╯\n`;

        const readmore = String.fromCharCode(8206).repeat(4001);
        case7Text += readmore + "";
        case7Text += `╭╮ \`✧ ${toMathSansBold("MENU CATEGORY")}\`\n`;
        const { sorted } = getSortedCategories(m, botMode);
        for (const cat of sorted) {
          case7Text += `││  ▸ ${cat.cat.toLowerCase()} : ${cat.cmds.length} funciones\n`;
        }
        case7Text += `╰╯`;


        const { getAssetBuffer } = await import("../../src/lib/ourin-asset-manager.js");
        const imageBuffer = await getAssetBuffer("ourin2");
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
          image: await getAssetBuffer("ourin")
        }, { upload: sock.waUploadToServer });

        const videoLive = await prepareWAMessageMedia({
          video: await getAssetBuffer("ourin-mp4")
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
                footer: { text: `Uso: ${m?.prefix}menucat <categoría>\n\nSi tienes alguna pregunta, contacta al owner.` },
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
                        display_text: "🥐 Contactar Owner",
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
      case 10: {
        const readmore = String.fromCharCode(8206).repeat(4001);
        let bannerBuffer = null;
        try {
          const bannerPath = path.join(process.cwd(), "assets", "banner.jpg");
          if (fs.existsSync(bannerPath)) bannerBuffer = fs.readFileSync(bannerPath);
        } catch {}
        if (!bannerBuffer) bannerBuffer = imageBuffer;

        const catCount = categories.sorted.length;
        const userBelly = user.koin || 0;
        const userExp = user.exp || 0;
        const userLevel = user.level || 0;
        const userEnergi = user.energi || 0;
        const isReg = user.isRegistered;
        const isRpg = Boolean(user.rpg);
        const roleName = m.isOwner ? "👑 Owner" : m.isPremium ? "💎 Premium" : "🏴‍☠️ Pirata";

        const fullText = `${greeting} *${m.pushName || "User"}* 🏴‍☠️

Soy *${config.bot?.name || "Luffy-AI"}*, tu asistente. Estoy aquí para lo que necesites 🤙

${readmore}👤 *TU INFO*
> 📛 ${m.pushName || "User"} — ${roleName}
> 📋 Registrado: ${isReg ? "✅" : "❌"} · RPG: ${isRpg ? "⚔️ Sí" : "❌ No"}
> ⭐ Nv.${userLevel} · 💫 ${userExp.toLocaleString()} EXP
> ⚡ ${userEnergi} energía · 💰 ${userBelly.toLocaleString()} Belly

🤖 *BOT INFO*
> 📛 ${config.bot?.name || "Luffy-AI"} · v${config.bot?.version || "1.0"}
> 👨‍💻 ${config.bot?.developer || "Owner"}
> 📦 ${totalCmds} comandos · 📂 ${catCount} categorías
> ⏱️ ${uptimeFormatted}`;

        const media = await prepareWAMessageMedia({
          image: bannerBuffer
        }, { upload: sock.waUploadToServer });

        await sock.relayMessage(m.chat, {
          viewOnceMessage: {
            message: {
              messageContextInfo: {},
              interactiveMessage: {
                header: {
                  title: `🏴‍☠️ ${config.bot?.name || "Luffy-AI"}`,
                  subtitle: `${greeting}`,
                  hasMediaAttachment: true,
                  imageMessage: media.imageMessage
                },
                body: {
                  text: fullText
                },
                footer: {
                  text: "Toca el botón de abajo 👇"
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
                  messageParamsJson: JSON.stringify({}),
                  buttons: [
                    {
                      name: "quick_reply",
                      buttonParamsJson: JSON.stringify({
                        display_text: "📋 All Menu",
                        id: `${m.prefix}allmenu`
                      })
                    }
                  ]
                }
              }
            }
          }
        }, { quoted: m, userJid: sock.user.jid });

        break;
      }
      default:
        await m.reply(text);
    }
    const audioEnabled = db.setting("audioMenu") !== false;
    if (audioEnabled) {
      const audioUrl = botConfig.assets["ourin-mp3"];
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
                audio: fs.readFileSync(config.assets["ourin-mp3"]),
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
                conversation: "Pon la música hermano"
              }
            };
            await sock.sendMessage(m.chat, {
              audio: fs.readFileSync(config.assets["ourin-mp3"]),
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
                  orderTitle: `📋 ${totalCmds} Commands`,
                  sellerJid: botConfig.botNumber
                    ? `${botConfig.botNumber}@s.whatsapp.net`
                    : m.sender,
                  token: "ourin-menu-v8",
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
                  audio: fs.readFileSync(config.assets["ourin-mp3"]),
                  mimetype: "audio/mpeg",
                },
                { quoted: ftroliQuoted },
              );
            } catch (ffmpegErr) {
              await sock.sendMessage(
                m.chat,
                {
                  audio: fs.readFileSync(config.assets["ourin-mp3"]),
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
