import { getDatabase } from "../../src/lib/ourin-database.js";

const pluginConfig = {
  name: "anticustom",
  alias: ["antiaddcustom", "customanti"],
  category: "group",
  description: "Crea AntiCustom mediante sesión de preguntas paso a paso",
  usage: ".anticustom <on/off/list/add/del/metode/cancel>",
  example: ".anticustom",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  isAdmin: true,
  isBotAdmin: true,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

if (!global.anticustomSessions) global.anticustomSessions = new Map();

const SESSION_TIMEOUT = 10 * 60 * 1000;

function normalizeRules(rules) {
  return Array.isArray(rules)
    ? rules.filter((rule) => rule && rule.pattern)
    : [];
}

function formatRule(rule, index) {
  const type = rule.type === "regex" ? "regex" : "contains";
  const action = rule.action || "remove";
  const title = rule.groupName || rule.name || "-";
  return `${index + 1}. *${title}*\n> pattern: \`${rule.pattern}\`\n> type: *${type}*\n> action: *${action}*`;
}

function getSessionKey(m) {
  return `${m.chat}:${m.sender}`;
}

function clearSession(sessionKey) {
  const session = global.anticustomSessions.get(sessionKey);
  if (session?.timeout) clearTimeout(session.timeout);
  global.anticustomSessions.delete(sessionKey);
}

function refreshSessionTimeout(sessionKey) {
  const session = global.anticustomSessions.get(sessionKey);
  if (!session) return;
  if (session.timeout) clearTimeout(session.timeout);
  session.timeout = setTimeout(() => {
    const current = global.anticustomSessions.get(sessionKey);
    if (current?.startedAt === session.startedAt) {
      global.anticustomSessions.delete(sessionKey);
    }
  }, SESSION_TIMEOUT);
}

function normalizeAction(action, fallback = "remove") {
  const value = String(action || fallback).toLowerCase();
  if (["kick", "remove", "delete", "hapus"].includes(value)) {
    return value === "delete" || value === "hapus" ? "remove" : value;
  }
  return fallback;
}

function formatAction(action) {
  return action === "kick" ? "expulsar miembro" : "borrar mensaje";
}

function parsePatternAnswer(text) {
  const raw = String(text || "").trim();
  if (!raw) return { error: "La respuesta está vacía." };

  if (/^regex\s*:/i.test(raw)) {
    const pattern = raw.replace(/^regex\s*:/i, "").trim();
    if (!pattern) return { error: "Regex vacío. Escribe después de `regex:`." };
    try {
      new RegExp(pattern, "i");
    } catch {
      return { error: "Regex no válido. Verifica el patrón." };
    }
    return {
      type: "regex",
      patterns: [pattern],
    };
  }

  const cleaned = raw.replace(/^contains\s*:/i, "").trim();
  const patterns = [
    ...new Set(
      cleaned
        .split(/\n|,/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];

  if (patterns.length === 0) {
    return { error: "Aún no tengo las palabras que quieres detectar." };
  }

  return {
    type: "contains",
    patterns,
  };
}

function buildSummary(session) {
  return (
    `> Título: *${session.title}*\n` +
    `> Tipo de detección: *${session.type}*\n` +
    `> Patrón: ${session.patterns.map((item) => `\`${item}\``).join(", ")}\n` +
    `> Acción: *${formatAction(session.action)}*`
  );
}

async function sendPrompt(sock, m, text) {
  const sent = await sock.sendMessage(m.chat, { text }, { quoted: m });
  return sent?.key?.id || null;
}

async function startWizard(m, sock, mode, isFirstSetup = false) {
  const sessionKey = getSessionKey(m);
  const existing = global.anticustomSessions.get(sessionKey);

  if (existing) {
    await m.reply(
      `⚠️ Todavía tienes una sesión AntiCustom sin terminar.\n\n` +
        `> Responde a la última pregunta del bot para continuar\n` +
        `> O cancela con \`${m.prefix}anticustom cancel\``,
    );
    return;
  }

  const session = {
    chat: m.chat,
    sender: m.sender,
    step: "title",
    title: "",
    type: "contains",
    patterns: [],
    action: normalizeAction(mode, "remove"),
    promptId: null,
    startedAt: Date.now(),
    timeout: null,
  };

  global.anticustomSessions.set(sessionKey, session);
  refreshSessionTimeout(sessionKey);

  const intro = isFirstSetup
    ? `🛡️ *Bienvenido a la configuración de AntiCustom*\n\n` +
      `Te ayudaré a crear AntiCustom por sesiones, paso a paso.\n\n` +
      `*El flujo:*\n` +
      `1. Define el título de la regla\n` +
      `2. Ingresa las palabras o patrones a detectar\n` +
      `3. Elige la acción al detectarlas\n` +
      `4. Confirma los detalles finales\n\n`
    : `🛡️ *Vamos a agregar una nueva regla AntiCustom*\n\n`;

  session.promptId = await sendPrompt(
    sock,
    m,
    intro +
      `*Pregunta 1/4*\n` +
      `¿Cuál es el título?\n\n` +
      `> Responde a este mensaje con el título de la regla que quieras\n` +
      `> Ejemplo: \`Anti Palabras Sucias\``,
  );
}

function buildGuideMessage(m, status, mode, rules) {
  return (
    `🛡️ *ᴀɴᴛɪᴄᴜsᴛᴏᴍ*\n\n` +
    `> Estado: *${status.toUpperCase()}*\n` +
    `> Modo por defecto: *${normalizeAction(mode).toUpperCase()}*\n` +
    `> Total reglas: *${rules.length}*\n\n` +
    `Si quieres agregar otro AntiCustom:\n` +
    `> \`${m.prefix}anticustom add\`\n\n` +
    `Si quieres cambiar el estado:\n` +
    `> \`${m.prefix}anticustom on\`\n` +
    `> \`${m.prefix}anticustom off\`\n\n` +
    `Si quieres ver o borrar reglas:\n` +
    `> \`${m.prefix}anticustom list\`\n` +
    `> \`${m.prefix}anticustom del <título>\`\n\n` +
    `Si quieres cambiar el modo por defecto:\n` +
    `> \`${m.prefix}anticustom metode kick\`\n` +
    `> \`${m.prefix}anticustom metode remove\``
  );
}

async function handler(m, { sock }) {
  const db = getDatabase();
  const args = m.args || [];
  const sub = args[0]?.toLowerCase();
  const groupData = db.getGroup(m.chat) || {};
  const rules = normalizeRules(groupData.anticustomRules);
  const mode = groupData.anticustomMode || "remove";
  const status = groupData.anticustom || "off";
  const sessionKey = getSessionKey(m);

  if (!sub) {
    if (rules.length === 0) {
      await startWizard(m, sock, mode, true);
      return;
    }

    await m.reply(buildGuideMessage(m, status, mode, rules));
    return;
  }

  if (sub === "add" || sub === "baru" || sub === "new" || sub === "buat") {
    await startWizard(m, sock, mode);
    return;
  }

  if (sub === "cancel" || sub === "cancelar") {
    if (!global.anticustomSessions.has(sessionKey)) {
      await m.reply("⚠️ No hay sesión AntiCustom en curso.");
      return;
    }
    clearSession(sessionKey);
    await m.reply("✅ Sesión AntiCustom cancelada.");
    return;
  }

  if (sub === "on") {
    db.setGroup(m.chat, { anticustom: "on" });
    await m.reply("✅ *AntiCustom activado*");
    return;
  }

  if (sub === "off") {
    db.setGroup(m.chat, { anticustom: "off" });
    await m.reply("❌ *AntiCustom desactivado*");
    return;
  }

  if (sub === "metode") {
    const action = normalizeAction(args[1], "");
    if (!action) {
      await m.reply(
        "❌ Usa: `.anticustom metode kick` o `.anticustom metode remove`",
      );
      return;
    }
    db.setGroup(m.chat, { anticustom: "on", anticustomMode: action });
    await m.reply(
      `✅ *El modo por defecto de AntiCustom ahora es ${action.toUpperCase()}*`,
    );
    return;
  }

  if (sub === "list") {
    if (rules.length === 0) {
      await m.reply("📋 Aún no hay reglas AntiCustom en este grupo.");
      return;
    }
    await m.reply(
      `📋 *ʟɪsᴛ ᴀɴᴛɪᴄᴜsᴛᴏᴍ*\n\n${rules.map(formatRule).join("\n\n")}`,
    );
    return;
  }

  if (sub === "del" || sub === "delete" || sub === "remove") {
    const name = args.slice(1).join(" ").trim().toLowerCase();
    if (!name) {
      await m.reply("❌ Formato: `.anticustom del <título>`");
      return;
    }

    const nextRules = rules.filter((rule) => {
      const ruleName = String(rule.name || "").toLowerCase();
      const groupName = String(rule.groupName || "").toLowerCase();
      return !(
        ruleName === name ||
        groupName === name ||
        ruleName.startsWith(`${name} #`)
      );
    });

    if (nextRules.length === rules.length) {
      await m.reply(`❌ Regla con título \`${name}\` no encontrada.`);
      return;
    }

    db.setGroup(m.chat, { anticustomRules: nextRules });
    await m.reply(`✅ Regla con título \`${name}\` eliminada exitosamente.`);
    return;
  }

  await m.reply(
    "❌ Subcomando no válido. Usa: on, off, list, add, del, metode, cancel",
  );
}

async function replyHandler(m, { sock }) {
  if (!m.quoted) return false;
  if (m.isCommand) return false;

  const sessionKey = getSessionKey(m);
  const session = global.anticustomSessions.get(sessionKey);
  if (!session) return false;
  if (session.chat !== m.chat || session.sender !== m.sender) return false;

  const quotedId = m.quoted?.id || m.quoted?.key?.id;
  if (!quotedId || quotedId !== session.promptId) return false;

  const text = String(m.body || "").trim();
  if (!text) return false;

  refreshSessionTimeout(sessionKey);

  if (session.step === "title") {
    if (text.length < 2 || text.length > 40) {
      await m.reply("❌ El título debe tener 2-40 caracteres.");
      return true;
    }

    session.title = text;
    session.step = "patterns";
    session.promptId = await sendPrompt(
      sock,
      m,
      `🛡️ *Pregunta 2/4*\n\n` +
        `Ok, el título es *${session.title}*.\n\n` +
        `Ahora, dame las palabras que quieras que detecte.\n\n` +
        `Puedes elegir uno de estos formatos:\n` +
        `> *Contains*: envía palabras separadas por coma o salto de línea\n` +
        `> *Regex*: empieza tu respuesta con \`regex:\`\n\n` +
        `Ejemplo contains:\n` +
        `> \`perro, estúpido, tonto\`\n\n` +
        `Ejemplo regex:\n` +
        `> \`regex: (anj|anjing|a+n+j+)\`\n\n` +
        `*Responde a este mensaje con tu respuesta*`,
    );
    return true;
  }

  if (session.step === "patterns") {
    const parsed = parsePatternAnswer(text);
    if (parsed.error) {
      await m.reply(`❌ ${parsed.error}`);
      return true;
    }

    session.type = parsed.type;
    session.patterns = parsed.patterns;
    session.step = "action";
    session.promptId = await sendPrompt(
      sock,
      m,
      `🛡️ *Pregunta 3/4*\n\n` +
        `Entonces quieres esto:\n` +
        `${session.patterns.map((item, index) => `${index + 1}. \`${item}\``).join("\n")}\n\n` +
        `> Tipo de detección: *${session.type}*\n\n` +
        `Ok, si el mensaje de un miembro contiene esas palabras, ¿quieres que *borre el mensaje* o que *expulse* al usuario?\n\n` +
        `*Responde a este mensaje con:* \`borrar\` o \`expulsar\``,
    );
    return true;
  }

  if (session.step === "action") {
    const action = normalizeAction(text, "");
    if (!action) {
      await m.reply("❌ Responde con `borrar` o `expulsar`.");
      return true;
    }

    session.action = action;
    session.step = "confirm";
    session.promptId = await sendPrompt(
      sock,
      m,
      `🛡️ *Pregunta 4/4*\n\n` +
        `Ok, aquí están los detalles que configuraste:\n\n` +
        `${buildSummary(session)}\n\n` +
        `¿Todo correcto?\n\n` +
        `*Responde a este mensaje con:* \`sí\` para guardar o \`cancelar\` para cancelar`,
    );
    return true;
  }

  if (session.step === "confirm") {
    if (/^(batal|cancel|tidak|nggak|ga|gak|no)$/i.test(text)) {
      clearSession(sessionKey);
      await m.reply(
        "✅ Ok, sesión AntiCustom cancelada. Si quieres empezar de nuevo, escribe `.anticustom add`.",
      );
      return true;
    }

    if (!/^(ya|iya|y|yes|oke|ok|setuju|gas|lanjut|sip|siap)$/i.test(text)) {
      await m.reply(
        "❌ Responde con `sí` para guardar o `cancelar` para cancelar.",
      );
      return true;
    }

    const db = getDatabase();
    const groupData = db.getGroup(m.chat) || {};
    const currentRules = normalizeRules(groupData.anticustomRules);
    const titleKey = session.title.toLowerCase();
    const filteredRules = currentRules.filter((rule) => {
      const ruleName = String(rule.name || "").toLowerCase();
      const groupName = String(rule.groupName || "").toLowerCase();
      return !(
        ruleName === titleKey ||
        groupName === titleKey ||
        ruleName.startsWith(`${titleKey} #`)
      );
    });

    const createdAt = new Date().toISOString();
    const generatedRules = session.patterns.map((pattern, index) => ({
      name:
        session.patterns.length === 1
          ? session.title
          : `${session.title} #${index + 1}`,
      groupName: session.title,
      pattern,
      type: session.type,
      action: session.action,
      flags: "i",
      createdAt,
    }));

    db.setGroup(m.chat, {
      anticustom: "on",
      anticustomMode: session.action,
      anticustomRules: [...filteredRules, ...generatedRules],
    });

    clearSession(sessionKey);

    await sock.sendMessage(
      m.chat,
      {
        text:
          `✅ *AntiCustom creado exitosamente*\n\n` +
          `${buildSummary(session)}\n\n` +
          `> Estado automático: *ON*\n` +
          `> Nuevas reglas: *${generatedRules.length}*\n\n` +
          `Si quieres ver la guía de nuevo, escribe \`${m.prefix}anticustom\``,
      },
      { quoted: m },
    );
    return true;
  }

  return false;
}

export { pluginConfig as config, handler, replyHandler };
