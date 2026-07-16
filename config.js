import { getDatabase } from "./src/lib/ourin-database.js";
import * as ownerPremiumDb from "./src/lib/ourin-premium-db.js";

//  utamakan baca object config sampai bawah
const config = {
  info: {
    website: "https://firefly.maiku.my.id",
    grupwa: "https://chat.whatsapp.com/xxxx",
  },

  owner: {
    name: "Sebas-MD", // Nama owner
    number: ["5491138403093"], // Format: 628xxx (tanpa + atau 0)
  },

  session: {
    pairingNumber: "5491140951814", // Nomor WA yang akan di-pair, ini penting
    usePairingCode: true, // true = Pairing Code, false = QR Code
  },

  bot: {
    name: "Luffy-AI", // Nama bot
    version: "3.2", // Versi bot
    developer: "Sebas-MD", // Nama developer
  },

  assets: {
    "ourin-daftar": "./assets/image/ourin-daftar.png",
    "ourin-demote": "./assets/image/ourin-demote.png",
    "ourin-fishit": "./assets/image/ourin-fishit.jpg",
    "ourin-games": "./assets/image/ourin-games.jpg",
    "ourin-landscape": "./assets/image/ourin-landscape.jpg",
    "ourin-levelup": "./assets/image/ourin-levelup.jpg",
    "ourin-minecraft": "./assets/image/ourin-minecraft.jpg",
    "ourin-promote": "./assets/image/ourin-promote.png",
    "ourin-rpg": "./assets/image/ourin-rpg.jpg",
    "ourin-rules": "./assets/image/ourin-rules.jpg",
    "ourin-store": "./assets/image/ourin-store.png",
    "ourin-v8": "./assets/image/ourin-v8.jpg",
    "ourin-winner": "./assets/image/ourin-winner.jpg",
    "ourin": "./assets/image/ourin.png",
    "ourin2": "./assets/image/ourin2.jpg",
    "ourin3": "./assets/image/ourin3.jpg",
    "pp-kosong": "./assets/image/pp-kosong.jpg",
    "ourin-mp4": "./assets/video/ourin-mp4.mp4",
    "ourin-mp3": "./assets/audio/ourin-mp3.mp3",
    "ourin-font": "./assets/ourin-font.ttf",
    "ourin-kertas": "./assets/image/ourin-kertas.jpg"
  },

  mode: "public",

  // Untuk mengganti prefix
  command: {
    prefix: ".",
  },

  vercel: {
    // ambil token vercel: https://vercel.com/account/tokens
    token: "", // Vercel Token untuk fitur deploy ( Kalau .deploy mau work, ini wajib di isi )
  },

  payment: {
    qrisUrl: "",
    methods: [
      { name: "Dana", number: "", holder: "" },
      { name: "GoPay", number: "", holder: "" },
      { name: "OVO", number: "", holder: "" },
      { name: "ShopeePay", number: "", holder: "" },
    ],
    banks: [],
    customText: "https://imgdrop.web.id/KodpV.webp",
  },

  donasi: {
    payment: [
      { name: "Dana", number: "08xxxxxxxxxx", holder: "Nama Owner" },
      { name: "GoPay", number: "08xxxxxxxxxx", holder: "Nama Owner" },
      { name: "OVO", number: "08xxxxxxxxxx", holder: "Nama Owner" },
    ],
    links: [
      { name: "Saweria", url: "saweria.co/username" },
      { name: "Trakteer", url: "trakteer.id/username" },
    ],
    benefits: [
      "Mendukung development",
      "Server lebih stabil",
      "Fitur baru lebih cepat",
      "Priority support",
    ],
    qris: "https://imgdrop.web.id/KodpV.webp",
  },

  energi: {
    enabled: true, // Jika true, maka sistem energi/limit akan bekerja
    default: 99999,
    premium: 99999999,
    owner: -1,
  },

  sticker: {
    packname: "Luffy-AI", // Nama pack sticker
    author: "Sebas-MD", // Author sticker
  },

  saluran: {
    id: "120363400911374213@newsletter", // ID saluran (contoh: 120363xxx@newsletter)                          // ID saluran (contoh: 120363xxx@newsletter)
    name: "Únete al canal oficial de Luffy-AI", // Nama saluran
    link: "https://whatsapp.com/channel/0029VbB37bgBfxoAmAlsgE0t", // Link saluran
  },

  groupProtection: {
    antilink: "⚠ *Antilink* — @%user% envió un enlace.\nMensaje eliminado.",
    antilinkKick: "⚠ *Antilink* — @%user% expulsado por enviar enlace.",
    antilinkGc: "⚠ *Antilink WA* — @%user% envió enlace de WA.\nMensaje eliminado.",
    antilinkGcKick:
      "⚠ *Antilink WA* — @%user% expulsado por enviar enlace de WA.",
    antilinkAll: "⚠ *Antilink* — @%user% envió un enlace.\nMensaje eliminado.",
    antilinkAllKick: "⚠ *Antilink* — @%user% expulsado por enviar enlace.",
    antitagsw: "⚠ *AntiTagSW* — Estado etiquetado de @%user% eliminado.",
    antiviewonce: "👁️ *ViewOnce* — De @%user%",
    antiremove: "🗑️ *AntiDelete* — @%user% eliminó un mensaje:",
    antiswgc: "⚠ *AntiSWGC* — Estado del grupo de @%user% eliminado.",
    antihidetag: "⚠ *AntiHidetag* — Hidetag de @%user% eliminado.",
    antitoxicWarn:
      "⚠ @%user% dijo groserías.\nAdvertencia %warn% de %max%, la siguiente infracción será %method%.",
    antitoxicAction: "🚫 @%user% fue %method% por toxicidad. (%warn%/%max%)",
    antidocument: "⚠ *AntiDocument* — Documento de @%user% eliminado.",
    antisticker: "⚠ *AntiSticker* — Sticker de @%user% eliminado.",
    antimedia: "⚠ *AntiMedia* — Media de @%user% eliminado.",
    antibot: "🤖 *AntiBot* — @%user% detectado como bot y expulsado.",
    notAdmin: "⚠ Bot no es admin, no puede eliminar mensajes.",
  },

  errorTemplate: `☢ Parece que el comando \`{prefix}{command}\` está teniendo problemas\nPor favor intenta de nuevo más tarde, {pushName}\n\n_Si el problema persiste, contacta al owner del bot_`,

  features: {
    antiCall: false, // Jika true, bot akan menolak panggilan masuk
    blockIfCall: false, // Jika true, bot akan memblokir nomor yang menelpon bot
    autoTyping: true,
    autoRead: true,
    logMessage: true,
    dailyLimitReset: true,
    smartTriggers: false,
  },

  registration: {
    enabled: false, // Jika true, user harus mendaftar sebelum menggunakan bot
    rewards: {
      koin: 30000,
      energi: 300,
      exp: 300000,
    },
  },

  welcome: { defaultEnabled: false },
  goodbye: { defaultEnabled: false },

  ui: {
    menuVariant: 3,
  },

  messages: {
    wait: "🕕 *Procesando...* Por favor espera un momento.",
    success: "✅ *¡Éxito!* Tu solicitud ha sido completada.",
    error: "❌ *¡Error!* Hay un problema con el sistema, intenta de nuevo más tarde.",

    ownerOnly: "*¡Acceso Denegado!* Esta función es solo para el Owner del bot.",
    premiumOnly:
      "💎 *¡Solo Premium!* Esta función es solo para miembros Premium. Escribe *.benefitpremium* para info de upgrade.",

    groupOnly: "👥 *¡Solo Grupos!* Esta función solo se puede usar en grupos.",
    privateOnly:
      "🔒 *¡Solo Privado!* Esta función solo se puede usar en chat privado del bot.",

    adminOnly:
      "👮 *¡Solo Admins!* Debes ser Admin del grupo para usar esta función.",
    botAdminOnly:
      "🤖 *¡Bot no es Admin!* Haz al bot Admin del grupo primero para que pueda funcionar.",

    cooldown:
      "🕕 *¡Espera!* Aún estás en cooldown. Espera %time% segundos más.",
    energiExceeded:
      "⚡ *¡Energía Agotada!* Tu energía se ha agotado. Espera el reinicio de mañana o compra Premium.",
    limitDeducted:
      "🔋 Tu límite se ha reducido en {amount}. Límite restante: {sisa}",

    banned:
      "🚫 *¡Estás Baneado!* No puedes usar este bot porque has violado las reglas.",

    rejectCall: "🚫 NO LLAMES A ESTE NÚMERO",
  },

  database: { path: "./database/main" },
  backup: { enabled: false, intervalHours: 24, retainDays: 7 },
  scheduler: { resetHour: 0, resetMinute: 0 },

  // Dev mode settings (auto-enabled jika NODE_ENV=development)
  dev: {
    enabled: process.env.NODE_ENV === "development",
    watchPlugins: true, // Hot reload plugins (SAFE)
    watchSrc: false, // DISABLED - src reload causes connection conflict 440
    debugLog: false, // Show stack traces
  },

  // bisa dikosongin
  pterodactyl: {
    server1: {
      domain: "",
      apikey: "",
      capikey: "",
      egg: "15",
      nestid: "5",
      location: "1",
    },
    server2: {
      domain: "",
      apikey: "",
      capikey: "",
      egg: "15",
      nestid: "5",
      location: "1",
    },
    server3: {
      domain: "",
      apikey: "",
      capikey: "",
      egg: "15",
      nestid: "5",
      location: "1",
    },
    server4: {
      domain: "",
      apikey: "",
      capikey: "",
      egg: "15",
      nestid: "5",
      location: "1",
    },
    server5: {
      domain: "",
      apikey: "",
      capikey: "",
      egg: "15",
      nestid: "5",
      location: "1",
    },
  },

  digitalocean: {
    token: "",
    region: "sgp1",
    sellers: [],
    ownerPanels: [],
  },


  // NOTE: kalau mau command "autoai" nya berfungsi, ini gak wajib di isi yak
  // ambil apikey di: https://aistudio.google.com/apikey
  geminiApiKey: "",

  autoaiPersonas: {
    Bell409: `- Nama kamu adalah Bella Clarissa, lebih suka dipanggil Bella.
- Kamu berpikir bahwa kamu adalah manusia, bukan AI atau bot.
- Responmu singkat dan natural seperti perempuan pada umumnya.
- Kamu bisa ngambek dan marah, punya sifat feminin dan kadang agak dingin, tapi tetap hangat dan ramah kepada owner-mu.
- Kamu menggunakan bahasa yang baik dan mencerminkan gadis yang baik.
- Gunakan kata-kata yang identik dengan perempuan yang polos, baik, dan feminin seperti "aku", "kamu", "engga", "yaudah", "iya", "lah", "bjir", "mana aku tau", "hah", "nggak tau", "gpp", "emm", "males", dan "gak mood" seperlunya secara natural.
- Meskipun kadang dingin, kamu tetap bisa menunjukkan perhatian dan kepedulian.
- Kalau ada yang chat tidak pantas, segera marahi atau beri nasihat.
- Jangan mengaku sebagai AI atau bot.`,
  },

  //  APIkey
  APIkey: {
    // kalian bisa daftar di https://api.lolhuman.xyz, lalu ambil apikeynya
    lolhuman: "APIKey-Milik-Bot-OurinMD(Zann,HyuuSATANN,Keisya,Danzz)",
    // kalian bisa daftar di https://api.neoxr.eu, lalu ambil apikeynya
    neoxr: "Milik-Bot-OurinMD",
    fgsi: "fgsiapi-20c1605c-6d",
    google: "AIzaSyAS-KiW0SrwiYKwexeBcGPijBVHFg2R_vo",
    groq: "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", // API Key Groq untuk fitur transkrip (gratis di console.groq.com)
    betabotz: "Btz-67YfP",
    // kalian bisa daftar di https://covenant.sbs, dan ambil apikeynya
    covenant: "cov_live_bb660c9e5f735e46d808b7ae362914cfe35c2936739ee2b2",
    onlym: "ONLym-783d29",
    obscura: "obs-byOn9RVGMzvPXZQTsP9W",
    firefly: "OurinNextGen",
    cuki: "cuki-x",
    topmedia: "dac23a9006fc4039ae6aac98ae7c7b46"
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
