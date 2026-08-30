import { getDatabase } from "../../src/lib/luffy-database.js";
import { saluranCtx } from "../../src/lib/luffy-context.js";
const pluginConfig = {
  name: "disparar",
  alias: ["nembak", "propose"],
  category: "fun",
  description: "Declárale a alguien para ser pareja",
  usage: ".tembak @tag",
  example: ".tembak @628xxx",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 30,
  carne: 1,
  isEnabled: true,
};

if (!global.tembakSessions) global.tembakSessions = {};

const SESSION_TIMEOUT = 3600000;
const romanticQuotes = [
  "No soy piloto, pero puedo hacer que tu corazón vuele alto conmigo 💕",
  "¿Sabes por qué me gusta la lluvia? Porque es como tú, refresca el corazón 🌧️",
  "Eres la razón por la que sonrío sin motivo 😊",
  "Si tú eres una estrella, quiero ser el cielo que siempre te acompaña ✨",
  "No necesito GPS, porque mi corazón ya apunta hacia ti 💘",
  "¿Sabes la diferencia entre tú y el café? El café me despierta, tú me quitas el sueño pensando en ti ☕",
  "¿Puedo pedir prestado tu corazón? Prometo cuidarlo para siempre 💖",
  "Si el amor es una canción, tú eres su melodía más hermosa 🎵",
  "Necesito 3 cosas: el Sol, la Luna y a ti. El Sol para el día, la Luna para la noche, y a ti para siempre 🌙",
  "Eres la última pieza del rompecabezas que necesito para completar mi vida 🧩",
];

async function handler(m, { sock }) {
  const db = getDatabase();
  const args = m.args || [];

  let targetJid = null;

  if (m.quoted) {
    targetJid = m.quoted.sender;
  } else if (m.mentionedJid?.[0]) {
    targetJid = m.mentionedJid[0];
  } else if (args[0]) {
    let num = args[0].replace(/[^0-9]/g, "");
    if (num.length > 5 && num.length < 20) {
      targetJid = num + "@s.whatsapp.net";
    }
  }

  if (!targetJid) {
    return m.reply(
      `⚠️ *ᴄᴏ́ᴍᴏ ᴜsᴀʀ*\n\n` +
        `> \`${m.prefix}disparar @tag\`\n\n` +
        `> Ejemplo:\n` +
        `> \`${m.prefix}disparar @628xxx\`\n` +
        `> Responde al mensaje + \`${m.prefix}disparar\``,
    );
  }

  if (targetJid === m.sender) {
    return m.reply(`¡No puedes declararte a ti mismo!`);
  }

  if (targetJid === m.botNumber) {
    return m.reply(`¡El bot no puede tener pareja!`);
  }

  let senderData = db.getUser(m.sender) || {};
  let targetData = db.getUser(targetJid) || {};

  if (!senderData.fun) senderData.fun = {};
  if (!targetData.fun) targetData.fun = {};

  if (senderData.fun.pasangan) {
    const partnerData = db.getUser(senderData.fun.pasangan);
    if (partnerData?.fun?.pasangan === m.sender) {
      return m.reply(
        `❌ *ʏᴀ ᴛɪᴇɴᴇ ᴘᴀʀᴇᴊᴀ*\n\n` +
          `Tu pareja: @${senderData.fun.pasangan.split("@")[0]}\n` +
          `Primero corta con ${partnerData.name} usando: \`${m.prefix}romper\``,
        { mentions: [senderData.fun.pasangan] },
      );
    }
  }

  if (targetData.fun.pasangan && targetData.fun.pasangan !== m.sender) {
    const targetPartner = db.getUser(targetData.fun.pasangan);
    if (targetPartner?.fun?.pasangan === targetJid) {
      return m.reply(
        `💔 *ʏᴀ ᴛɪᴇɴᴇ ᴘᴀʀᴇᴊᴀ*\n\n` +
          `Su pareja: @${targetData.fun.pasangan.split("@")[0]}`,
        { mentions: [targetData.fun.pasangan] },
      );
    }
  }

  if (
    targetData.fun.tembakTarget === m.sender ||
    targetData.fun.pasangan === m.sender
  ) {
    senderData.fun.pasangan = targetJid;
    targetData.fun.pasangan = m.sender;

    db.setUser(m.sender, senderData);
    db.setUser(targetJid, targetData);

    delete global.tembakSessions[`${m.chat}_${targetJid}`];

    await m.react("💕");
    return m.reply(
      `💕 *OOH LA LA :3*\n\n` +
        `@${m.sender.split("@")[0]} y @${targetJid.split("@")[0]} oficialmente son pareja !\n\n` +
        `¡Que dure para siempre! 💍`,
      { mentions: [m.sender, targetJid] },
    );
  }

  senderData.fun.tembakTarget = targetJid;
  if (!senderData.fun.tembakCount) senderData.fun.tembakCount = 0;
  senderData.fun.tembakCount++;
  db.setUser(m.sender, senderData);

  global.tembakSessions[`${m.chat}_${targetJid}`] = {
    shooter: m.sender,
    target: targetJid,
    chat: m.chat,
    timestamp: Date.now(),
  };

  await m.react("💘");

  const ctx = saluranCtx();
  ctx.mentionedJid = [targetJid, m.sender];
  const sentMsg = await m.reply(
    `💘 *¡ALGUIEN SE DECLARÓ!*\n\n` +
      `Oye @${targetJid.split("@")[0]} , @${m.sender.split("@")[0]} se ha declarado a ti\n\n` +
      `⏱️ Válido por *1 hora* desde ahora\n` +
      `usa: \`${m.prefix}aceptar_disparo\` / \`${m.prefix}rechazar\``,
    { contextInfo: ctx },
  );

  if (sentMsg?.key?.id) {
    global.tembakSessions[`${m.chat}_${targetJid}`].messageId = sentMsg.key.id;
  }
}

async function answerHandler(m, sock) {
  if (!m.body) return false;

  const text = m.body.trim().toLowerCase();
  if (text !== "aceptar_disparo" && text !== "rechazar") return false;
  if (!m.quoted) return false;

  const db = getDatabase();

  const allSessions = Object.entries(global.tembakSessions || {}).filter(
    ([key, val]) => val.target === m.sender && val.chat === m.chat,
  );

  if (allSessions.length === 0) return false;

  const validSession = allSessions.find(([key, val]) => {
    return Date.now() - val.timestamp < 3600000;
  });

  if (!validSession) return false;

  const [sessKey, sessData] = validSession;

  if (text === "aceptar_disparo") {
    let shooterData = db.getUser(sessData.shooter) || {};
    let targetData = db.getUser(m.sender) || {};

    if (!shooterData.fun) shooterData.fun = {};
    if (!targetData.fun) targetData.fun = {};

    shooterData.fun.pasangan = m.sender;
    targetData.fun.pasangan = sessData.shooter;

    db.setUser(sessData.shooter, shooterData);
    db.setUser(m.sender, targetData);

    delete global.tembakSessions[sessKey];

    await m.react("💕");
    await m.reply(
      `☽◯☾ ╭━ ♰ 💕 ♰ ━╮ ☽◯☾\n💕 *¡OOH LA LA, ACEPTADO!* @${sessData.shooter.split("@")[0]}\n╰━ ⊱༺༒༻⊰ ━╯\n\n` +
        `@${m.sender.split("@")[0]} y @${sessData.shooter.split("@")[0]} oficialmente son pareja\n\n` +
        `¡Que dure y sean felices! 💍`,
      { mentions: [m.sender, sessData.shooter] },
    );

    return true;
  }

  if (text === "rechazar") {
    let shooterData = db.getUser(sessData.shooter) || {};
    let targetData = db.getUser(m.sender) || {};

    if (!shooterData.fun) shooterData.fun = {};
    if (!targetData.fun) targetData.fun = {};

    delete shooterData.fun.pasangan;
    delete shooterData.fun.tembakTarget;
    delete targetData.fun.pasangan;

    db.setUser(sessData.shooter, shooterData);
    db.setUser(m.sender, targetData);

    delete global.tembakSessions[sessKey];

    await m.react("💔");
    await m.reply(
      `☠︎━━━━━━☠︎\n💔 *¡UY, TEN PACIENCIA!* @${sessData.shooter.split("@")[0]}\n\n` +
        `@${m.sender.split("@")[0]} rechazó a @${sessData.shooter.split("@")[0]} como su pareja\n\n` +
        `¡Ten paciencia, quedan muchos más! 😢`,
      { mentions: [m.sender, sessData.shooter] },
    );
    return true;
  }

  return false;
}

export { pluginConfig as config, handler, answerHandler };
