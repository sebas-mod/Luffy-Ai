import fs from "fs";
import path from "path";
import { getDatabase } from "../../src/lib/luffy-database.js";
import { getAssetBuffer } from "../../src/lib/luffy-asset-manager.js";
import {
  getCachedJid,
  isLid,
  isLidConverted,
  lidToJid,
} from "../../src/lib/luffy-lid.js";
import config from "../../config.js";

const pluginConfig = {
  name: "registrar",
  alias: ["register", "reg"],
  category: "user",
  description: "Regístrate como usuario del bot mediante una sesión de respuestas interactiva",
  usage: ".registrar",
  example: ".registrar",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  carne: 0,
  isEnabled: true,
  skipRegistration: true,
};

if (!global.registrationSessions) global.registrationSessions = {};

const SESSION_TIMEOUT = 300000;
const DEFAULT_REWARDS = { berry: 30000, carne: 300, exp: 300000 };
const REGISTRATION_IMAGE_CANDIDATES = [
  "luffy-daftar",
  "luffy",
];

function getRegistrationContextInfo() {
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

function getRegistrationRequired(db) {
  return (
    db.setting("registrationRequired") ?? config.registration?.enabled ?? false
  );
}

function getRegistrationRewards() {
  return config.registration?.rewards || DEFAULT_REWARDS;
}

async function getRegistrationImage() {
  const { getCachedThumb } = await import("../../src/lib/luffy-serialize.js");
  for (const key of REGISTRATION_IMAGE_CANDIDATES) {
    const buf = getAssetBuffer(key);
    if (buf) return buf;
  }

  return null;
}

function normalizeRegistrationName(input) {
  return String(input || "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeSessionText(input) {
  return String(input || "")
    .trim()
    .toLowerCase();
}

function shouldBypassRegistrationAnswer(m) {
  if (!m?.isCommand) return false;
  const command = String(m.command || "").toLowerCase();
  return ["registrar", "register", "reg", "cancelar_registro"].includes(command);
}

function getRegistrationSessionKey(jid) {
  let normalized = String(jid || "").trim();
  if (!normalized) return "";
  if (isLid(normalized) || isLidConverted(normalized)) {
    normalized = getCachedJid(normalized) || lidToJid(normalized) || normalized;
  }
  const digits = normalized.replace(/[^0-9]/g, "");
  return digits || normalized.toLowerCase();
}

function getRegistrationSessionEntry(jid) {
  const sessionKey = getRegistrationSessionKey(jid);
  if (sessionKey && global.registrationSessions?.[sessionKey]) {
    return {
      key: sessionKey,
      session: global.registrationSessions[sessionKey],
    };
  }
  const legacyKey = String(jid || "").trim();
  if (legacyKey && global.registrationSessions?.[legacyKey]) {
    return { key: legacyKey, session: global.registrationSessions[legacyKey] };
  }
  return { key: sessionKey, session: null };
}

function clearRegistrationSession(jid) {
  const { key, session } = getRegistrationSessionEntry(jid);
  if (!session) return false;
  if (session.timeout) clearTimeout(session.timeout);
  delete global.registrationSessions[key];
  return true;
}

function createRegistrationSession(jid, chatJid) {
  const sessionKey = getRegistrationSessionKey(jid);
  clearRegistrationSession(sessionKey);

  const session = {
    step: "name",
    name: null,
    age: null,
    gender: null,
    chatJid,
    promptId: null,
    startedAt: Date.now(),
    timeout: setTimeout(() => {
      if (global.registrationSessions[sessionKey]) {
        delete global.registrationSessions[sessionKey];
      }
    }, SESSION_TIMEOUT),
  };

  global.registrationSessions[sessionKey] = session;
  return session;
}

function getQuotedMessageId(m) {
  return m.quoted?.id || m.quoted?.stanzaId || m.quoted?.key?.id || null;
}

function isReplyToSessionPrompt(m, session) {
  const quotedId = getQuotedMessageId(m);
  if (!session || m.chat !== session.chatJid || !m.quoted) return false;
  if (quotedId && session.promptId && quotedId === session.promptId)
    return true;
  if (m.quoted?.key?.fromMe) return true;
  return false;
}

async function sendRegistrationPrompt(sock, m, text, options = {}) {
  const image = options.useImage ? await getRegistrationImage() : null;
  if (image) {
    return await sock.sendMessage(
      m.chat,
      {
        image,
        caption: text,
        contextInfo: getRegistrationContextInfo(),
      },
      { quoted: m },
    );
  } else {
    return await m.reply(text);
  }
}

function buildRewardPreview(user) {
  const rewards = getRegistrationRewards();

  if (user?.hasClaimedRegisterReward) {
    return `🎁 *Estado del Bonus*\n> Ya reclamaste el bonus de primer registro\n> Registrarse de nuevo no da recompensa otra vez`;
  }

  return `🎁 *Bonus de Primer Registro*\n> 💰 +${rewards.berry.toLocaleString("id-ID")} Berry\n> ⚡ +${rewards.carne} Energía\n> ⭐ +${rewards.exp.toLocaleString("id-ID")} EXP`;
}

function buildConfirmationRewardBlock(user) {
  const rewards = getRegistrationRewards();

  if (user?.hasClaimedRegisterReward) {
    return `☽◯☾ ♰ 「 🎁 *ʙᴏɴᴜs* 」\n┃ El bonus de primer registro ya fue reclamado\n┃ Registrarse de nuevo no da recompensa otra vez\n╰━ ⊱༺༒༻⊰ ━╯`;
  }

  return `☽◯☾ ♰ 「 🎁 *ʀᴇᴡᴀʀᴅs* 」\n┃ 💰 +${rewards.berry.toLocaleString("id-ID")} Berry\n┃ ⚡ +${rewards.carne} Energía\n┃ ⭐ +${rewards.exp.toLocaleString("id-ID")} EXP\n╰━ ⊱༺༒༻⊰ ━╯`;
}

function buildSuccessRewardBlock(alreadyClaimedReward) {
  const rewards = getRegistrationRewards();

  if (alreadyClaimedReward) {
    return `☽◯☾ ♰ 「 🎁 *ʙᴏɴᴜs* 」\n┃ El bonus de registro ya fue reclamado\n┃ No hay recompensa adicional esta vez\n╰━ ⊱༺༒༻⊰ ━╯`;
  }

  return `☽◯☾ ♰ 「 🎁 *ʀᴇᴡᴀʀᴅs* 」\n┃ 💰 +${rewards.berry.toLocaleString("id-ID")} Berry\n┃ ⚡ +${rewards.carne} Energía\n┃ ⭐ +${rewards.exp.toLocaleString("id-ID")} EXP\n╰━ ⊱༺༒༻⊰ ━╯`;
}

function buildUserDataBlock(name, age, gender) {
  return (
    `☽◯☾ ♰ 「 📋 *ᴅᴀᴛᴏs* 」\n` +
    `┃ 📛 Nombre: *${name || "-"}*\n` +
    `┃ 🎂 Edad: *${age ? `${age} años` : "-"}*\n` +
    `┃ 👤 Género: *${gender || "-"}*\n` +
    `╰━ ⊱༺༒༻⊰ ━╯`
  );
}

function buildWelcomeMessage(user, registrationRequired, prefix) {
  const benefits = [
    `🗂️ Tus datos de cuenta se guardan de forma más ordenada`,
    `${buildRewardPreview(user)}`,
  ];

  if (registrationRequired) {
    benefits.splice(
      1,
      0,
      `🔓 Después de registrarte podrás acceder a todos los comandos`,
    );
  }

  return (
    `👋 *ʙɪᴇɴᴠᴇɴɪᴅᴏ ᴀʟ ᴍᴇɴᴜ ᴅᴇ ʀᴇɢɪsᴛʀᴏ*\n\n` +
    `✨ Con el registro, tus datos de cuenta son más seguros y la experiencia con el bot es más completa.\n\n` +
    `🌟 *Beneficios del Registro*\n` +
    `${benefits.map((item) => `> ${item}`).join("\n")}\n\n` +
    `📝 *Pregunta 1/4*\n` +
    `> ¿Cómo te llamas?\n\n` +
    `📌 *Es obligatorio responder a este mensaje*\n` +
    `> Para cancelar: responde \`cancelar\` o escribe \`${prefix}bataldaftar\``
  );
}

function buildConfirmationPrompt(session, user) {
  return (
    `✅ *ᴘʀᴇɢᴜɴᴛᴀ 4/4*\n\n` +
    `¿Son correctos los siguientes datos?\n\n` +
    `${buildUserDataBlock(session.name, session.age, session.gender)}\n\n` +
    `${buildConfirmationRewardBlock(user)}\n\n` +
    `🛠️ Si algo está mal, puedes revisar cada parte.\n\n` +
    `*Responde a este mensaje con:*\n` +
    `> \`sí\` para guardar\n` +
    `> \`revisar nombre\` para cambiar el nombre\n` +
    `> \`revisar edad\` para cambiar la edad\n` +
    `> \`revisar género\` para cambiar el género\n` +
    `> \`cancelar\` para cancelar`
  );
}

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (user?.isRegistered) {
    return m.reply(
      `✅ ¡Ya estás registrado!\n\n` +
      `${buildUserDataBlock(user.regName, user.regAge, user.regGender)}\n\n` +
      `> Para desregistrarte: \`${m.prefix}desregistrar\``,
    );
  }

  if (getRegistrationSessionEntry(m.sender).session) {
    return m.reply(
      `📝 ¡Aún hay una sesión de registro activa!\n\n` +
      `> Responde al último mensaje del bot para continuar\n` +
      `> O escribe: \`${m.prefix}cancelar_registro\``,
    );
  }

  const session = createRegistrationSession(m.sender, m.chat);
  const sent = await sendRegistrationPrompt(
    sock,
    m,
    buildWelcomeMessage(user, getRegistrationRequired(db), m.prefix),
    { useImage: true },
  );

  session.promptId = sent?.key?.id || null;

  await m.react("📝");
}

async function registrationAnswerHandler(m, sock) {
  if (!m.body) return false;
  if (shouldBypassRegistrationAnswer(m)) return false;

  const { session } = getRegistrationSessionEntry(m.sender);
  if (!session) return false;
  if (m.chat !== session.chatJid) return false;

  const text = m.body.trim();
  const lowText = normalizeSessionText(text);
  const db = getDatabase();

  if (["cancelar", "cancela", "cancel"].includes(lowText)) {
    clearRegistrationSession(m.sender);
    await m.reply(
      `❌ Registro cancelado.\n\n> Vuelve a empezar con: \`${m.prefix}registrar\``,
    );
    return true;
  }

  if (session.step === "name") {
    const name = normalizeRegistrationName(text);

    if (name.length < 2 || name.length > 30) {
      await m.reply(`❌ ¡El nombre debe tener 2-30 caracteres!`);
      return true;
    }

    session.name = name;
    session.step = "age";

    const sent = await sendRegistrationPrompt(
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
      await m.reply(
        `❌ ¡Edad no válida!\n\n> Ingresa una edad entre *1 - 100* años`,
      );
      return true;
    }

    session.age = age;
    session.step = "gender";

    const sent = await sendRegistrationPrompt(
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

    const user = db.getUser(m.sender) || {};
    const sent = await sendRegistrationPrompt(
      sock,
      m,
      buildConfirmationPrompt(session, user),
    );

    session.promptId = sent?.key?.id || session.promptId;
    return true;
  }

  if (session.step === "revise_name") {
    const name = normalizeRegistrationName(text);

    if (name.length < 2 || name.length > 30) {
      await m.reply(`❌ ¡El nombre debe tener 2-30 caracteres!`);
      return true;
    }

    session.name = name;
    session.step = "confirm";

    const user = db.getUser(m.sender) || {};
    const sent = await sendRegistrationPrompt(
      sock,
      m,
      buildConfirmationPrompt(session, user),
    );

    session.promptId = sent?.key?.id || session.promptId;
    return true;
  }

  if (session.step === "revise_age") {
    const age = Number(text);

    if (!/^\d+$/.test(text) || Number.isNaN(age) || age < 1 || age > 100) {
      await m.reply(
        `❌ ¡Edad no válida!\n\n> Ingresa una edad entre *1 - 100* años`,
      );
      return true;
    }

    session.age = age;
    session.step = "confirm";

    const user = db.getUser(m.sender) || {};
    const sent = await sendRegistrationPrompt(
      sock,
      m,
      buildConfirmationPrompt(session, user),
    );

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

    const user = db.getUser(m.sender) || {};
    const sent = await sendRegistrationPrompt(
      sock,
      m,
      buildConfirmationPrompt(session, user),
    );

    session.promptId = sent?.key?.id || session.promptId;
    return true;
  }

  if (session.step === "confirm") {
    if (["revisar nombre", "cambiar nombre", "editar nombre"].includes(lowText)) {
      session.step = "revise_name";

      const sent = await sendRegistrationPrompt(
        sock,
        m,
        `📛 *ʀᴇᴠɪsᴀʀ ɴᴏᴍʙʀᴇ*\n\n` +
        `> Envía el nombre correcto.\n\n` +
        `📩 Responde a este mensaje con tu nuevo nombre`,
      );

      session.promptId = sent?.key?.id || session.promptId;
      return true;
    }

    if (
      ["revisar edad", "cambiar edad", "editar edad"].includes(lowText)
    ) {
      session.step = "revise_age";

      const sent = await sendRegistrationPrompt(
        sock,
        m,
        `🎂 *ʀᴇᴠɪsᴀʀ ᴇᴅᴀᴅ*\n\n` +
        `> Envía la edad correcta.\n\n` +
        `📌 La edad solo puede ser de *1 - 100* años\n` +
        `📩 Responde a este mensaje con tu nueva edad`,
      );

      session.promptId = sent?.key?.id || session.promptId;
      return true;
    }

    if (
      ["revisar género", "revisar genero", "cambiar género", "editar género"].includes(
        lowText,
      )
    ) {
      session.step = "revise_gender";

      const sent = await sendRegistrationPrompt(
        sock,
        m,
        `👤 *ʀᴇᴠɪsᴀʀ ɢᴇɴᴇʀᴏ*\n\n` +
        `> Elige el género correcto.\n\n` +
        `┃ 👨 *Masculino* / *Hombre* / *Chico* / *M*\n` +
        `┃ 👩 *Femenino* / *Mujer* / *Chica* / *F*\n\n` +
        `📩 Responde a este mensaje con tu respuesta`,
      );

      session.promptId = sent?.key?.id || session.promptId;
      return true;
    }

    if (
      ["revisar", "repetir", "reset", "editar", "cambiar"].includes(lowText)
    ) {
      await m.reply(
        `❌ ¡La revisión no es específica!\n\n` +
        `> Responde: \`revisar nombre\`, \`revisar edad\`, o \`revisar género\``,
      );
      return true;
    }

    if (!["si", "sí", "yes", "sip", "ok", "confirm", "confirmar", "dale"].includes(lowText)) {
      await m.reply(
        `❌ ¡Respuesta no válida!\n\n> Responde: \`sí\`, \`revisar nombre\`, \`revisar edad\`, \`revisar género\`, o \`cancelar\``,
      );
      return true;
    }

    const currentUser = db.getUser(m.sender) || {};
    const rewards = getRegistrationRewards();
    const alreadyClaimedReward = Boolean(currentUser.hasClaimedRegisterReward);
    const now = new Date().toISOString();
    const registrationCount = Number(currentUser.registrationCount || 0) + 1;
    const finalName = session.name;
    const finalAge = session.age;
    const finalGender = session.gender;

    db.setUser(m.sender, {
      isRegistered: true,
      regName: finalName,
      regAge: finalAge,
      regGender: finalGender,
      registeredAt: currentUser.registeredAt || now,
      lastRegisteredAt: now,
      registrationCount,
      hasClaimedRegisterReward: true,
      unregisteredAt: null,
    });

    if (!alreadyClaimedReward) {
      db.updateBerry(m.sender, rewards.berry);
      db.updateCarne(m.sender, rewards.carne);
      db.updateExp(m.sender, rewards.exp);
    }

    await db.save();
    clearRegistrationSession(m.sender);

    await sock.sendMessage(
      m.chat,
      {
        text:
          `🎉 *ʀᴇɢɪsᴛʀᴏ ᴇxɪᴛᴏsᴏ!*\n\n` +
          `¡Bienvenido, *${finalName}*!\n\n` +
          `${buildUserDataBlock(finalName, finalAge, finalGender)}\n\n` +
          `${buildSuccessRewardBlock(alreadyClaimedReward)}\n\n` +
          `🚀 ¡Ahora ya estás listo para usar el bot!`,
        contextInfo: getRegistrationContextInfo(),
      },
      { quoted: m },
    );

    await m.react("🎉");
    return true;
  }

  return false;
}

export {
  pluginConfig as config,
  handler,
  registrationAnswerHandler,
  clearRegistrationSession,
};
