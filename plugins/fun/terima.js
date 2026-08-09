import { getDatabase } from "../../src/lib/luffy-database.js";
import * as timeHelper from "../../src/lib/luffy-time.js";
import { saluranCtx } from "../../src/lib/luffy-context.js";
const pluginConfig = {
  name: "terima",
  alias: ["accept", "yes"],
  category: "fun",
  description: "Acepta el disparo de alguien",
  usage: ".terima @tag",
  example: ".terima @628xxx",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  carne: 0,
  isEnabled: true,
};

const celebrationQuotes = [
  "¡Que dure hasta el altar! 💍",
  "¡De amigos a amantes, qué bonito! 💕",
  "Love is in the air! 💖",
  "Couple goals detected! 💑",
  "¡No olviden invitarme a la boda! 💒",
  "¡Que disfruten la vida en pareja! 🥰",
  "¡La química es muy fuerte! 🔥",
  "Match made in heaven! ✨",
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
      `⚠️ *ᴄᴏ́ᴍᴏ ᴜsᴀʀ*\n\n` +
        `> Responde al mensaje de disparo + \`${m.prefix}terima\`\n` +
        `> O \`${m.prefix}terima @tag\``,
    );
  }

  if (shooterJid === m.sender) {
    return m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> ¡No puedes aceptarte a ti mismo!`);
  }

  if (shooterJid === m.botNumber) {
    return m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> ¡El bot no puede tener pareja!`);
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
      `❌ *ɴᴏ ᴛᴇ ᴅɪsᴘᴀʀᴀ*\n\n` +
        `> @${shooterJid.split("@")[0]} no te está disparando`,
      { mentions: [shooterJid] },
    );
  }

  shooterData.fun.pasangan = m.sender;
  shooterData.fun.jadiPacar = Date.now();
  delete shooterData.fun.tembakTarget;
  myData.fun.pasangan = shooterJid;
  myData.fun.jadiPacar = Date.now();

  if (!shooterData.fun.terimaCount) shooterData.fun.terimaCount = 0;
  shooterData.fun.terimaCount++;

  db.setUser(shooterJid, shooterData);
  db.setUser(m.sender, myData);

  const sessionKey = `${m.chat}_${m.sender}`;
  if (global.tembakSessions?.[sessionKey]) {
    delete global.tembakSessions[sessionKey];
  }

  const quote =
    celebrationQuotes[Math.floor(Math.random() * celebrationQuotes.length)];
  const dateStr = timeHelper.formatFull("dddd, DD MMMM YYYY");

  await m.react("💕");
  const ctx = saluranCtx();
  ctx.mentionedJid = [m.sender, shooterJid];

  await m.reply(
    `💕 *¡OOH LA LA, ACEPTADO!* @${shooterJid.split("@")[0]}\n\n` +
      `@${m.sender.split("@")[0]} y @${shooterJid.split("@")[0]} oficialmente son pareja\n\n` +
      `¡Que dure y sean felices! 💍`,
    { contextInfo: ctx },
  );
}

export { pluginConfig as config, handler };
