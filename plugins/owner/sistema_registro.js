import { getDatabase } from "../../src/lib/luffy-database.js";
import config from "../../config.js";

function getRegistrationContextInfo() {
  const saluranId = config.saluran?.id || "120363400911374213@newsletter";
  const saluranName = config.saluran?.name || config.bot?.name || "Luffy-Ai";

  return {
    forwardingScore: 9999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: saluranId,
      newsletterName: saluranName,
      serverMessageId: 127,
    },
  };
}

function toDateKey(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getRegistrationStats(db) {
  const users = Object.values(db.getAllUsers() || {});
  const todayKey = toDateKey(new Date());

  return {
    totalRegistered: users.filter((user) => user?.isRegistered).length,
    registeredToday: users.filter(
      (user) =>
        toDateKey(user?.lastRegisteredAt || user?.registeredAt) === todayKey,
    ).length,
    unregisteredToday: users.filter(
      (user) => toDateKey(user?.unregisteredAt) === todayKey,
    ).length,
    activeSessions: Object.keys(global.registrationSessions || {}).length,
  };
}

const pluginConfig = {
  name: "sistema_registro",
  alias: ["regmode", "registro_obligatorio", "togglereg"],
  category: "owner",
  description: "Gestionar el sistema de registro obligatorio y las estadísticas",
  usage: ".sistemdaftar <on/off/stats>",
  example: ".sistemdaftar stats",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,

  cooldown: 5,
  carne: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const args = m.text?.trim() || "";
  const normalizedArgs = args.toLowerCase();

  const currentStatus =
    db.setting("registrationRequired") ?? config.registration?.enabled ?? false;
  const stats = getRegistrationStats(db);

  if (!normalizedArgs) {
    return m.reply(
      `╭━〔 ⚙️ SISTEMA 〕━╮\n` +
        `┃ ⚙️ *sɪsᴛᴇᴍᴀ ᴅᴇ ʀᴇɢɪsᴛʀᴏ*\n` +
        `╰━━━━━━━━╯\n\n` +
        `Estado: ${currentStatus ? "✅ ON (Registro obligatorio)" : "❌ OFF"}\n\n` +
        `*Estadísticas:*\n` +
        `> Registrados totales: *${stats.totalRegistered}*\n` +
        `> Registrados hoy: *${stats.registeredToday}*\n` +
        `> No registrados hoy: *${stats.unregisteredToday}*\n` +
        `> Sesiones activas: *${stats.activeSessions}*\n\n` +
        `*Uso:*\n` +
        `> \`${m.prefix}sistema_registro on\` - Obligar el registro\n` +
        `> \`${m.prefix}sistema_registro off\` - Quitar el registro obligatorio\n` +
        `> \`${m.prefix}sistema_registro stats\` - Ver estadísticas\n\n` +
        `> Si está ON, los usuarios deben usar \`${m.prefix}registrar\` antes de usar comandos`,
    );
  }

  if (normalizedArgs === "stats") {
    await sock.sendMessage(
      m.chat,
      {
        text:
          `📊 *ᴇsᴛᴀᴅɪsᴛɪᴄᴀs ᴅᴇ ʀᴇɢɪsᴛʀᴏ*\n\n` +
          `Estado del sistema: ${currentStatus ? "✅ ON (Registro obligatorio)" : "❌ OFF"}\n\n` +
          `╭┈┈⬡「 📈 *ᴇsᴛᴀᴅɪsᴛɪᴄᴀs* 」\n` +
          `┃ Registrados totales: *${stats.totalRegistered}*\n` +
          `┃ Registrados hoy: *${stats.registeredToday}*\n` +
          `┃ No registrados hoy: *${stats.unregisteredToday}*\n` +
          `┃ Sesiones activas: *${stats.activeSessions}*\n` +
          `╰┈┈┈┈┈┈┈┈⬡`,
        contextInfo: getRegistrationContextInfo(),
      },
      { quoted: m },
    );

    await m.react("📊");
    return;
  }

  if (
    normalizedArgs === "on" ||
    normalizedArgs === "1" ||
    normalizedArgs === "true"
  ) {
    db.setting("registrationRequired", true);
    await db.save();

    await sock.sendMessage(
      m.chat,
      {
        text:
          `╭━━━〔 ✦ ÉXITO 〕━━━╮\n` +
          `┃ ✅ *¡sɪsᴛᴇᴍᴀ ᴅᴇ ʀᴇɢɪsᴛʀᴏ ᴀᴄᴛɪᴠᴀᴅᴏ!*\n` +
          `╰━━━━━━━━━━━━╯\n\n` +
          `¡Los usuarios ahora deben registrarse antes de usar los comandos!\n\n` +
          `╰┈➤ Comando: \`${m.prefix}registrar\``,
        contextInfo: getRegistrationContextInfo(),
      },
      { quoted: m },
    );

    await m.react("✅");
    return;
  }

  if (
    normalizedArgs === "off" ||
    normalizedArgs === "0" ||
    normalizedArgs === "false"
  ) {
    db.setting("registrationRequired", false);
    await db.save();

    await sock.sendMessage(
      m.chat,
      {
        text:
          `╭━〔 ⚙️ SISTEMA 〕━╮\n` +
          `┃ ❌ *¡sɪsᴛᴇᴍᴀ ᴅᴇ ʀᴇɢɪsᴛʀᴏ ᴅᴇsᴀᴄᴛɪᴠᴀᴅᴏ!*\n` +
          `╰━━━━━━━━╯\n\n` +
          `Los usuarios ya no necesitan registrarse para usar los comandos.`,
        contextInfo: getRegistrationContextInfo(),
      },
      { quoted: m },
    );

    await m.react("❌");
    return;
  }

  return m.reply(
    `❌ ¡Opción no válida!\n\n╰┈➤ Usa: \`on\`, \`off\` o \`stats\``,
  );
}

export { pluginConfig as config, handler };
