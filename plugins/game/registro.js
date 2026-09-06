import { getDatabase } from "../../src/lib/luffy-database.js";
import config from "../../config.js";

const pluginConfig = {
  name: "registrogame",
  alias: ["registroj2", "regjuegos", "regjuego", "regj2"],
  category: "game",
  description:
    "Registra tus datos (nombre, edad, género) para personalizar tu perfil de juegos",
  usage: ".registrogame",
  example: ".registrogame",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  carne: 0,
  isEnabled: true,
};

if (!global.j2RegSessions) global.j2RegSessions = {};

const SESSION_TIMEOUT = 600000;

function getJ2ContextInfo() {
  const saluranId = config.saluran?.canalId || "120363400911374213@newsletter";
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

function normalizeName(input) {
  return String(input || "").replace(/\s+/g, " ").trim();
}

function normalizeText(input) {
  return String(input || "").trim().toLowerCase();
}

function getSessionKey(jid) {
  return String(jid || "")
    .trim()
    .replace(/[^0-9]/g, "");
}

function bumpJ2Session(key) {
  const session = global.j2RegSessions?.[key];
  if (!session) return null;
  if (session.timeout) clearTimeout(session.timeout);
  session.timeout = setTimeout(() => {
    delete global.j2RegSessions[key];
  }, SESSION_TIMEOUT);
  session.startedAt = Date.now();
  return session;
}

function clearJ2Session(jid) {
  const key = getSessionKey(jid);
  const session = global.j2RegSessions?.[key];
  if (session?.timeout) clearTimeout(session.timeout);
  const existed = !!global.j2RegSessions?.[key];
  delete global.j2RegSessions[key];
  return existed;
}

function createJ2Session(jid, chatJid) {
  clearJ2Session(jid);
  const key = getSessionKey(jid);
  const session = {
    step: "name",
    name: null,
    age: null,
    gender: null,
    chatJid,
    promptId: null,
    startedAt: Date.now(),
  };
  global.j2RegSessions[key] = session;
  bumpJ2Session(key);
  return session;
}

function getQuotedId(m) {
  return m.quoted?.id || m.quoted?.stanzaId || m.quoted?.key?.id || null;
}

function isReplyToJ2Prompt(m, session) {
  const quotedId = getQuotedId(m);
  if (!session || m.chat !== session.chatJid || !m.quoted) return false;
  if (quotedId && session.promptId && quotedId === session.promptId) return true;
  if (m.quoted?.key?.fromMe) return true;
  return false;
}

function j2DataBlock(name, age, gender) {
  return (
    `☽◯☾ ♰ 「 📋 *ᴅᴀᴛᴏs* 」\n` +
    `┃ 🎮 Nombre: *${name || "-"}*\n` +
    `┃ 🎂 Edad: *${age ? `${age} años` : "-"}*\n` +
    `┃ 👤 Género: *${gender || "-"}*\n` +
    `╰━ ⊱༺༒༻⊰ ━╯`
  );
}

function buildWelcome(m, name) {
  return (
    `☆══════════════════════★\n` +
    `⚡ *ʀᴇɢɪsᴛʀᴏ ᴅᴇ ᴊᴜᴇɢᴏs2* · con 🏴☠️ *ʟᴜꜰꜰʏ* ⚡\n` +
    `☆══════════════════════★\n\n` +
    `✨ ¡Bienvenido a la *sala de juegos*!\n` +
    `> Con tu registro personalizamos tu perfil y\n` +
    `> mostramos tu nombre en los rankings. 🏆\n\n` +
    `📝 *ᴘʀᴇɢᴜɴᴛᴀ 1/4*\n` +
    `> ¿Cómo te llamas?\n\n` +
    `📌 *Es obligatorio responder a este mensaje*\n` +
    `> Para cancelar: escribe \`cancelar\`\n` +
    `> ⚡ Credits: yosoyyo`
  );
}

function buildConfirmation(session) {
  return (
    `✅ *ᴘʀᴇɢᴜɴᴛᴀ 4/4*\n\n` +
    `¿Son correctos tus datos de juegos?\n\n` +
    `${j2DataBlock(session.name, session.age, session.gender)}\n\n` +
    `🛠️ Si algo está mal, puedes revisar cada parte.\n\n` +
    `*Responde a este mensaje con:*\n` +
    `> \`sí\` para guardar\n` +
    `> \`revisar nombre\` para cambiar el nombre\n` +
    `> \`revisar edad\` para cambiar la edad\n` +
    `> \`revisar género\` para cambiar el género\n` +
    `> \`cancelar\` para cancelar`
  );
}

async function sendPrompt(sock, m, text) {
  return await sock.sendMessage(
    m.chat,
    { text, contextInfo: getJ2ContextInfo() },
    { quoted: m },
  );
}

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (user?.j2Registered) {
    return m.reply(
      `✅ ¡Ya tienes registro de juegos!\n\n` +
        `${j2DataBlock(user.j2Name, user.j2Age, user.j2Gender)}\n\n` +
        `> Para eliminarlo: \`${m.prefix}desregistrogame\``,
    );
  }

  const key = getSessionKey(m.sender);
  if (global.j2RegSessions?.[key]) {
    return m.reply(
      `📝 ¡Aún hay una sesión de registro de juegos activa!\n\n` +
        `> Responde al último mensaje del bot para continuar\n` +
        `> O escribe: \`${m.prefix}cancelar_registrogame\``,
    );
  }

  const session = createJ2Session(m.sender, m.chat);
  const sent = await sendPrompt(sock, m, buildWelcome(m, null));
  session.promptId = sent?.key?.id || null;
  await m.react("🎮");
}

async function j2RegAnswerHandler(m, sock) {
  if (!m.body) return false;
  if (m.isCommand) return false;
  if (m.chat?.startsWith("status@")) return false;

  const key = getSessionKey(m.sender);
  const session = global.j2RegSessions?.[key];
  if (!session) return false;
  if (m.chat !== session.chatJid) return false;

  bumpJ2Session(key);

  const text = m.body.trim();
  const lowText = normalizeText(text);
  const db = getDatabase();

  if (["cancelar", "cancela", "cancel"].includes(lowText)) {
    clearJ2Session(m.sender);
    await m.reply(
      `❌ Registro de juegos cancelado.\n\n> Vuelve a empezar con: \`${m.prefix}registrogame\``,
    );
    return true;
  }

  if (session.step === "name") {
    const name = normalizeName(text);
    if (name.length < 2 || name.length > 30) {
      await m.reply(`❌ ¡El nombre debe tener 2-30 caracteres!`);
      return true;
    }
    session.name = name;
    session.step = "age";
    const sent = await sendPrompt(
      sock,
      m,
      `🎂 *ᴘʀᴇɢᴜɴᴛᴀ 2/4*\n\n` +
        `Hola *${name}* 👋\n\n` +
        `> ¿Cuántos años tienes?\n\n` +
        `📌 La edad solo puede ser de *1 - 100* años\n` +
        `📩 Responde a este mensaje con tu edad\n\n` +
        `> Ejemplo: \`17\``,
    );
    session.promptId = sent?.key?.id || session.promptId;
    return true;
  }

  if (session.step === "age") {
    const age = Number(text);
    if (!/^\d+$/.test(text) || Number.isNaN(age) || age < 1 || age > 100) {
      await m.reply(`❌ ¡Edad no válida!\n\n> Ingresa una edad entre *1 - 100* años`);
      return true;
    }
    session.age = age;
    session.step = "gender";
    const sent = await sendPrompt(
      sock,
      m,
      `👤 *ᴘʀᴇɢᴜɴᴛᴀ 3/4*\n\n` +
        `> ¿Eres chico o chica?\n\n` +
        `┃ 👨 *Masculino* / *Hombre* / *Chico* / *M*\n` +
        `┃ 👩 *Femenino* / *Mujer* / *Chica* / *F*\n\n` +
        `📩 Responde a este mensaje con tu respuesta`,
    );
    session.promptId = sent?.key?.id || session.promptId;
    return true;
  }

  if (session.step === "gender") {
    let gender = null;
    if (/^(masculino|hombre|chico|varon|varón|m|male|man|pria)$/i.test(lowText)) {
      gender = "Masculino";
    } else if (/^(femenino|mujer|chica|f|female|woman|wanita)$/i.test(lowText)) {
      gender = "Femenino";
    }
    if (!gender) {
      await m.reply(
        `❌ ¡Género no válido!\n\n` +
          `> Responde con: *Masculino* / *Hombre* / *Chico* / *M*\n` +
          `> O: *Femenino* / *Mujer* / *Chica* / *F*`,
      );
      return true;
    }
    session.gender = gender;
    session.step = "confirm";
    const sent = await sendPrompt(sock, m, buildConfirmation(session));
    session.promptId = sent?.key?.id || session.promptId;
    return true;
  }

  if (session.step === "revise_name") {
    const name = normalizeName(text);
    if (name.length < 2 || name.length > 30) {
      await m.reply(`❌ ¡El nombre debe tener 2-30 caracteres!`);
      return true;
    }
    session.name = name;
    session.step = "confirm";
    const sent = await sendPrompt(sock, m, buildConfirmation(session));
    session.promptId = sent?.key?.id || session.promptId;
    return true;
  }

  if (session.step === "revise_age") {
    const age = Number(text);
    if (!/^\d+$/.test(text) || Number.isNaN(age) || age < 1 || age > 100) {
      await m.reply(`❌ ¡Edad no válida!\n\n> Ingresa una edad entre *1 - 100* años`);
      return true;
    }
    session.age = age;
    session.step = "confirm";
    const sent = await sendPrompt(sock, m, buildConfirmation(session));
    session.promptId = sent?.key?.id || session.promptId;
    return true;
  }

  if (session.step === "revise_gender") {
    let gender = null;
    if (/^(masculino|hombre|chico|varon|varón|m|male|man|pria)$/i.test(lowText)) {
      gender = "Masculino";
    } else if (/^(femenino|mujer|chica|f|female|woman|wanita)$/i.test(lowText)) {
      gender = "Femenino";
    }
    if (!gender) {
      await m.reply(
        `❌ ¡Género no válido!\n\n` +
          `> Responde con: *Masculino* / *Hombre* / *Chico* / *M*\n` +
          `> O: *Femenino* / *Mujer* / *Chica* / *F*`,
      );
      return true;
    }
    session.gender = gender;
    session.step = "confirm";
    const sent = await sendPrompt(sock, m, buildConfirmation(session));
    session.promptId = sent?.key?.id || session.promptId;
    return true;
  }

  if (session.step === "confirm") {
    if (["revisar nombre", "cambiar nombre", "editar nombre"].includes(lowText)) {
      session.step = "revise_name";
      const sent = await sendPrompt(
        sock,
        m,
        `📛 *ʀᴇᴠɪsᴀʀ ɴᴏᴍʙʀᴇ*\n\n> Envía el nombre correcto.\n\n📩 Responde a este mensaje con tu nuevo nombre`,
      );
      session.promptId = sent?.key?.id || session.promptId;
      return true;
    }
    if (["revisar edad", "cambiar edad", "editar edad"].includes(lowText)) {
      session.step = "revise_age";
      const sent = await sendPrompt(
        sock,
        m,
        `🎂 *ʀᴇᴠɪsᴀʀ ᴇᴅᴀᴅ*\n\n> Envía la edad correcta.\n\n📌 La edad solo puede ser de *1 - 100* años\n📩 Responde a este mensaje con tu nueva edad`,
      );
      session.promptId = sent?.key?.id || session.promptId;
      return true;
    }
    if (
      ["revisar género", "revisar genero", "cambiar género", "editar género"].includes(lowText)
    ) {
      session.step = "revise_gender";
      const sent = await sendPrompt(
        sock,
        m,
        `👤 *ʀᴇᴠɪsᴀʀ ɢᴇɴᴇʀᴏ*\n\n> Elige el género correcto.\n\n` +
          `┃ 👨 *Masculino* / *Hombre* / *Chico* / *M*\n` +
          `┃ 👩 *Femenino* / *Mujer* / *Chica* / *F*\n\n` +
          `📩 Responde a este mensaje con tu respuesta`,
      );
      session.promptId = sent?.key?.id || session.promptId;
      return true;
    }
    if (["revisar", "repetir", "reset", "editar", "cambiar"].includes(lowText)) {
      await m.reply(
        `❌ ¡La revisión no es específica!\n\n> Responde: \`revisar nombre\`, \`revisar edad\`, o \`revisar género\``,
      );
      return true;
    }
    if (!["si", "sí", "yes", "sip", "ok", "confirm", "confirmar", "dale"].includes(lowText)) {
      await m.reply(
        `❌ ¡Respuesta no válida!\n\n> Responde: \`sí\`, \`revisar nombre\`, \`revisar edad\`, \`revisar género\`, o \`cancelar\``,
      );
      return true;
    }

    db.setUser(m.sender, {
      j2Registered: true,
      j2Name: session.name,
      j2Age: session.age,
      j2Gender: session.gender,
      j2RegisteredAt: new Date().toISOString(),
    });

    await db.save();
    clearJ2Session(m.sender);

    await sock.sendMessage(
      m.chat,
      {
        text:
          `☆══════════════════════★\n` +
          `🎉 *ʀᴇɢɪsᴛʀᴏ ᴇxɪᴛᴏsᴏ!* 🎉\n` +
          `☆══════════════════════★\n\n` +
          `¡Bienvenido a la sala de juegos, *${session.name}*!\n\n` +
          `${j2DataBlock(session.name, session.age, session.gender)}\n\n` +
          `🚀 ¡Ya puedes jugar y lucir tu nombre en los rankings!\n` +
          `> Usa \`${m.prefix}menugame\` para la lista de juegos\n` +
          `> ⚡ Credits: yosoyyo`,
        contextInfo: getJ2ContextInfo(),
      },
      { quoted: m },
    );

    await m.react("✅");
    return true;
  }

  return false;
}

export {
  pluginConfig as config,
  handler,
  j2RegAnswerHandler,
  clearJ2Session,
};