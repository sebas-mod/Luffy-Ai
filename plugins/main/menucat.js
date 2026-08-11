import * as botmodePlugin from "../group/botmode.js";
import { getCasesByCategory } from "../../case/luffy.js";
import { prepareWAMessageMedia, generateWAMessageFromContent } from "ourin";
import config from "../../config.js";
import axios from "axios";
import sharp from "sharp";
import {
  getCommandsByCategory,
  getCategories,
  getPlugin,
} from "../../src/lib/luffy-plugins.js";
import { getDatabase } from "../../src/lib/luffy-database.js";
import { getTimeGreeting } from "../../src/lib/luffy-formatter.js";
import fs from "fs"

const pluginConfig = {
  name: "menucat",
  alias: ["mc", "category", "cat"],
  category: "main",
  description: "Mostrar los comandos de una categoría específica",
  usage: ".menucat <kategori>",
  example: ".menucat tools",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
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
  media: "🎬",
  info: "ℹ️",
  user: "📊",
  jpm: "📢",
  ephoto: "🎨",
  store: "🛒",
  linode: "☁️",
  random: "🎲",
  canvas: "🎨",
  vps: "🌊",
  premium: "💎",
  convert: "🔄",
  economy: "💰",
  cek: "📋"
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

function createBracketBox(emoji, title, lines = []) {
  let text = `╭─〔 ${emoji} \`${title}\`\n`;
  for (const line of lines) {
    text += `┃ *${toSmallCaps(line)}*\n`;
  }
  text += `╰─⬣\n\n`;
  return text;
}

function getCommandSymbols(cmdName) {
  const plugin = getPlugin(cmdName);
  if (!plugin || !plugin.config) return "";
  const symbols = [];
  if (plugin.config.isOwner) symbols.push("Ⓞ");
  if (plugin.config.isPremium) symbols.push("ⓟ");
  if (plugin.config.limit && plugin.config.limit > 0) symbols.push("Ⓛ");
  if (plugin.config.isAdmin) symbols.push("Ⓐ");
  if (plugin.config.isGroup) symbols.push("Ⓖ");
  if (plugin.config.isPrivate) symbols.push("Ⓟ");
  return symbols.length > 0 ? " " + symbols.join(" ") : "";
}

async function handler(m, { sock, db }) {
  const prefix = config.command?.prefix || ".";
  const args = m.args || [];
  const categoryArg = args[0]?.toLowerCase();
  const categories = getCategories();
  const commandsByCategory = getCommandsByCategory();
  const casesByCategory = getCasesByCategory();
  const savedVariant = db.setting("menucatVariant");
  const menucatVariant = savedVariant || config.ui?.menucatVariant || 2;
  const greeting = getTimeGreeting();

  if (!categoryArg) {
    const groupData = m.isGroup ? db.getGroup(m.chat) || {} : {};
    const botMode = groupData.botMode || "md";

    let modeExcludeMap = {
      md: ["store"],
      store: ["jpm", "ephoto"],
    };

    try {
      if (botmodePlugin && botmodePlugin.MODES) {
        const modes = botmodePlugin.MODES;
        modeExcludeMap = {};
        for (const [key, val] of Object.entries(modes)) {
          if (val.excludeCategories)
            modeExcludeMap[key] = val.excludeCategories;
        }
      }
    } catch (e) { }

    const excludeCategories = modeExcludeMap[botMode] || modeExcludeMap.md;

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
      "jpm",
      "ephoto",
      "store"
    ];

    const allCats = [
      ...new Set([...categories, ...Object.keys(casesByCategory)]),
    ];

    const sortedCats = allCats.sort((a, b) => {
      const indexA = categoryOrder.indexOf(a);
      const indexB = categoryOrder.indexOf(b);
      return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
    });

    const visibleCats = sortedCats.filter((cat) => {
      if (cat === "owner" && !m.isOwner) return false;
      if (excludeCategories.includes(cat.toLowerCase())) return false;
      const total =
        (commandsByCategory[cat] || []).length +
        (casesByCategory[cat] || []).length;
      return total > 0;
    });

    let txt = ``;
    txt += createBracketBox("🤖", "KETERANGAN", [
      "Ⓞ = Hanya untuk owner",
      "ⓟ = Hanya untuk premium",
      "Ⓛ = Membutuhkan limit",
      "Ⓐ = Hanya untuk admin",
      "Ⓖ = Hanya di dalam grup",
      "Ⓟ = Hanya di private chat",
    ]);

    for (const cat of visibleCats) {
      const pluginCmds = commandsByCategory[cat] || [];
      const caseCmds = casesByCategory[cat] || [];
      const allCmds = [...pluginCmds, ...caseCmds];
      if (allCmds.length === 0) continue;
      const emoji = CATEGORY_EMOJIS[cat] || "📋";
      const categoryName = toSmallCaps(cat);
      const commandLines = allCmds.map((cmd) => {
        const symbols = getCommandSymbols(cmd);
        return `${prefix}${cmd}${symbols}`;
      });
      txt += createBracketBox(emoji, categoryName, commandLines);
    }

    try {
      switch (menucatVariant) {
        case 1:
          await m.reply(txt);
          break;
        case 2: {
          const media = await prepareWAMessageMedia(
            {
              image: fs.readFileSync(config.assets["luffy2"]),
            },
            { upload: sock.waUploadToServer },
          );
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
                      imageMessage: media.imageMessage,
                    },
                    body: {
                      text: txt,
                    },
                    footer: {
                      text: "Elige el botón de abajo para volver al menú principal",
                    },
                    contextInfo: {
                      isForwarded: true,
                      forwardingScore: 9,
                      participant: "0@s.whatsapp.net",
                      quotedMessage: {
                        conversation: `${config.bot?.name}`,
                      },
                      mentionedJid: [`${m.sender}`],
                    },
                    nativeFlowMessage: {
                      messageParamsJson: JSON.stringify({
                        limited_time_offer: {
                          text: `${greeting}`,
                          url: "Hai",
                          copy_code: "Dibuat oleh " + config.bot?.developer,
                          expiration_time: Date.now() + 1000000,
                        },
                      }),
                      buttons: [
                        {
                          name: "quick_reply",
                          buttonParamsJson: JSON.stringify({
                            display_text: "🍅 Kembali Ke Menu Utama",
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
          break;
        }
        case 5: {
          function runtime(seconds) {
            seconds = Number(seconds);
            const d = Math.floor(seconds / (3600 * 24));
            const h = Math.floor(seconds % (3600 * 24) / 3600);
            const m = Math.floor(seconds % 3600 / 60);
            const s = Math.floor(seconds % 60);
            return `${d} Jam ${m} Menit ${s} Detik`;
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

          const thumbnail = await sharp(fs.readFileSync(config.assets["luffy"])).resize(300, 300).toBuffer()
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
                  footer: { text: `Please select the button in below` },
                  body: { text: txt },
                  contextInfo: {
                    mentionedJid: [m.sender],
                    isForwarded: true,
                    forwardingScore: 9,
                    forwardedNewsletterMessageInfo: {
                      newsletterJid: config.saluran?.id || "120363400911374213@newsletter",
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
                        buttonParamsJson: JSON.stringify({ display_text: "🍅 Kembali Ke Menu Utama", id: m.prefix + "menu" })
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
        default:
          await m.reply(txt);
          break;
      }
    } catch (err) {
      await m.reply(txt);
    }
    return;
  }

  const allCategories = [
    ...new Set([...categories, ...Object.keys(casesByCategory)]),
  ];
  const matchedCat = allCategories.find((c) => c.toLowerCase() === categoryArg);

  if (!matchedCat) {
    return m.reply(
      `❌ *Cᴀᴛᴇɢᴏʀíᴀ ɴᴏ ᴇɴᴄᴏɴᴛʀᴀᴅᴀ*\n\n> La categoría \`${categoryArg}\` no existe.\n> Escribe \`${prefix}menucat\` para ver las categorías.`,
    );
  }

  if (matchedCat === "owner" && !m.isOwner) {
    return m.reply(`❌ *ACCESO DENEGADO*\n\n> Esta categoría es solo para el owner.`);
  }

  const pluginCommands = commandsByCategory[matchedCat] || [];
  const caseCommands = casesByCategory[matchedCat] || [];
  const allCommands = [...pluginCommands, ...caseCommands];

  if (allCommands.length === 0) {
    return m.reply(
      `❌ *ᴠᴀᴄíᴏ*\n\n> La categoría \`${matchedCat}\` no tiene comandos.`,
    );
  }

  const emoji = CATEGORY_EMOJIS[matchedCat] || "📁";
  const categoryName = toSmallCaps(matchedCat);
  const commandLines = allCommands.map((cmd) => {
    const symbols = getCommandSymbols(cmd);
    return `${prefix}${cmd}${symbols}`;
  });

  let txt = ``;
  txt += createBracketBox(emoji, categoryName, commandLines);
  txt += `Total: \`${allCommands.length}\` commands`;
  if (caseCommands.length > 0) {
    txt += `\n(${pluginCommands.length} plugin + ${caseCommands.length} case)`;
  }

  try {
    switch (menucatVariant) {
      case 1:
        await m.reply(txt);
        break;
      case 2: {
        const media = await prepareWAMessageMedia(
          {
            image: fs.readFileSync(config.assets["luffy2"]),
          },
          { upload: sock.waUploadToServer },
        );
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
                    imageMessage: media.imageMessage,
                  },
                  body: {
                    text: txt,
                  },
                  footer: {
                    text: "Elige el botón de abajo para volver al menú principal",
                  },
                  contextInfo: {
                    isForwarded: true,
                    forwardingScore: 9,
                    participant: "0@s.whatsapp.net",
                    quotedMessage: {
                      conversation: `${config.bot?.name}`,
                    },
                    mentionedJid: [`${m.sender}`],
                  },
                  nativeFlowMessage: {
                    messageParamsJson: JSON.stringify({
                      limited_time_offer: {
                        text: `${greeting}`,
                        url: "Hai",
                        copy_code: "Dibuat oleh " + config.bot?.developer,
                        expiration_time: Date.now() + 1000000,
                      },
                    }),
                    buttons: [
                      {
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                          display_text: "📂 Kembali Ke Daftar Kategori",
                          id: m.prefix + "menucat",
                        }),
                      },
                      {
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                          display_text: "🍅 Kembali Ke Menu Utama",
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
        break;
      }
      case 5: {
        function runtime(seconds) {
          seconds = Number(seconds);
          const d = Math.floor(seconds / (3600 * 24));
          const h = Math.floor(seconds % (3600 * 24) / 3600);
          const m = Math.floor(seconds % 3600 / 60);
          const s = Math.floor(seconds % 60);
          return `${d} Jam ${m} Menit ${s} Detik`;
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

        const thumbnail = await sharp(fs.readFileSync(config.assets["luffy"])).resize(300, 300).toBuffer()
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
                footer: { text: `Please select the button in below` },
                body: { text: txt },
                contextInfo: {
                  mentionedJid: [m.sender],
                  isForwarded: true,
                  forwardingScore: 9,
                  forwardedNewsletterMessageInfo: {
                    newsletterJid: config.saluran?.id || "120363400911374213@newsletter",
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
                      buttonParamsJson: JSON.stringify({ display_text: "📂 Kembali Ke Daftar Kategori", id: m.prefix + "menucat" })
                    },
                    {
                      name: "quick_reply",
                      buttonParamsJson: JSON.stringify({ display_text: "🍅 Kembali Ke Menu Utama", id: m.prefix + "menu" })
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
                  text: txt,
                },
                contextInfo: {
                  mentionedJid: [m.sender],
                  isForwarded: true,
                  forwardingScore: 9,
                  forwardedNewsletterMessageInfo: {
                    newsletterJid: config.saluran?.id || "120363400911374213@newsletter",
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
      default:
        await m.reply(txt);
        break;
    }
  } catch (err) {
    await m.reply(txt);
  }
}

export { pluginConfig as config, handler };
