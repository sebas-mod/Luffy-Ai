import { getDatabase } from "../../src/lib/ourin-database.js";
import { saluranCtx } from "../../src/lib/ourin-context.js";
const pluginConfig = {
  name: "rechazar",
  alias: ["reject", "no", "gaktau"],
  category: "fun",
  description: "Rechazar la propuesta de alguien",
  usage: ".tolak @tag",
  example: ".tolak @628xxx",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

const rejectionQuotes = [
  "Ten paciencia, ¡lo mejor está por venir! 🌟",
  "Que no sea el destino no significa que no exista 💪",
  "¡Sigue adelante! ¡Hay peces en el mar! 🐟",
  "Ten paciencia, el amor verdadero llegará 💕",
  "No te desanimes, ¡sigue adelante! 🔥",
  "El rechazo es el inicio del éxito 💪",
  "¡Todavía hay muchas oportunidades ahí fuera! ✨",
  "¡Seguro hay alguien mejor para ti! 🌈",
];

async function handler(m, { sock }) {
  const db = getDatabase();

  let shooterJid = null;

  if (m.quoted) {
    shooterJid = m.quoted.sender;
  } else if (m.mentionedJid?.[0]) {
    shooterJid = m.mentionedJid[0];
  }

  if (!shooterJid) {
    const sessions = global.tembakSessions || {};
    const mySession = Object.entries(sessions).find(
      ([key, val]) => val.target === m.sender && val.chat === m.chat,
    );

    if (mySession) {
      shooterJid = mySession[1].shooter;
    }
  }

  if (!shooterJid) {
    return m.reply(
      `⚠️ *ᴄᴏᴍᴏ sᴇ ᴜsᴀ*\n\n` +
        `> Responde al mensaje de la propuesta + \`${m.prefix}tolak\`\n` +
        `> O bien \`${m.prefix}tolak @tag\``,
    );
  }

  if (shooterJid === m.sender) {
    return m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> ¡No puedes rechazarte a ti mismo!`);
  }

  if (shooterJid === m.botNumber) {
    return m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> ¡El bot no tiene corazón para ser rechazado!`);
  }

  let shooterData = db.getUser(shooterJid) || {};
  let myData = db.getUser(m.sender) || {};

  if (!shooterData.fun) shooterData.fun = {};
  if (!myData.fun) myData.fun = {};

  if (
    shooterData.fun.pasangan !== m.sender &&
    shooterData.fun.tembakTarget !== m.sender
  ) {
    return m.reply(
      `❌ *ɴᴏ sᴇ ᴇsᴛᴀ ᴘʀᴏᴘᴏɴɪᴇɴᴅᴏ*\n\n` +
        `> @${shooterJid.split("@")[0]} no te está proponiendo`,
      { mentions: [shooterJid] },
    );
  }

  delete shooterData.fun.pasangan;
  delete shooterData.fun.tembakTarget;
  delete myData.fun.pasangan;

  if (!shooterData.fun.ditolakCount) shooterData.fun.ditolakCount = 0;
  shooterData.fun.ditolakCount++;

  db.setUser(shooterJid, shooterData);
  db.setUser(m.sender, myData);

  const sessionKey = `${m.chat}_${m.sender}`;
  if (global.tembakSessions?.[sessionKey]) {
    delete global.tembakSessions[sessionKey];
  }

  const quote =
    rejectionQuotes[Math.floor(Math.random() * rejectionQuotes.length)];

  await m.react("💔");
  const ctx = saluranCtx();
  ctx.mentionedJid = [m.sender, shooterJid];

  await m.reply(
    `💔 *UY, TEN PACIENCIA* @${shooterJid.split("@")[0]}\n\n` +
      `@${m.sender.split("@")[0]} rechazó a @${shooterJid.split("@")[0]} como su pareja\n\n` +
      `Ten paciencia, ¡todavía hay más personas! 😢`,
    { contextInfo: ctx },
  );
}

export { pluginConfig as config, handler };
