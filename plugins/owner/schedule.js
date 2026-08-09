import te from "../../src/lib/luffy-error.js";
/**
 * @file plugins/owner/schedule.js
 * @description Comando para gestionar mensajes programados
 * @author Lucky Archz, Keisya, hyuuSATAN
 * @version 1.1.0
 */

import {
  scheduleMessage,
  cancelScheduledMessage,
  getScheduledMessages,
  getSchedulerStatus,
  formatTimeRemaining,
  getMsUntilTime,
} from "../../src/lib/luffy-scheduler.js";
/**
 * Configuración del plugin
 */
const pluginConfig = {
  name: "schedule",
  alias: ["sched", "jadwal", "timer"],
  category: "owner",
  description: "Crear recordatorios o agendas libres con texto personalizado",
  usage:
    ".schedule <add/edit/list/kategori/preset/detail/del/status> [options]",
  example: ".schedule preset sekolah 06:30",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  carne: 0,
  isEnabled: true,
};

const repeatKeywords = new Set(["repeat", "daily", "diario"]);
const repeatOffKeywords = new Set([
  "once",
  "una vez",
  "off",
  "false",
  "no",
  "0",
]);

const presetTemplates = {
  escuela: {
    category: "escuela",
    title: "Ir a la escuela",
    customText: "Dúchate, desayuna, revisa los libros y sal a tiempo.",
    repeat: true,
    target: "me",
  },
  trabajo: {
    category: "trabajo",
    title: "Empezar a trabajar",
    customText: "Prepara el dispositivo, revisa las tareas y empieza a tiempo.",
    repeat: true,
    target: "me",
  },
  torneo: {
    category: "torneo",
    title: "Preparación del torneo",
    customText: "Revisa roster, sala, conexión y mantente listo antes de empezar el match.",
    repeat: false,
    target: "here",
  },
  cita: {
    category: "cita",
    title: "Cita programada",
    customText: "Prepárate, revisa la ubicación y llega puntual.",
    repeat: false,
    target: "me",
  },
};

const presetAliases = {
  school: "escuela",
  escuela: "escuela",
  work: "trabajo",
  trabajo: "trabajo",
  tournament: "torneo",
  torneo: "torneo",
  scrim: "torneo",
  date: "cita",
  ngedate: "cita",
  dating: "cita",
};

const formatClock = (hour, minute) =>
  `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

const truncateText = (text = "", max = 90) =>
  text.length > max ? `${text.slice(0, max)}...` : text;

const normalizeCategory = (value = "") => String(value).trim().toLowerCase();

const getTaskCategory = (task) => normalizeCategory(task.category) || "general";

const getTaskTitle = (task) => task.title || "Recordatorio";

const getTaskText = (task, fallback = "-") =>
  task.customText || task.message?.text || fallback;

const getTaskTargetLabel = (task) => task.targetLabel || task.jid;

function parseTimeString(value = "") {
  const normalized = String(value).trim().replace(/\./g, ":");
  const parts = normalized.split(":");

  if (parts.length !== 2) return null;

  const hour = Number(parts[0]);
  const minute = Number(parts[1]);

  if (
    !Number.isInteger(hour) ||
    !Number.isInteger(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }

  return { hour, minute, label: formatClock(hour, minute) };
}

function isRepeatToken(value = "") {
  return repeatKeywords.has(String(value).trim().toLowerCase());
}

function isRepeatOffToken(value = "") {
  return repeatOffKeywords.has(String(value).trim().toLowerCase());
}

function parseRepeatValue(value = "") {
  if (isRepeatToken(value)) return true;
  if (isRepeatOffToken(value)) return false;
  throw new Error(
    "❌ El valor de repeat debe ser uno de: repeat, daily, diario, once, off",
  );
}

function looksLikeTarget(value = "") {
  const normalized = String(value).trim().toLowerCase();
  const digits = normalized.replace(/[^0-9]/g, "");
  return (
    ["me", "self", "here", "this"].includes(normalized) ||
    normalized.includes("@") ||
    digits.length >= 5
  );
}

function resolveTarget(targetValue, m) {
  const raw = String(targetValue || "here").trim();
  const normalized = raw.toLowerCase();

  if (!raw || normalized === "here" || normalized === "this") {
    return {
      jid: m.chat,
      label: m.isGroup ? "here (este chat)" : "here (este chat privado)",
    };
  }

  if (normalized === "me" || normalized === "self") {
    return {
      jid: m.sender,
      label: "me",
    };
  }

  if (raw.includes("@")) {
    return {
      jid: raw,
      label: raw,
    };
  }

  const digits = raw.replace(/[^0-9]/g, "");

  if (!digits) {
    return {
      jid: m.chat,
      label: m.isGroup ? "here (este chat)" : "here (este chat privado)",
    };
  }

  return {
    jid: `${digits}@s.whatsapp.net`,
    label: `${digits}@s.whatsapp.net`,
  };
}

function extractTailOptions(
  m,
  parts,
  defaultTargetToken = "here",
  defaultRepeat = false,
) {
  const tail = [...parts];
  let targetToken = defaultTargetToken;
  let repeat = defaultRepeat;

  while (tail.length > 1) {
    const last = tail[tail.length - 1];

    if (isRepeatToken(last)) {
      repeat = true;
      tail.pop();
      continue;
    }

    if (isRepeatOffToken(last)) {
      repeat = false;
      tail.pop();
      continue;
    }

    if (looksLikeTarget(last)) {
      targetToken = tail.pop();
      continue;
    }

    break;
  }

  return {
    content: tail.join(" | ").trim(),
    target: resolveTarget(targetToken, m),
    repeat,
  };
}

function resolvePresetTemplate(name = "") {
  const normalized = normalizeCategory(name);
  const key = presetAliases[normalized] || normalized;

  if (!key || !presetTemplates[key]) {
    return { key: "", config: null };
  }

  return { key, config: presetTemplates[key] };
}

function getTaskState(task) {
  return {
    hour: task.hour,
    minute: task.minute,
    label: formatClock(task.hour, task.minute),
    category: getTaskCategory(task),
    title: getTaskTitle(task),
    customText: getTaskText(task, ""),
    repeat: Boolean(task.repeat),
    target: {
      jid: task.jid,
      label: getTaskTargetLabel(task),
    },
    mode: task.mode || "planner",
  };
}

function buildTaskPayload(id, parsed, extra = {}) {
  return {
    id,
    jid: parsed.target.jid,
    message: { text: parsed.customText },
    hour: parsed.hour,
    minute: parsed.minute,
    repeat: parsed.repeat,
    category: normalizeCategory(parsed.category) || "general",
    title: parsed.title || "Recordatorio",
    customText: parsed.customText,
    targetLabel: parsed.target.label,
    mode: parsed.mode || "planner",
    createdAt: extra.createdAt || null,
    ...(extra.meta || {}),
  };
}

function buildHelpText(m) {
  return `📅 *PLANIFICADOR DE AGENDA*

Esta función sirve para crear agendas o recordatorios libres.
Se puede usar para escuela, clases, trabajo, reuniones, citas, torneos o cualquier agenda.

El mensaje enviado seguirá el *texto personalizado* creado por el owner.

*Formato principal:*
\`.schedule add <HH:MM> | <categoría> | <título> | <mensaje> | [target] | [repeat]\`

*Editar agenda:*
\`.schedule edit <id> <HH:MM> | <categoría> | <título> | <mensaje> | [target] | [repeat]\`
\`.schedule edit <id> time=08:00 | text=reunión | repeat=off\`

*Filtrar por categoría:*
\`.schedule kategori\`
\`.schedule kategori escuela\`

*Presets rápidos:*
\`.schedule preset list\`
\`.schedule preset escuela 06:30\`
\`.schedule preset trabajo 09:00 | standup de la mañana | entrar a la sala | here | repeat\`

*Target opcional:*
• \`here\` = enviar a este chat
• \`me\` = enviar al propio chat del owner
• \`628xxx@s.whatsapp.net\` = enviar a un número específico

*Modo repeat opcional:*
• \`repeat\`
• \`daily\`
• \`diario\`

*Ejemplos:*
\`.schedule add 06:30 | escuela | ir a la escuela | dúchate, desayuna, revisa los libros | me | repeat\`
\`.schedule add 12:00 | trabajo | standup de equipo | entra a la sala a las 12 en punto | here | repeat\`
\`.schedule add 19:00 | cita | cena | no olvides llegar arreglado y puntual | me\`
\`.schedule add 20:00 | torneo | scrim nocturna | la sala se abre 15 min antes de empezar | here\`

*Subcomandos:*
• \`.schedule list\`
• \`.schedule kategori <nombre>\`
• \`.schedule preset <nombre> <HH:MM>\`
• \`.schedule edit <id> ...\`
• \`.schedule detail <id>\`
• \`.schedule del <id>\`
• \`.schedule status\`

*El formato antiguo sigue soportado:*
\`.schedule add 08:00 628xxx repeat Buenos días equipo\``;
}

function parsePlannerInput(m, args) {
  const timeInfo = parseTimeString(args[1]);

  if (!timeInfo) {
    throw new Error(
      "❌ Formato de hora incorrecto. Usa HH:MM o HH.MM, ejemplo: 08:00",
    );
  }

  const raw = args.slice(2).join(" ").trim();

  if (!raw) {
    throw new Error(
      "❌ Formato: `.schedule add <HH:MM> | <categoría> | <título> | <mensaje> | [target] | [repeat]`",
    );
  }

  if (!raw.includes("|")) {
    const target = resolveTarget(args[2], m);
    let repeat = false;
    let messageStart = 3;

    if (isRepeatToken(args[3])) {
      repeat = true;
      messageStart = 4;
    }

    const customText = args.slice(messageStart).join(" ").trim();

    if (!customText) {
      throw new Error("❌ El mensaje de la agenda no puede estar vacío");
    }

    return {
      ...timeInfo,
      category: "general",
      title: "Recordatorio",
      customText,
      repeat,
      target,
      mode: "legacy",
    };
  }

  const segments = raw
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);

  if (segments.length < 3) {
    throw new Error(
      "❌ El nuevo formato mínimo es: `.schedule add <HH:MM> | <categoría> | <título> | <mensaje>`",
    );
  }

  const category = normalizeCategory(segments[0]) || "general";
  const title = segments[1];
  const parsedTail = extractTailOptions(m, segments.slice(2));
  const customText = parsedTail.content;

  if (!customText) {
    throw new Error("❌ El contenido del recordatorio no puede estar vacío");
  }

  return {
    ...timeInfo,
    category,
    title,
    customText,
    repeat: parsedTail.repeat,
    target: parsedTail.target,
    mode: "planner",
  };
}

function parsePresetInput(m, args) {
  const { key, config } = resolvePresetTemplate(args[1]);

  if (!config) {
    throw new Error(
      "❌ Preset desconocido. Usa `.schedule preset list` para ver los presets disponibles.",
    );
  }

  const timeInfo = parseTimeString(args[2]);

  if (!timeInfo) {
    throw new Error(
      "❌ Formato: `.schedule preset <nombre> <HH:MM> [| <título> | <mensaje> | [target] | [repeat]]`",
    );
  }

  const raw = args.slice(3).join(" ").trim();
  let title = config.title;
  let customText = config.customText;
  let repeat = config.repeat;
  let target = resolveTarget(config.target, m);

  if (raw) {
    const segments = raw
      .split("|")
      .map((part) => part.trim())
      .filter(Boolean);

    if (segments.length === 1) {
      customText = segments[0];
    } else if (segments.length > 1) {
      title = segments[0] || title;
      const parsedTail = extractTailOptions(
        m,
        segments.slice(1),
        config.target,
        config.repeat,
      );

      customText = parsedTail.content || customText;
      repeat = parsedTail.repeat;
      target = parsedTail.target;
    }
  }

  return {
    ...timeInfo,
    category: config.category,
    title,
    customText,
    repeat,
    target,
    mode: "preset",
    presetKey: key,
  };
}

function parseEditInput(m, args, task) {
  const raw = args.slice(2).join(" ").trim();

  if (!raw) {
    throw new Error(
      "❌ Formato de edición: `.schedule edit <id> <HH:MM> | <categoría> | <título> | <mensaje> | [target] | [repeat]` o `.schedule edit <id> time=08:00 | text=... | repeat=off`",
    );
  }

  if (!raw.includes("=")) {
    const parsed = parsePlannerInput(m, ["add", ...args.slice(2)]);
    return {
      ...parsed,
      mode: task.mode || parsed.mode,
    };
  }

  const state = getTaskState(task);
  const segments = raw
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);

  if (!segments.length) {
    throw new Error("❌ No hay ningún campo que editar.");
  }

  for (const segment of segments) {
    const separatorIndex = segment.indexOf("=");

    if (separatorIndex === -1) {
      throw new Error(
        "❌ El formato de edición parcial debe ser `campo=valor`, ejemplo: `time=08:00 | text=reunión`",
      );
    }

    const field = normalizeCategory(segment.slice(0, separatorIndex));
    const value = segment.slice(separatorIndex + 1).trim();

    if (!value) {
      throw new Error(`❌ El valor del campo \`${field}\` no puede estar vacío`);
    }

    switch (field) {
      case "time":
      case "hora": {
        const timeInfo = parseTimeString(value);

        if (!timeInfo) {
          throw new Error(
            "❌ Formato de hora de edición incorrecto. Usa HH:MM o HH.MM",
          );
        }

        state.hour = timeInfo.hour;
        state.minute = timeInfo.minute;
        state.label = timeInfo.label;
        break;
      }
      case "category":
      case "categoria":
      case "categoría":
        state.category = normalizeCategory(value) || "general";
        break;
      case "title":
      case "titulo":
      case "título":
        state.title = value;
        break;
      case "text":
      case "message":
      case "msg":
        state.customText = value;
        break;
      case "target":
      case "jid":
        state.target = resolveTarget(value, m);
        break;
      case "repeat":
        state.repeat = parseRepeatValue(value);
        break;
      default:
        throw new Error(
          "❌ Campo de edición desconocido. Usa: time, categoria, titulo, text, target, repeat",
        );
    }
  }

  if (!state.customText) {
    throw new Error("❌ El contenido del recordatorio no puede estar vacío");
  }

  return state;
}

function findTaskById(taskId) {
  return getScheduledMessages().find((task) => task.id === taskId) || null;
}

function buildCategoryListText(tasks) {
  const categoryCounts = tasks.reduce((accumulator, task) => {
    const category = getTaskCategory(task);
    accumulator.set(category, (accumulator.get(category) || 0) + 1);
    return accumulator;
  }, new Map());

  const entries = [...categoryCounts.entries()].sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
  );

  let text = "🏷️ *CATEGORÍAS DE AGENDA ACTIVAS*\n\n";

  for (const [category, total] of entries) {
    text += `• ${category} (${total})\n`;
  }

  text += "\nUsa `.schedule kategori <nombre>` para filtrar la lista de agendas.";
  return text;
}

function buildPresetListText() {
  let text = "⚡ *PRESETS RÁPIDOS DE AGENDA*\n\n";

  for (const [name, preset] of Object.entries(presetTemplates)) {
    text += `• *${name}*\n`;
    text += `  📝 ${preset.title}\n`;
    text += `  🔄 ${preset.repeat ? "Diario" : "Una vez"}\n`;
    text += `  📍 Target predeterminado: ${preset.target}\n`;
    text += `  💬 ${truncateText(preset.customText, 100)}\n\n`;
  }

  text += "Usar:\n";
  text += "`.schedule preset escuela 06:30`\n";
  text +=
    "`.schedule preset trabajo 09:00 | standup de la mañana | entrar a la sala | here | repeat`";
  return text;
}

function buildListText(tasks, header = null) {
  const sorted = [...tasks].sort(
    (a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute),
  );
  let text = `${header || `📅 *SCHEDULE PLANNER (${sorted.length})*`}\n\n`;

  for (const task of sorted) {
    const msUntil = getMsUntilTime(task.hour, task.minute);
    text += `• *${getTaskTitle(task)}*\n`;
    text += `  🆔 ${task.id}\n`;
    text += `  🏷️ ${getTaskCategory(task)}\n`;
    text += `  ⏰ ${formatClock(task.hour, task.minute)} GMT+7\n`;
    text += `  📍 ${getTaskTargetLabel(task)}\n`;
    text += `  🔄 ${task.repeat ? "Diario" : "Una vez"}\n`;
    text += `  🕕 ${formatTimeRemaining(msUntil)} restante\n`;
    text += `  📝 ${truncateText(getTaskText(task))}\n\n`;
  }

  return text.trim();
}

function buildDetailText(task) {
  const msUntil = getMsUntilTime(task.hour, task.minute);
  return `📌 *DETALLE DE LA AGENDA*

🆔 ID: \`${task.id}\`
🏷️ Categoría: ${getTaskCategory(task)}
📝 Título: ${getTaskTitle(task)}
⏰ Hora: ${formatClock(task.hour, task.minute)} GMT+7
📍 Target: ${getTaskTargetLabel(task)}
🔄 Modo: ${task.repeat ? "Diario" : "Una vez"}
🕕 Próxima ejecución: ${formatTimeRemaining(msUntil)} restante
🗓️ Creada: ${task.createdAt || "-"}

Mensaje personalizado:
${getTaskText(task)}`;
}

/**
 * Handler para el comando schedule
 */
async function handler(m, { sock, args }) {
  const subCommand = args[0]?.toLowerCase();

  if (!subCommand || ["help", "menu"].includes(subCommand)) {
    await m.reply(buildHelpText(m));
    return;
  }

  switch (subCommand) {
    case "add": {
      try {
        const parsed = parsePlannerInput(m, args);
        const id = `sched_${Date.now()}`;

        await scheduleMessage(buildTaskPayload(id, parsed), sock);

        const msUntil = getMsUntilTime(parsed.hour, parsed.minute);

        await m.reply(`✅ *AGENDA CREADA CON ÉXITO*

🆔 ID: \`${id}\`
🏷️ Categoría: ${parsed.category}
📝 Título: ${parsed.title}
⏰ Hora: ${parsed.label} GMT+7
📍 Target: ${parsed.target.label}
🔄 Modo: ${parsed.repeat ? "Diario" : "Una vez"}
🕕 Próxima ejecución: ${formatTimeRemaining(msUntil)} restante

Texto personalizado:
${truncateText(parsed.customText, 180)}`);
      } catch (error) {
        await m.reply(
          error.message?.startsWith("❌")
            ? error.message
            : te(m.prefix, m.command, m.pushName),
        );
      }
      break;
    }

    case "preset": {
      if (!args[1] || ["list", "all"].includes(normalizeCategory(args[1]))) {
        await m.reply(buildPresetListText());
        return;
      }

      try {
        const parsed = parsePresetInput(m, args);
        const id = `sched_${Date.now()}`;

        await scheduleMessage(
          buildTaskPayload(id, parsed, {
            meta: { presetKey: parsed.presetKey },
          }),
          sock,
        );

        const msUntil = getMsUntilTime(parsed.hour, parsed.minute);

        await m.reply(`✅ *PRESET DE AGENDA CREADO CON ÉXITO*

🆔 ID: \`${id}\`
⚡ Preset: ${parsed.presetKey}
🏷️ Categoría: ${parsed.category}
📝 Título: ${parsed.title}
⏰ Hora: ${parsed.label} GMT+7
📍 Target: ${parsed.target.label}
🔄 Modo: ${parsed.repeat ? "Diario" : "Una vez"}
🕕 Próxima ejecución: ${formatTimeRemaining(msUntil)} restante

Texto personalizado:
${truncateText(parsed.customText, 180)}`);
      } catch (error) {
        await m.reply(
          error.message?.startsWith("❌")
            ? error.message
            : te(m.prefix, m.command, m.pushName),
        );
      }
      break;
    }

    case "edit": {
      const taskId = args[1];

      if (!taskId) {
        await m.reply("❌ Formato: `.schedule edit <id> ...`");
        return;
      }

      const task = findTaskById(taskId);

      if (!task) {
        await m.reply(`❌ No se encontró la agenda con ID \`${taskId}\``);
        return;
      }

      try {
        const parsed = parseEditInput(m, args, task);

        await scheduleMessage(
          buildTaskPayload(task.id, parsed, {
            createdAt: task.createdAt,
            meta: { presetKey: task.presetKey || null },
          }),
          sock,
        );

        const msUntil = getMsUntilTime(parsed.hour, parsed.minute);

        await m.reply(`✅ *AGENDA ACTUALIZADA CON ÉXITO*

🆔 ID: \`${task.id}\`
🏷️ Categoría: ${parsed.category}
📝 Título: ${parsed.title}
⏰ Hora: ${parsed.label} GMT+7
📍 Target: ${parsed.target.label}
🔄 Modo: ${parsed.repeat ? "Diario" : "Una vez"}
🕕 Próxima ejecución: ${formatTimeRemaining(msUntil)} restante

Texto personalizado:
${truncateText(parsed.customText, 180)}`);
      } catch (error) {
        await m.reply(
          error.message?.startsWith("❌")
            ? error.message
            : te(m.prefix, m.command, m.pushName),
        );
      }
      break;
    }

    case "list": {
      const tasks = getScheduledMessages();

      if (tasks.length === 0) {
        await m.reply(
          "📅 Aún no hay agendas activas. Usa `.schedule` para ver el formato del planificador.",
        );
        return;
      }

      await m.reply(buildListText(tasks));
      break;
    }

    case "kategori":
    case "category":
    case "categoria":
    case "categoría": {
      const tasks = getScheduledMessages();

      if (tasks.length === 0) {
        await m.reply(
          "📅 Aún no hay agendas activas. Usa `.schedule` para ver el formato del planificador.",
        );
        return;
      }

      const categoryName = normalizeCategory(args.slice(1).join(" "));

      if (!categoryName) {
        await m.reply(buildCategoryListText(tasks));
        return;
      }

      const filteredTasks = tasks.filter(
        (task) => getTaskCategory(task) === categoryName,
      );

      if (!filteredTasks.length) {
        await m.reply(
          `❌ No hay agendas activas para la categoría \`${categoryName}\``,
        );
        return;
      }

      await m.reply(
        buildListText(
          filteredTasks,
          `🏷️ *CATEGORÍA: ${categoryName.toUpperCase()} (${filteredTasks.length})*`,
        ),
      );
      break;
    }

    case "detail":
    case "show":
    case "view": {
      const taskId = args[1];

      if (!taskId) {
        await m.reply("❌ Formato: `.schedule detail <id>`");
        return;
      }

      const task = findTaskById(taskId);

      if (!task) {
        await m.reply(`❌ No se encontró la agenda con ID \`${taskId}\``);
        return;
      }

      await m.reply(buildDetailText(task));
      break;
    }

    case "del":
    case "delete":
    case "remove": {
      const taskId = args[1];

      if (!taskId) {
        await m.reply("❌ Formato: `.schedule del <id>`");
        return;
      }

      const existingTask = findTaskById(taskId);
      const cancelled = cancelScheduledMessage(taskId);

      if (cancelled) {
        await m.reply(
          `✅ Agenda \`${taskId}\` eliminada${existingTask?.title ? `\n\n📝 ${existingTask.title}` : ""}`,
        );
      } else {
        await m.reply(`❌ No se encontró la agenda \`${taskId}\``);
      }
      break;
    }

    case "status": {
      const status = getSchedulerStatus();
      const tasks = getScheduledMessages();
      const categories = [
        ...new Set(tasks.map((task) => getTaskCategory(task))),
      ];

      const text = `📊 *ESTADO DEL PLANIFICADOR DE AGENDA*

📝 Agendas activas: ${status.scheduledMessagesCount}
🏷️ Categorías activas: ${categories.length ? categories.join(", ") : "-"}
📨 Recordatorios enviados: ${status.totalMessagesSent}
🔄 Reset del límite diario: ${status.dailyResetEnabled ? "✅ Activo" : "❌ Inactivo"}
📅 Último reset: ${status.lastLimitReset}

Usa \`.schedule list\` para ver todas las agendas activas.`;

      await m.reply(text);
      break;
    }

    default:
      await m.reply(
        "❌ Subcomando desconocido. Usa: add, edit, list, kategori, preset, detail, del, status",
      );
  }
}

export { pluginConfig as config, handler };
