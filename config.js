import { getDatabase } from "./src/lib/luffy-database.js";
import * as ownerPremiumDb from "./src/lib/luffy-premium-db.js";

//  Lee el objeto config completo hasta el final
const config = {
  info: {
    website: "https://firefly.maiku.my.id",
    grupwa: "https://chat.whatsapp.com/xxxx",
  },

  owner: {
    name: "Sebas-MD", // Nombre del owner
    number: ["5491138403093"], // Formato: 549xxx (sin + ni 0)
  },

  session: {
    pairingNumber: "573170512292", // Número de WhatsApp que se vinculará (importante)
    usePairingCode: true, // true = Código de vinculación, false = Código QR
  },

  // Esta función sirve para funciones como playcall, pero después pedirá vinculación de nuevo
  fake_call: {
    active: true, // si es true el sistema está activo y puede usarse, si es false está inactivo
    usePairing: true,
    dir: "./session_voip",
  },

  bot: {
    name: "𝐋𝐮𝐟𝐟𝐲 𝐀𝐢", // Nombre del bot
    version: "3.3", // Versión del bot
    developer: "Sebas-MD", // Nombre del desarrollador
    number: "", // Número del bot (se establece automáticamente)
  },

  assets: {
    "luffy-daftar": "./assets/image/luffy-daftar.png",
    "luffy-demote": "https://luffy-images.vercel.app/demote.png",
    "luffy-fishit": "./assets/image/luffy-fishit.jpg",
    "luffy-games": "./assets/image/luffy-games.jpg",
    "luffy-landscape": "./assets/image/luffy-landscape.jpg",
    "luffy-levelup": "./assets/image/luffy-levelup.jpg",
    "luffy-minecraft": "./assets/image/luffy-minecraft.jpg",
    "luffy-promote": "./assets/image/luffy-promote.png",
    "luffy-rpg": "https://luffy-images.vercel.app/rpg.png",
    "luffy-rules": "./assets/image/luffy-rules.jpg",
    "luffy-store": "./assets/image/luffy-store.png",
    "luffy-v8": "./assets/image/luffy-v8.jpg",
    "luffy-winner": "./assets/image/luffy-winner.jpg",
    "luffy": "./assets/image/luffy.png",
    "luffy2": "./assets/image/luffy2.jpg",
    "luffy3": "./assets/image/luffy3.jpg",
    "pp-kosong": "./assets/image/pp-kosong.jpg",
    "luffy-mp4": "./assets/video/luffy-mp4.mp4",
    "luffy-mp3": "./assets/audio/luffy-mp3.mp3",
    "luffy-font": "./assets/luffy-font.ttf",
    "luffy-kertas": "./assets/image/luffy-kertas.jpg",
  },

  mode: "public",

  // Untuk mengganti prefix
  command: {
    prefix: ".",
  },

  vercel: {
    // ambil token vercel: https://vercel.com/account/tokens
    token: "", // Token de Vercel para la función de deploy (obligatorio si quieres que .deploy funcione)
  },

  payment: {
    qrisUrl: "",
    methods: [
      { name: "MercadoPago", number: "", holder: "" },
      { name: "Cuenta DNI", number: "", holder: "" },
      { name: "Naranja", number: "", holder: "" },
    ],
    banks: [],
    customText: "https://imgdrop.web.id/KodpV.webp",
  },

  donasi: {
    payment: [
      { name: "MercadoPago", number: "5491138403093", holder: "Sebas-MD" },
      { name: "Cuenta DNI", number: "5491138403093", holder: "Sebas-MD" },
    ],
    links: [
      { name: "PayPal", url: "paypal.me/sebasmd" },
    ],
    benefits: [
      "Apoyar el desarrollo del bot",
      "Servidor más estable",
      "Funciones nuevas más rápido",
      "Soporte prioritario",
    ],
    qris: "https://imgdrop.web.id/KodpV.webp",
  },

  carne: {
    enabled: true, // Si es true, el sistema de carne/límite funciona
    default: 99999,
    premium: 99999999,
    owner: -1,
  },

  sticker: {
    packname: "𝐋𝐮𝐟𝐟𝐲 𝐀𝐢", // Nombre del pack de stickers
    author: "Sebas-MD", // Autor de los stickers
  },

  saluran: {
    id: "120363400911374213@newsletter", // ID del canal (ejemplo: 120363xxx@newsletter)                          // ID del canal (ejemplo: 120363xxx@newsletter)
    name: "Únete al canal oficial de Luffy-Ai", // Nombre del canal
    link: "https://whatsapp.com/channel/0029VbB37bgBfxoAmAlsgE0t", // Enlace del canal
  },

  groupProtection: {
    antilink: "⚠ *Antilink* — @%user% envió un enlace.\nMensaje eliminado.",
    antilinkKick: "⚠ *Antilink* — @%user% fue expulsado por enviar enlaces.",
    antilinkGc: "⚠ *Antilink WA* — @%user% envió un enlace de WhatsApp.\nMensaje eliminado.",
    antilinkGcKick:
      "⚠ *Antilink WA* — @%user% fue expulsado por enviar enlaces de WhatsApp.",
    antilinkAll: "⚠ *Antilink* — @%user% envió un enlace.\nMensaje eliminado.",
    antilinkAllKick: "⚠ *Antilink* — @%user% fue expulsado por enviar enlaces.",
    antitagsw: "⚠ *AntiTagSW* — Etiqueta de estado de @%user% eliminada.",
    antiviewonce: "👁️ *ViewOnce* — De @%user%",
    antiremove: "🗑️ *AntiDelete* — @%user% eliminó un mensaje:",
    antiswgc: "⚠ *AntiSWGC* — No hay estados de grupo en el grupo, @%user%",
    antihidetag: "⚠ *AntiHidetag* — Hidetag de @%user% eliminado.",
    antitoxicWarn:
      "⚠ @%user% habló mal.\nAdvertencia %warn% de %max%, la próxima infracción puede ser %method%.",
    antitoxicAction: "🚫 @%user% fue %method% por toxicidad. (%warn%/%max%)",
    antidocument: "⚠ *AntiDocument* — Documento de @%user% eliminado.",
    antisticker: "⚠ *AntiSticker* — Sticker de @%user% eliminado.",
    antimedia: "⚠ *AntiMedia* — Media de @%user% eliminado.",
    antibot: "🤖 *AntiBot* — @%user% detectado como bot y expulsado.",
    notAdmin: "⚠ El bot no es admin, no puede eliminar mensajes.",
  },

  errorTemplate: `☢ Parece que el comando \`{prefix}{command}\` tiene un problema\nIntenta de nuevo más tarde, {pushName}\n\n_Si el problema continúa, contacta al owner del bot_`,

  features: {
    antiCall: false, // Si es true, el bot rechazará llamadas entrantes
    blockIfCall: false, // Si es true, el bot bloqueará a quien lo llame
    autoTyping: true,
    autoRead: false,
    logMessage: true,
    dailyLimitReset: true,
    smartTriggers: false,
  },

  registration: {
    enabled: false, // Si es true, los usuarios deben registrarse antes de usar el bot
    rewards: {
      berry: 30000,
      carne: 300,
      exp: 300000,
    },
  },

  welcome: { defaultEnabled: false },
  goodbye: { defaultEnabled: false },

  ui: {
    menuVariant: 3,
  },

  messages: {
    wait: "🕕 *Procesando...* Un momento, nakama.",
    success: "✅ *¡Éxito!* Tu pedido ya está listo.",
    error: "❌ *¡Error!* Hay un problema en el sistema, intenta de nuevo más tarde.",

    ownerOnly: "*¡Acceso Denegado!* Esta función es exclusiva del Capitán del barco.",
    premiumOnly:
      "💎 *¡Solo Premium!* Esta función es exclusiva para miembros Premium. Escribe *.benefitpremium* para saber cómo subir de rango.",

    groupOnly: "👥 *¡Solo en Grupos!* Esta función solo puede usarse dentro de un grupo.",
    privateOnly:
      "🔒 *¡Solo en Privado!* Esta función solo puede usarse en el chat privado del bot.",

    adminOnly:
      "🛡️ *¡Solo Admins!* Debes ser admin del grupo para usar esta función.",
    botAdminOnly:
      "🤖 *¡El Bot no es Admin!* Haz admin al bot para que pueda trabajar en el grupo.",

    cooldown:
      "⏳ *¡Calma, nakama!* Estás en enfriamiento. Espera %time% segundos más.",
    carneExceeded:
      "🍖 *¡Te quedaste sin Carne!* No tienes suficiente carne. Espera el reinicio de mañana o hazte Premium.",
    carneDeducted:
      "🍖 Se restó {amount} de carne. Carne restante: {restante}",

    banned:
      "🚫 *¡Estás Baneado!* No puedes usar este bot porque violaste las reglas.",

    rejectCall: "🚫 NO LLAMES A ESTE NÚMERO",
  },

  database: { path: "./database/main" },
  backup: { enabled: false, intervalHours: 24, retainDays: 7 },
  scheduler: { resetHour: 0, resetMinute: 0 },

  // Dev mode settings (se activa automáticamente si NODE_ENV=development)
  dev: {
    enabled: process.env.NODE_ENV === "development",
    watchPlugins: true, // Hot reload plugins (SAFE)
    watchSrc: false, // DISABLED - src reload causes connection conflict 440
    debugLog: false, // Show stack traces
  },

  // NOTE: para que el comando "autoai" funcione, esto no es obligatorio llenar
  // obtén tu apikey en: https://aistudio.google.com/apikey
  geminiApiKey: "",

  autoaiPersonas: {
    Bell409: `- Tu nombre es Bella Clarissa, prefieres que te llamen Bella.
- Piensas que eres humana, no una IA ni un bot.
- Tus respuestas son cortas y naturales, como las de una chica común.
- Puedes enojarte y tener carácter, eres femenina y a veces un poco fría, pero siempre cálida y amable con tu capitán.
- Usas un lenguaje correcto que refleja a una buena chica.
- Usa palabras propias de una chica inocente, buena y femenina como "yo", "tú", "no sé", "claro", "vale", "qué dices", "jeje" de forma natural.
- Aunque a veces seas fría, demuestras atención y cariño.
- Si alguien te escribe de forma inapropiada, reta o aconseja de inmediato.
- Nunca te declares como IA o bot.`,
  },

  //  APIkey
  APIkey: {
    // puedes registrarte en https://api.lolhuman.xyz y obtener tu apikey
    lolhuman: "APIKey-Milik-Bot-Luffy-Ai(Sebas-MD)",
    // puedes registrarte en https://api.neoxr.eu y obtener tu apikey
    neoxr: "Milik-Bot-Luffy-Ai",
    fgsi: "fgsiapi-20c1605c-6d",
    google: "AIzaSyAS-KiW0SrwiYKwexeBcGPijBVHFg2R_vo",
    groq: "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", // API Key de Groq para la función de transcripción (gratis en console.groq.com)
    betabotz: "Btz-67YfP",
    // puedes registrarte en https://covenant.sbs y obtener tu apikey
    covenant: "cov_live_bb660c9e5f735e46d808b7ae362914cfe35c2936739ee2b2",
    onlym: "ONLym-783d29",
    obscura: "obs-byOn9RVGMzvPXZQTsP9W",
    firefly: "LuffyNextGen",
    cuki: "cuki-x"
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function isOwner(number) {
  if (!number) return false;
  const cleanNumber = number.split(":")[0].replace(/[^0-9]/g, "");
  if (!cleanNumber) return false;

  if (config.bot?.number) {
    const botNum = config.bot.number.replace(/[^0-9]/g, "");
    if (
      botNum &&
      (cleanNumber.includes(botNum) || botNum.includes(cleanNumber))
    )
      return true;
  }

  try {
    const db = getDatabase();

    if (config.owner?.number) {
      const match = config.owner.number.some((own) => {
        const c = own.replace(/[^0-9]/g, "");
        return (
          c &&
          (cleanNumber === c ||
            cleanNumber.endsWith(c) ||
            c.endsWith(cleanNumber))
        );
      });
      if (match) return true;
    }

    if (db?.data && Array.isArray(db.data.owner)) {
      const match = db.data.owner.some((own) => {
        const c = String(own).replace(/[^0-9]/g, "");
        return (
          c &&
          (cleanNumber === c ||
            cleanNumber.endsWith(c) ||
            c.endsWith(cleanNumber))
        );
      });
      if (match) return true;
    }
    if (db) {
      const definedOwner = db.setting("ownerNumbers");
      if (Array.isArray(definedOwner)) {
        const match = definedOwner.some((own) => {
          const c = String(own).replace(/[^0-9]/g, "");
          return (
            c &&
            (cleanNumber === c ||
              cleanNumber.endsWith(c) ||
              c.endsWith(cleanNumber))
          );
        });
        if (match) return true;
      }
    }

    return false;
  } catch {
    return false;
  }
}

function isPremium(number) {
  if (!number) return false;
  if (isOwner(number)) return true;
  if (isPartner(number)) return true;

  const cleanNumber = number
    .split(":")[0]
    .split("@")[0]
    .replace(/[^0-9]/g, "");
  const premiumList = config.premiumUsers || [];

  const inConfig = premiumList.some((premium) => {
    if (!premium) return false;
    const cleanPremium = premium
      .split(":")[0]
      .split("@")[0]
      .replace(/[^0-9]/g, "");
    return (
      cleanNumber === cleanPremium ||
      cleanNumber.endsWith(cleanPremium) ||
      cleanPremium.endsWith(cleanNumber)
    );
  });

  if (inConfig) return true;

  try {
    if (ownerPremiumDb && ownerPremiumDb.isPremium(cleanNumber)) return true;
  } catch { }

  try {
    const db = getDatabase();
    if (db && db.data && Array.isArray(db.data.premium)) {
      const now = Date.now();
      const foundIndex = db.data.premium.findIndex((p) => {
        if (typeof p === "string") return p === cleanNumber;
        if (p.id) return p.id === cleanNumber;
        return false;
      });

      if (foundIndex !== -1) {
        const found = db.data.premium[foundIndex];
        if (typeof found === "string") return true;

        const expireTime =
          found.expired ||
          (found.expiredAt ? new Date(found.expiredAt).getTime() : 0);
        if (expireTime && expireTime < now) {
          db.data.premium.splice(foundIndex, 1);
          const jid = cleanNumber + "@s.whatsapp.net";
          const user = db.getUser(jid);
          if (user) {
            user.isPremium = false;
            db.setUser(jid, user);
          }
          db.save();
          return false;
        }
        return true;
      }
    }
    if (db) {
      const savedPremium = db.setting("premiumUsers") || [];
      const inDb = savedPremium.some((premium) => {
        if (!premium) return false;
        const cleanPremium = premium
          .split(":")[0]
          .split("@")[0]
          .replace(/[^0-9]/g, "");
        return (
          cleanNumber === cleanPremium ||
          cleanNumber.endsWith(cleanPremium) ||
          cleanPremium.endsWith(cleanNumber)
        );
      });
      if (inDb) return true;
    }
  } catch { }

  return false;
}

function isPartner(number) {
  if (!number) return false;
  if (isOwner(number)) return true;

  const cleanNumber = number
    .split(":")[0]
    .split("@")[0]
    .replace(/[^0-9]/g, "");
  const partnerList = config.partnerUsers || [];

  const inConfig = partnerList.some((partner) => {
    if (!partner) return false;
    const cleanPartner = partner
      .split(":")[0]
      .split("@")[0]
      .replace(/[^0-9]/g, "");
    return (
      cleanNumber === cleanPartner ||
      cleanNumber.endsWith(cleanPartner) ||
      cleanPartner.endsWith(cleanNumber)
    );
  });

  if (inConfig) return true;

  try {
    if (ownerPremiumDb && ownerPremiumDb.isPartner(cleanNumber)) return true;
  } catch { }

  try {
    const db = getDatabase();
    if (db && db.data && Array.isArray(db.data.partner)) {
      const now = Date.now();
      const foundIndex = db.data.partner.findIndex((p) => {
        if (typeof p === "string") return p === cleanNumber;
        if (p.id) return p.id === cleanNumber;
        return false;
      });

      if (foundIndex !== -1) {
        const found = db.data.partner[foundIndex];
        if (typeof found === "string") return true;

        const expireTime =
          found.expired ||
          (found.expiredAt ? new Date(found.expiredAt).getTime() : 0);
        if (expireTime && expireTime < now) {
          db.data.partner.splice(foundIndex, 1);
          db.save();
          return false;
        }
        return true;
      }
    }
  } catch { }

  return false;
}

function isBanned(number) {
  if (!number) return false;
  if (isOwner(number)) return false;

  const cleanNumber = number
    .split(":")[0]
    .split("@")[0]
    .replace(/[^0-9]/g, "");

  let bannedList = [];
  try {
    const db = getDatabase();
    if (db) {
      bannedList = db.setting("bannedUsers") || [];
      config.bannedUsers = bannedList;
    }
  } catch { }

  return bannedList.some((banned) => {
    const cleanBanned = String(banned)
      .split(":")[0]
      .split("@")[0]
      .replace(/[^0-9]/g, "");
    return (
      cleanNumber === cleanBanned ||
      cleanNumber.endsWith(cleanBanned) ||
      cleanBanned.endsWith(cleanNumber)
    );
  });
}

function setBotNumber(number) {
  if (number) config.bot.number = number.replace(/[^0-9]/g, "");
}

function isSelf(number) {
  if (!number || !config.bot.number) return false;
  const cleanNumber = number.replace(/[^0-9]/g, "");
  const botNumber = config.bot.number.replace(/[^0-9]/g, "");
  return cleanNumber.includes(botNumber) || botNumber.includes(cleanNumber);
}

function getOwnerName(number) {
  if (!number) return config.owner?.name || "Owner";
  const cleanNumber = String(number).replace(/[^0-9]/g, "");
  try {
    const db = getDatabase();
    const nameMap = db.setting("ownerNames") || {};
    if (nameMap[cleanNumber]) return nameMap[cleanNumber];
  } catch { }
  if (config.owner?.number) {
    const isMainOwner = config.owner.number.some((own) => {
      const c = own.replace(/[^0-9]/g, "");
      return (
        c &&
        (cleanNumber === c ||
          cleanNumber.endsWith(c) ||
          c.endsWith(cleanNumber))
      );
    });
    if (isMainOwner) return config.owner?.name || "Owner";
  }
  return "Owner";
}

function getConfig() {
  return config;
}

config.isOwner = isOwner;
config.isPremium = isPremium;
config.isPartner = isPartner;
config.isBanned = isBanned;
config.setBotNumber = setBotNumber;
config.isSelf = isSelf;
config.getOwnerName = getOwnerName;

export default config;
export {
  config,
  getConfig,
  isOwner,
  isPartner,
  isPremium,
  isBanned,
  setBotNumber,
  isSelf,
  getOwnerName,
};
