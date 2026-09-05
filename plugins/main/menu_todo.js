import * as botmodePlugin from "../group/botmode.js";
import { generateWAMessageFromContent, prepareWAMessageMedia, proto } from "ourin";
import _sharp from "sharp";
import config from "../../config.js";
import axios from "axios";
import {
  getTimeGreeting,
} from "../../src/lib/luffy-formatter.js";
import * as timeHelper from "../../src/lib/luffy-time.js";
import fs from "fs"
import {
  getCommandsByCategory,
  getCategories,
  getPluginCount,
  getPlugin,
  getPluginsByCategory,
} from "../../src/lib/luffy-plugins.js";
import { getCasesByCategory, getCaseCount } from "../../case/luffy.js";
import { GOTHIC, toFancy, divider, gothicCenter, headerBlock } from "../../src/lib/luffy-gothic.js";
const pluginConfig = {
  name: "menu_todo",
  alias: ["allmenu", "fullmenu", "allcommand", "todo", "menucompleto"],
  category: "main",
  description: "Mostrar todos los comandos completos por categoría",
  usage: ".allmenu",
  example: ".allmenu",
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
  fun: "🎮",
  group: "👥",
  download: "📥",
  search: "🔍",
  tools: "🛠️",
  sticker: "🖼️",
  ai: "🤖",
  game: "🎯",
  game: "🕹️",
  media: "🎬",
  info: "ℹ️",
  user: "📊",
  random: "🎲",
  canvas: "🎨",
  store: "🏪",
  premium: "💎",
  convert: "🔄",
  economy: "💰",
  cek: "📋",
  ephoto: "🎨",
  jpm: "📢",
};

function createBracketBox(emoji, title, lines = []) {
  let text = `╔══「 ${emoji} ${title} 」══╗\n`;
  for (const line of lines) {
    text += `║ ▸ ${line}\n`;
  }
  text += `╚═══════════════╝\n\n`;
  return text;
}
function getCommandSymbols(cmdName) {
  const plugin = getPlugin(cmdName);
  if (!plugin || !plugin.config) return "";
  const symbols = [];
  if (plugin.config.isOwner) symbols.push("🅞");
  if (plugin.config.isPremium) symbols.push("🅟");
  if (plugin.config.limit && plugin.config.limit > 0) symbols.push("🅛");
  if (plugin.config.isAdmin) symbols.push("🅐");
  if (plugin.config.isGroup) symbols.push("🅖");
  if (plugin.config.isPrivate) symbols.push("🅟🅡");
  return symbols.length > 0 ? " " + symbols.join(" ") : "";
}
function getContextInfo(botConfig, m, thumbBuffer) {
  const saluranId = botConfig.saluran?.canalId || "120363400911374213@newsletter";
  const saluranName =
    botConfig.saluran?.name || botConfig.bot?.name || "Luffy-Ai";
  const saluranLink = botConfig.saluran?.canalLink || "";
  return {
    mentionedJid: [m.sender],
    forwardingScore: 9999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: saluranId,
      newsletterName: saluranName,
      serverMessageId: 127,
    },
  };
}
async function handler(m, { sock, config: botConfig, db, uptime }) {
  const prefix = botConfig.command?.prefix || ".";
  const user = db.getUser(m.sender);
  const groupData = m.isGroup ? db.getGroup(m.chat) || {} : {};
  const botMode = groupData.botMode || "md";
  const categories = getCategories();
  const commandsByCategory = getCommandsByCategory();
  const casesByCategory = getCasesByCategory();
  let totalCommands = 0;
  for (const category of categories) {
    totalCommands += (commandsByCategory[category] || []).length;
  }
  const totalCases = getCaseCount();
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
  let txt = ``;

  const weatherCodeMap = {
    0: "☀️ Despejado", 1: "🌤️ Parcialmente nublado", 2: "⛅ Nublado", 3: "☁️ Cubierto", 45: "🌫️ Niebla", 48: "🌫️ Niebla densa", 51: "🌦️ Llovizna", 61: "🌧️ Lluvia ligera", 63: "🌧️ Lluvia", 65: "⛈️ Lluvia intensa", 80: "🌦️ Lluvia local", 95: "⛈️ Tormenta eléctrica"
  };

  let weatherText = "Merangin Parcialmente nublado 22°C ☀️";
  try {
    const geo = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=Merangin&count=1`);
    const loc = geo.data.results?.[0];
    if (loc) {
      const res = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,weather_code`);
      const current = res.data.current;
      const kondisi = weatherCodeMap[current.weather_code] || "Parcialmente nublado";
      weatherText = `Merangin ${kondisi} ${Math.round(current.temperature_2m)}°C`;
    }
  } catch (e) { }

  const userLimit = (m.isPremium || m.isOwner) ? "∞ Unlimited" : (user?.limit || 0);
  const botName = botConfig.bot?.name || "Remi AI";
  const devName = botConfig.bot?.developer || "Ell";
  const botVersion = botConfig.bot?.version || "11.0.0";
  const pushName = m.pushName || "User";
  const timeNow = new Date().toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta' }).replace(/\./g, ':');

  txt += `╔═══════════════════╗\n`;
  txt += `║  🏴‍☠️ *MENÚ COMPLETO* 🏴‍☠️\n`;
  txt += `╚═══════════════════╝\n\n`;
  txt += `╔══「 👑 𝗜𝗡𝗙𝗢 𝗨𝗦𝗨𝗔𝗥𝗜𝗢 」\n`;
  txt += `║ ▸ *Nombre* : ${pushName}\n`;
  txt += `║ ▸ *Estado* : ${userRole}\n`;
  txt += `║ ▸ *Límite* : ${userLimit}\n`;
  txt += `╚═══════════════════╝\n\n`;
  txt += `╔══「 🤖 𝗜𝗡𝗙𝗢 𝗕𝗢𝗧 」\n`;
  txt += `║ ▸ *Nombre* : ${botName}\n`;
  txt += `║ ▸ *Funciones* : ${totalFeatures} funciones\n`;
  txt += `║ ▸ *Versión* : ${botVersion}\n`;
  txt += `║ ▸ *Hora* : ${timeNow} (hora local)\n`;
  txt += `╚═══════════════════╝\n\n`;
  txt += `╔══「 ⚡ 𝗩𝗘𝗡𝗧𝗔𝗝𝗔𝗦 」\n`;
  txt += `║ ▸ Respuesta rápida 🚀\n`;
  txt += `║ ▸ Sistema estable 🛡️\n`;
  txt += `║ ▸ Multifunción 🧩\n`;
  txt += `║ ▸ Fácil de usar ✨\n`;
  txt += `╚═══════════════════╝\n\n`;
  txt += `⚓ Elige un menú a continuación.\n`;
  txt += `Úsalo según tus necesidades y con responsabilidad.\n\n`;
  const categoryOrder = [
    "owner",
    "main",
    "utility",
    "tools",
    "fun",
    "game",
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
    "premium"
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
    const allCmds = [...pluginCmds, ...caseCmds];
    if (allCmds.length === 0) continue;
    const emoji = CATEGORY_EMOJIS[category] || "📋";
    const categoryName = category.toUpperCase();
    const commandLines = allCmds.map((cmd) => {
      return `${prefix}${cmd}`;
    });
    txt += createBracketBox(emoji, categoryName, commandLines);
  }
  const savedVariant = db.setting("allmenuVariant");
  const allmenuVariant = savedVariant || botConfig.ui?.allmenuVariant || 2;
  try {
    switch (allmenuVariant) {
      case 1:
        await m.reply(txt);
        break;
      case 2:
        const media = await prepareWAMessageMedia({
          image: fs.readFileSync(config.assets["luffy"])
        }, { upload: sock.waUploadToServer })
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
                    text: `╔═══════════════════╗\n║  🏴‍☠️ *¡HOLA, ${(pushName || "USER").toUpperCase()}!* 🏴‍☠️\n╚═══════════════════╝\n\n⚓ Soy *${botName}*, creado por *${devName}*. Listo para ayudarte: descargar videos, jugar, hacer preguntas, buscar información, crear stickers y mucho más.\n\n`,
                  },
                  footer: {
                    text: txt
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
                    }),
                    buttons: [
                      {
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                          display_text: "🍅 Volver al Menú Principal",
                          id: m.prefix + "menu"
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
          0: "☀️ Despejado", 1: "🌤️ Parcialmente nublado", 2: "⛅ Nublado", 3: "☁️ Cubierto", 45: "🌫️ Niebla", 48: "🌫️ Niebla densa", 51: "🌦️ Llovizna", 61: "🌧️ Lluvia ligera", 63: "🌧️ Lluvia", 65: "⛈️ Lluvia intensa", 80: "🌦️ Lluvia local", 95: "⛈️ Tormenta eléctrica"
        }

        async function weatherMenu(city = "Jakarta") {
          try {
            const geo = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`)
            const loc = geo.data.results?.[0]
            if (!loc) return "Clima no disponible"
            const res = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,weather_code`)
            const current = res.data.current
            const kondisi = weatherCode[current.weather_code] || "🌍 Desconocido"
            return `${kondisi} | 🌡️ ${Math.round(current.temperature_2m)}°C\n📍 ${loc.name}`
          } catch {
            return "Clima no disponible"
          }
        }

        const thumbnail = await _sharp(fs.readFileSync(config.assets["luffy"])).resize(300, 300).toBuffer()
        const qOrder = {
          key: { fromMe: false, participant: '0@s.whatsapp.net', remoteJid: m.sender },
          message: { locationMessage: { degreesLatitude: 0, degreesLongitude: 0, name: await weatherMenu(), jpegThumbnail: thumbnail } }
        }
        const media4 = await prepareWAMessageMedia({ video: fs.readFileSync(config.assets["luffy-mp4"]), gifPlayback: true }, { upload: sock.waUploadToServer });
        const msg4 = generateWAMessageFromContent(m.chat, {
          viewOnceMessage: {
            message: {
              messageContextInfo: {},
              interactiveMessage: {
                header: { title: "", subtitle: "", hasMediaAttachment: true, videoMessage: media4.videoMessage },
                footer: { text: `Selecciona uno de los botones de abajo` },
                body: { text: txt },
                contextInfo: {
                  mentionedJid: [m.sender],
                  isForwarded: true,
                  forwardingScore: 9,
                  forwardedNewsletterMessageInfo: {
                    newsletterJid: config.saluran?.canalId || "120363400911374213@newsletter",
                    newsletterName: config.saluran?.name || config.bot?.name || "Luffy-Ai",
                    serverMessageId: 127,
                  },
                },
                nativeFlowMessage: {
                  messageParamsJson: JSON.stringify({
                    limited_time_offer: { text: `${greeting}`, url: "Hai", expiration_time: Date.now() + 10000 },
                    bottom_sheet: { in_thread_buttons_limit: 2, divider_indices: [1, 2, 3, 4, 5, 999], list_title: "Selecciona el menú", button_title: "🍙 Ver categoría" },
                    tap_target_configuration: { title: " X ", description: "bomboclard", canonical_url: "https://https://example.com", domain: "shop.example.com", button_index: 0 },
                  }),
                  buttons: [
                    { name: "", buttonParamsJson: "" },
                    {
                      name: "quick_reply",
                      buttonParamsJson: JSON.stringify({ display_text: "📂 Volver a la Lista de Categorías", id: m.prefix + "menu_categoria" })
                    },
                    {
                      name: "quick_reply",
                      buttonParamsJson: JSON.stringify({ display_text: "🍅 Volver al Menú Principal", id: m.prefix + "menu" })
                    },
                  ]
                }
              }
            }
          }
        }, { quoted: qOrder, userJid: sock.user.jid });

        await sock.relayMessage(m.chat, msg4.message, { messageId: msg4.key.id });
        break;
      }
      case 6: {
        const weatherCode = {
          0: "☀️ Despejado", 1: "🌤️ Parcialmente nublado", 2: "⛅ Nublado", 3: "☁️ Cubierto", 45: "🌫️ Niebla", 48: "🌫️ Niebla densa", 51: "🌦️ Llovizna", 61: "🌧️ Lluvia ligera", 63: "🌧️ Lluvia", 65: "⛈️ Lluvia intensa", 80: "🌦️ Lluvia local", 95: "⛈️ Tormenta eléctrica"
        }

        async function weatherMenu(city = "Jakarta") {
          try {
            const geo = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`)
            const loc = geo.data.results?.[0]
            if (!loc) return "Clima no disponible"
            const res = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,weather_code`)
            const current = res.data.current
            const kondisi = weatherCode[current.weather_code] || "🌍 Desconocido"
            return `${kondisi} | 🌡️ ${Math.round(current.temperature_2m)}°C\n📍 ${loc.name}`
          } catch {
            return "Clima no disponible"
          }
        }

        const thumbnail = await _sharp(fs.readFileSync(config.assets["luffy"])).resize(300, 300).toBuffer()

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
                  text: txt,
                },
                contextInfo: {
                  mentionedJid: [m.sender],
                  isForwarded: true,
                  forwardingScore: 9,
                  forwardedNewsletterMessageInfo: {
                    newsletterJid: config.saluran?.canalId || "120363400911374213@newsletter",
                    newsletterName: config.saluran?.name || config.bot?.name || "Luffy-Ai",
                    serverMessageId: 127,
                  },
                },
                nativeFlowMessage: {
                  buttons: []
                }
              }
            }
          }
        }, { quoted: m, userJid: sock.user.jid });

        await sock.relayMessage(m.chat, msg6.message, { messageId: msg6.key.id });
        break;
      }
      case 9: {
        const gUser = db.getUser(m.sender) || {};
        const ownerName = botConfig.getOwnerName
          ? botConfig.getOwnerName(m.sender)
          : botConfig.owner?.name || "Sebas";
        const userName = gUser.regName || m.pushName || "User";
        const parsedTime = timeHelper.formatTime("HH:mm");

        let g = ``;
        g += headerBlock(toFancy(botName));
        g += `${GOTHIC.DIV}\n\n`;

        g += `♱ ${greeting}, *${userName}* ${GOTHIC.SPIDER}\n`;
        g += `♱ Servido con honor por *${ownerName}* ${GOTHIC.TWIN}\n`;
        g += `${GOTHIC.DIV}\n`;

        g += `☽ ♰ *${toFancy("TUS DATOS")}* ♰ ☾\n`;
        g += `┏━━━━━━━━━━━━━━━━┓\n`;
        g += `┃ 👑 Rango    : ${m.isOwner ? "Owner" : m.isPremium ? "Premium" : "Alma"}\n`;
        g += `┃ 🪽 Nombre   : ${gUser.regName || pushName}\n`;
        g += `┃ 🕯️ Edad     : ${gUser.regAge ?? "—"}\n`;
        g += `┃ 🫀 Registro : ${gUser.isRegistered ? "✅ Sí" : "❌ No"}\n`;
        g += `┃ ⛧ Limite   : ${userLimit}\n`;
        g += `┗━━━━━━━━━━━━━━━━┛\n\n`;

        g += `☽ ♰ *${toFancy("INFO BOT")}* ♰ ☾\n`;
        g += `┏━━━━━━━━━━━━━━━━┓\n`;
        g += `┃ ♰ Nombre   : ${botName}\n`;
        g += `┃ ♰ Funciones: ${totalFeatures} funciones\n`;
        g += `┃ ♰ Versión  : ${botVersion}\n`;
        g += `┃ ♰ Hora     : ${parsedTime}\n`;
        g += `┗━━━━━━━━━━━━━━━━┛\n\n`;
        g += divider(GOTHIC.DIV3);

        g += `☽ ♰ *${toFancy("ORDEN DEL MENÚ")}* ♰ ☾\n`;
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
          const allCmds = [...pluginCmds, ...caseCmds];
          if (allCmds.length === 0) continue;
          g += `┏━ ♰─【*${toFancy(category.toUpperCase())}*】─♰ ━┓  (${allCmds.length})\n`;
          for (const cmd of allCmds) {
            g += `┃  ♰➤ ${prefix}${cmd}\n`;
          }
          g += `┗━ ♰ ${GOTHIC.NIGHT} ♰ ━┛\n\n`;
        }
        g += divider(GOTHIC.DIV3);

        const bg = config.global || {};
        g += `☽ ♰ *${toFancy("MARCA")}* ♰ ☾\n`;
        g += `┏━━━━━━━━━━━━━━━━┓\n`;
        g += `┃ 👑 Autor    : ${bg.author}\n`;
        g += `┃ 🪽 Dev      : ${bg.dev}\n`;
        g += `┃ 🕯️ Titulo   : ${bg.titulowm}\n`;
        g += `┃ 🦇 Slogan   : ${bg.titulowm2}\n`;
        g += `┃ ⛧ Canal    : ${config.saluran?.canalLink || bg.namechannel}\n`;
        g += `┃ ✦ Version  : ${bg.vs}\n`;
        g += `┗━━━━━━━━━━━━━━━━┛\n\n`;

        g += `${gothicCenter(GOTHIC.MOON, 32)}\n`;
        g += `${gothicCenter(`     ${GOTHIC.CROSS}`, 32)}\n`;
        g += `${gothicCenter(`     ${GOTHIC.BAN}`, 32)}`;

        try {
          await sock.sendMessage(
            m.chat,
            {
              image: fs.readFileSync(config.assets["luffy"]),
              caption: g,
            },
            { quoted: m },
          );
        } catch (err) {
          await m.reply(g);
        }
        break;
      }
      default:
        break
    }
    const audioEnabled = db.setting("audioMenu") !== false;
    if (audioEnabled) {
      const audioUrl = botConfig.assets["luffy-mp3"];
      const audioVariant = db.setting("allmenuAudioStyle") || 1;
      try {
        const fs = (await import("fs")).default;
        const path = (await import("path")).default;
        const axios = (await import("axios")).default;

        switch (audioVariant) {
          case 1:
            try {
              const oggPath = await (async () => {
                const tempDir = path.join(process.cwd(), "temp");
                if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
                const destPath = path.join(tempDir, "allmenu_audio_opus.ogg");
                if (fs.existsSync(destPath)) return destPath;
                const mp3Path = path.join(tempDir, "allmenu_audio.mp3");
                const res = await axios.get(audioUrl, { responseType: "arraybuffer" });
                fs.writeFileSync(mp3Path, Buffer.from(res.data));
                const { spawn } = await import("child_process");
                return new Promise((resolve, reject) => {
                  const ffmpeg = spawn("ffmpeg", ["-y", "-i", mp3Path, "-c:a", "libopus", "-b:a", "48k", "-vbr", "on", destPath]);
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
                const destPath = path.join(tempDir, "allmenu_audio_opus.ogg");
                if (fs.existsSync(destPath)) return destPath;
                const mp3Path = path.join(tempDir, "allmenu_audio.mp3");
                const res = await axios.get(audioUrl, { responseType: "arraybuffer" });
                fs.writeFileSync(mp3Path, Buffer.from(res.data));
                const { spawn } = await import("child_process");
                return new Promise((resolve, reject) => {
                  const ffmpeg = spawn("ffmpeg", ["-y", "-i", mp3Path, "-c:a", "libopus", "-b:a", "48k", "-vbr", "on", destPath]);
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
                audio: { url: audioUrl },
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
          default: {
            try {
              await sock.sendMessage(
                m.chat,
                {
                  audio: fs.readFileSync(config.assets["luffy-mp3"]),
                  mimetype: "audio/mpeg",
                },
                { quoted: m },
              );
            } catch (ffmpegErr) {
              console.error("[AllMenu] Audio fallback error:", ffmpegErr.message);
            }
            break;
          }
        }
      } catch (e) {
        console.error("[AllMenu] Error sending dynamic audio:", e.message);
      }
    }
  } catch (error) {
    console.error("[AllMenu] Error:", error.message);
    await m.reply(txt);
  }
}
export { pluginConfig as config, handler };
