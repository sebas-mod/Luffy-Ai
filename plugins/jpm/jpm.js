import { getDatabase } from "../../src/lib/ourin-database.js";
import { fetchGroupsSafe } from "../../src/lib/ourin-jpm-helper.js";
import {
  getAutoJpmConfig,
  setAutoJpmConfig,
  startAutoJpmScheduler,
  stopAutoJpmScheduler,
  getAutoJpmStorageDir,
} from "../../src/lib/ourin-auto-jpm.js";
import { getMimeType, getExtension } from "../../src/lib/ourin-utils.js";
import * as timeHelper from "../../src/lib/ourin-time.js";
import {
  getBinaryNodeChild,
  prepareWAMessageMedia,
  generateWAMessageFromContent,
  proto,
} from "ourin";
import config from "../../config.js";
import te from "../../src/lib/ourin-error.js";
import { saluranCtx } from "../../src/lib/ourin-context.js";
import util from "util";
import axios from "axios";
import path from "path";
import fs from "fs";
import { getAssetBuffer } from "../../src/lib/ourin-asset-manager.js";

const pluginConfig = {
  name: "jpm",
  alias: [
    "jasher",
    "jaser",
    "jpmht",
    "jpmhidetag",
    "jpmch",
    "jpmchannel",
    "autojpm",
    "autojasher",
    "stopjpm",
    "stopjasher",
    "setdelayjpm",
    "delayjpm",
    "jedajpm",
    "setjedajpm",
    "jpmupdate",
    "updatejpm",
    "broadcastupdate",
    "blacklistjpm",
    "bljpm",
    "jpmbl",
    "jpmblacklist",
    "blautojpm",
    "blacklistautojpm",
    "autojpmbl",
  ],
  category: "jpm",
  description:
    "Sistema JPM completo: broadcast, hidetag, channel, auto, blacklist, delay, update",
  usage: ".jpm",
  example: ".jpm",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

const jpmSessions = {};

let cachedThumb = null;
try {
  cachedThumb = getAssetBuffer("ourin2");
} catch {}

function getVerifiedQuoted() {
  const botName = config.bot?.name || "Luffy-AI";
  const botNumber = config.owner?.number?.[0] || "0";
  return {
    key: {
      participant: `0@s.whatsapp.net`,
      remoteJid: `status@broadcast`,
    },
    message: {
      contactMessage: {
        displayName: `📢 ${botName}`,
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:XL;${botName};;;\nFN:${botName}\nitem1.TEL;waid=${botNumber}:${botNumber}\nitem1.X-ABLabel:Movil\nEND:VCARD`,
        sendEphemeral: true,
      },
    },
  };
}

function parseInterval(raw) {
  if (!raw) return 0;
  const cleaned = raw.toLowerCase().replace(/\s+/g, "");
  const matches = [...cleaned.matchAll(/(\d+)([smhdw])/g)];
  if (!matches.length) return 0;
  const combined = matches.map((m) => m[0]).join("");
  if (combined !== cleaned) return 0;
  let total = 0;
  for (const match of matches) {
    const value = parseInt(match[1]);
    const unit = match[2];
    if (unit === "s") total += value * 1000;
    if (unit === "m") total += value * 60 * 1000;
    if (unit === "h") total += value * 60 * 60 * 1000;
    if (unit === "d") total += value * 24 * 60 * 60 * 1000;
    if (unit === "w") total += value * 7 * 24 * 60 * 60 * 1000;
  }
  return total;
}

function formatInterval(ms) {
  if (!ms || ms <= 0) return "0 segundos";
  const units = [
    { label: "días", value: 86400000 },
    { label: "horas", value: 3600000 },
    { label: "minutos", value: 60000 },
    { label: "segundos", value: 1000 },
  ];
  let remaining = ms;
  const parts = [];
  for (const unit of units) {
    const amount = Math.floor(remaining / unit.value);
    if (amount > 0) {
      parts.push(`${amount} ${unit.label}`);
      remaining -= amount * unit.value;
    }
  }
  return parts.length ? parts.join(" ") : "0 segundos";
}

function previewText(text) {
  if (!text) return "-";
  const cleaned = text.replace(/\s+/g, " ").trim();
  return cleaned.length <= 80 ? cleaned : `${cleaned.slice(0, 77)}...`;
}

async function fetchAllSubscribedChannels(sock) {
  const data = {};
  const encoder = new TextEncoder();
  const queryIds = ["6388546374527196"];
  for (const queryId of queryIds) {
    try {
      const result = await sock.query({
        tag: "iq",
        attrs: {
          id: sock.generateMessageTag(),
          type: "get",
          xmlns: "w:mex",
          to: "@s.whatsapp.net",
        },
        content: [
          {
            tag: "query",
            attrs: { query_id: queryId },
            content: encoder.encode(JSON.stringify({ variables: {} })),
          },
        ],
      });
      const child = getBinaryNodeChild(result, "result");
      if (!child?.content) continue;
      const parsed = JSON.parse(child.content.toString());
      const newsletters =
        parsed?.data?.["xwa2_newsletter_subscribed"] ||
        parsed?.data?.["newsletter_subscribed"] ||
        parsed?.data?.["subscribed"] ||
        [];
      if (newsletters.length > 0) {
        for (const ch of newsletters) {
          if (ch.id) {
            data[ch.id] = {
              id: ch.id,
              name: ch.thread_metadata?.name?.text || ch.name || "Unknown",
              subscribers: ch.thread_metadata?.subscribers_count || 0,
            };
          }
        }
        break;
      }
    } catch {
      continue;
    }
  }
  return data;
}

async function getTargetGroups(sock, db, blacklistKey = "jpmBlacklist") {
  const allGroups = await fetchGroupsSafe(sock);
  let groupIds = Object.keys(allGroups);
  const blacklist = db.setting("jpmBlacklist") || [];
  const autoBlacklist = db.setting(blacklistKey) || [];
  const fullBlacklist = [...new Set([...blacklist, ...autoBlacklist])];
  const blacklistedCount = groupIds.filter((id) =>
    fullBlacklist.includes(id),
  ).length;
  groupIds = groupIds.filter((id) => !fullBlacklist.includes(id));
  return { groupIds, allGroups, blacklistedCount };
}

async function sendInteractiveMessage(
  m,
  sock,
  { title, body, footer, buttons },
) {
  let headerMedia = null;
  if (cachedThumb) {
    try {
      headerMedia = await prepareWAMessageMedia(
        { image: cachedThumb },
        { upload: sock.waUploadToServer },
      );
    } catch {}
  }

  const botName = config.bot?.name || "Luffy-AI";
  const saluranId = config.saluran?.id || "120363400911374213@newsletter";
  const saluranName = config.saluran?.name || botName;

  const msg = generateWAMessageFromContent(
    m.chat,
    {
      viewOnceMessage: {
        message: {
          messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2,
          },
          interactiveMessage: proto.Message.InteractiveMessage.fromObject({
            body: proto.Message.InteractiveMessage.Body.fromObject({
              text: body,
            }),
            footer: proto.Message.InteractiveMessage.Footer.fromObject({
              text: footer || `${botName} JPM System`,
            }),
            header: proto.Message.InteractiveMessage.Header.fromObject({
              hasMediaAttachment: !!headerMedia,
              ...(headerMedia || {}),
            }),
            nativeFlowMessage:
              proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                buttons,
              }),
            contextInfo: {
              mentionedJid: [m.sender],
              forwardingScore: 9,
              isForwarded: true,
              forwardedNewsletterMessageInfo: {
                newsletterJid: saluranId,
                newsletterName: saluranName,
                serverMessageId: 127,
              },
            },
          }),
        },
      },
    },
    { userJid: m.sender, quoted: getVerifiedQuoted() },
  );

  await sock.relayMessage(m.chat, msg.message, {
    messageId: msg.key.id,
  });
}

async function sendInteractiveJpm(m, sock, db, contentInfo) {
  const prefix = m.prefix;
  const botName = config.bot?.name || "Luffy-AI";
  const hasContent = contentInfo?.text || contentInfo?.mediaBuffer;

  const autoJpmCfg = getAutoJpmConfig();
  const autoJpmStatus = autoJpmCfg.enabled ? "✅ Activo" : "❌ Desactivado";
  const currentDelay = db.setting("jedaJpm") || 5000;
  const blCount = (db.setting("jpmBlacklist") || []).length;
  const autoBlCount = (db.setting("autoJpmBlacklist") || []).length;

  let body =
    `📢 *JPM — Sistema de Broadcast Masivo*\n\n` +
    `Enviar mensajes a todos los grupos, canales o objetivos específicos de forma automática o manual.\n\n` +
    `*Estado actual:*\n` +
    `> ⏱️ Retraso: *${(currentDelay / 1000).toFixed(1)} segundos*\n` +
    `> 🔄 AutoJPM: *${autoJpmStatus}*\n` +
    `> 🚫 Lista negra JPM: *${blCount} grupos*\n` +
    `> 🚫 Lista negra Auto: *${autoBlCount} grupos*\n` +
    `> 📢 JPM Ejecutándose: *${global.statusjpm ? "⚠️ Sí" : "No"}*`;

  if (hasContent) {
    body +=
      `\n\n📝 *Contenido listo para enviar:*\n` +
      `> Texto: *${contentInfo?.text ? previewText(contentInfo.text) : "Ninguno"}*\n` +
      `> Media: *${contentInfo?.mediaBuffer ? contentInfo.mediaType : "Ninguno"}*\n\n` +
      `_Selecciona el modo de envío de abajo para iniciar el broadcast_`;
  } else {
    body +=
      `\n\n💡 *Cómo usar:*\n` +
      `1. Envía texto, foto, audio o video\n` +
      `2. Responde a ese mensaje con *${prefix}jpm*\n` +
      `3. Selecciona el modo de envío de los botones de abajo\n\n` +
      `_O selecciona el modo primero, y luego envía el contenido_`;
  }

  const buttons = [
    {
      name: "single_select",
      buttonParamsJson: JSON.stringify({
        title: "📢 Seleccionar Modo JPM",
        sections: [
          {
            title: "📨 MODO BROADCAST",
            rows: [
              {
                title: "📢 JPM Básico",
                description: "Enviar mensaje a todos los grupos sin tag",
                id: `${prefix}jpm _mode_basic`,
              },
              {
                title: "👁️ JPM Hidetag",
                description: "Enviar mensaje a todos los grupos, tag oculto",
                id: `${prefix}jpm _mode_hidetag`,
              },
              {
                title: "📺 JPM Canal",
                description: "Enviar mensaje a todos los canales de newsletter",
                id: `${prefix}jpm _mode_channel`,
              },
              {
                title: "🚀 JPM Actualización",
                description: "Broadcast changelog/actualización a todos los grupos",
                id: `${prefix}jpm _mode_update`,
              },
              {
                title: "🔄 Auto JPM",
                description: "Programar transmisiones automáticas por intervalo",
                id: `${prefix}jpm _mode_autojpm`,
              },
            ],
          },
          {
            title: "⚙️ CONFIGURACIÓN",
            rows: [
              {
                title: "⏱️ Ajustar Retraso JPM",
                description: `Retraso actual: ${(currentDelay / 1000).toFixed(1)}s`,
                id: `${prefix}jpm _set_delay`,
              },
              {
                title: "🚫 Lista Negra JPM",
                description: `Administrar grupos excluidos del JPM (${blCount})`,
                id: `${prefix}jpm _bl_jpm`,
              },
              {
                title: "🚫 Lista Negra AutoJPM",
                description: `Administrar grupos excluidos del AutoJPM (${autoBlCount})`,
                id: `${prefix}jpm _bl_autojpm`,
              },
              {
                title: "⏹️ Detener JPM",
                description: "Detener el JPM que está en ejecución",
                id: `${prefix}jpm _stop`,
              },
              {
                title: "📊 Estado AutoJPM",
                description: "Ver programación y detalles del Auto JPM",
                id: `${prefix}jpm _autojpm_status`,
              },
            ],
          },
        ],
      }),
    },
    {
      name: "quick_reply",
      buttonParamsJson: JSON.stringify({
        display_text: "❓ Ayuda",
        id: `${prefix}jpm _help`,
      }),
    },
  ];

  return sendInteractiveMessage(m, sock, {
    title: `📢 ${botName} JPM`,
    body,
    footer: `${botName} JPM System`,
    buttons,
  });
}

async function runBroadcast(
  sock,
  m,
  db,
  { groupIds, allGroups, mode, text, mediaBuffer, mediaType },
) {
  const jedaJpm = db.setting("jedaJpm") || 5000;
  const ctx = saluranCtx();
  const isHidetag = mode === "hidetag";
  const modeLabel = isHidetag
    ? "Hidetag"
    : mode === "channel"
      ? "Channel"
      : mode === "update"
        ? "Update"
        : "Basic";

  await m.reply(
    `📢 *JPM ${modeLabel} Iniciado*\n\n` +
      `> 📝 Mensaje: *${text.substring(0, 50)}${text.length > 50 ? "..." : ""}*\n` +
      `> 📷 Media: *${mediaBuffer ? mediaType : "Ninguno"}*\n` +
      `> 👥 Objetivo: *${groupIds.length}* ${mode === "channel" ? "canales" : "grupos"}\n` +
      `> ⏱️ Retraso: *${(jedaJpm / 1000).toFixed(1)} segundos*\n` +
      `> 📊 Estimación: *${Math.ceil((groupIds.length * jedaJpm) / 60000)} minutos*\n\n` +
      `_Enviando a todos los objetivos..._`,
  );

  global.statusjpm = true;
  let successCount = 0;
  let failedCount = 0;

  for (const targetId of groupIds) {
    if (global.stopjpm) {
      delete global.stopjpm;
      delete global.statusjpm;
      await m.reply(
        `⏹️ *JPM Detenido*\n\n` +
          `> ✅ Exitosos: *${successCount}*\n` +
          `> ❌ Fallidos: *${failedCount}*\n` +
          `> ⏸️ Restantes: *${groupIds.length - successCount - failedCount}*`,
      );
      return;
    }

    try {
      if (isHidetag && allGroups[targetId]) {
        const mentions = allGroups[targetId].participants
          .map((p) => p.id || p.jid)
          .filter(Boolean);
        const hidetagCtx = { ...ctx, mentionedJid: mentions };
        if (mediaBuffer) {
          await sock.sendMessage(targetId, {
            [mediaType]: mediaBuffer,
            caption: text,
            mentions,
            contextInfo: hidetagCtx,
          });
        } else {
          await sock.sendMessage(targetId, {
            text,
            mentions,
            contextInfo: hidetagCtx,
          });
        }
      } else if (mediaBuffer) {
        await sock.sendMedia(targetId, mediaBuffer, text, null, {
          type: mediaType,
          contextInfo: { forwardingScore: 99, isForwarded: true },
        });
      } else {
        await sock.sendText(targetId, text, null, {
          contextInfo: { forwardingScore: 99, isForwarded: true },
        });
      }
      successCount++;
    } catch {
      failedCount++;
    }

    await new Promise((resolve) => setTimeout(resolve, jedaJpm));
  }

  delete global.statusjpm;
  m.react("✅");
  await m.reply(
    `✅ *JPM ${modeLabel} ¡Completado!*\n\n` +
      `> ✅ Exitosos: *${successCount}*\n` +
      `> ❌ Fallidos: *${failedCount}*\n` +
      `> 📊 Total: *${groupIds.length}*`,
  );
}

function showHelp(m) {
  const p = m.prefix;
  return m.reply(
    `📢 *JPM — Sistema de Broadcast Masivo*\n\n` +
      `Sistema completo para enviar mensajes a todos los grupos, canales o objetivos específicos de forma automática o manual.\n\n` +
      `*CÓMO USAR:*\n` +
      `> Escribe *${p}jpm* para abrir el menú interactivo\n` +
      `> Puedes responder/enviar texto, foto, audio o video y luego escribir *${p}jpm*\n` +
      `> Selecciona el modo de envío de los botones que aparecen\n\n` +
      `*MODOS DE BROADCAST:*\n` +
      `> 📢 *JPM Básico* — Enviar mensaje a todos los grupos sin tag\n` +
      `> 👁️ *JPM Hidetag* — Enviar mensaje a todos los grupos, tag oculto\n` +
      `> 📺 *JPM Canal* — Enviar mensaje a todos los canales de newsletter\n` +
      `> 🚀 *JPM Actualización* — Broadcast changelog/actualización a todos los grupos\n` +
      `> 🔄 *Auto JPM* — Programar transmisiones automáticas por intervalo\n\n` +
      `*CONFIGURACIÓN:*\n` +
      `> ⏱️ *Ajustar Retraso* — Tiempo de espera entre envíos por grupo\n` +
      `> 🚫 *Lista Negra JPM* — Administrar grupos excluidos del JPM\n` +
      `> 🚫 *Lista Negra AutoJPM* — Administrar grupos excluidos del AutoJPM\n` +
      `> ⏹️ *Detener JPM* — Detener el JPM que está en ejecución\n\n` +
      `*FORMATO DE INTERVALO:*\n` +
      `> *10m* (10 minutos) • *1h* (1 hora) • *2h30m* (2 horas 30 minutos) • *1d* (1 día)`,
  );
}

async function handler(m, { sock }) {
  const db = getDatabase();
  const command = m.command?.toLowerCase() || "";
  const input = (m.text || "").trim();
  const fullInput = (m.fullArgs || m.text || "").trim();

  if (command === "stopjpm" || command === "stopjasher") {
    if (!global.statusjpm)
      return m.reply(`❌ No hay JPM en ejecución.`);
    global.stopjpm = true;
    m.react("⏹️");
    return m.reply(`⏹️ *JPM Detenido*\n\n> El proceso JPM se está deteniendo...`);
  }

  if (
    command === "setdelayjpm" ||
    command === "delayjpm" ||
    command === "jedajpm" ||
    command === "setjedajpm"
  ) {
    return handleSetDelay(m, sock, db, input);
  }

  if (
    command === "blacklistjpm" ||
    command === "bljpm" ||
    command === "jpmbl" ||
    command === "jpmblacklist" ||
    command === "listblacklistjpm"
  ) {
    return handleBlacklist(m, sock, db, "jpmBlacklist", "JPM");
  }

  if (
    command === "blautojpm" ||
    command === "blacklistautojpm" ||
    command === "autojpmbl" ||
    command === "listblautojpm"
  ) {
    return handleBlacklist(m, sock, db, "autoJpmBlacklist", "AUTO JPM");
  }

  if (command === "autojpm" || command === "autojasher") {
    return handleAutoJpm(m, sock, db, input, fullInput);
  }

  if (
    command === "jpmupdate" ||
    command === "updatejpm" ||
    command === "broadcastupdate"
  ) {
    return handleJpmUpdate(m, sock, db, input);
  }

  if (command === "jpmch" || command === "jpmchannel") {
    return handleJpmChannel(m, sock, db, fullInput);
  }

  if (command === "jpmht" || command === "jpmhidetag") {
    return handleJpmDirect(m, sock, db, fullInput, "hidetag");
  }

  if (command === "jpm" || command === "jasher" || command === "jaser") {
    return handleJpmMain(m, sock, db, fullInput);
  }

  return showHelp(m);
}

async function handleJpmMain(m, sock, db, fullInput) {
  if (fullInput.startsWith("_")) {
    return handleInternalCommand(m, sock, db, fullInput);
  }

  let mediaBuffer = null;
  let mediaType = null;
  let text = fullInput || "";
  const qmsg = m.quoted || m;

  if (!text && m.quoted) {
    text = m.quoted.body || m.quoted.text || m.quoted.contentText || "";
  }

  if (qmsg.isImage) {
    try {
      mediaBuffer = await qmsg.download();
      mediaType = "image";
    } catch {}
  } else if (qmsg.isVideo) {
    try {
      mediaBuffer = await qmsg.download();
      mediaType = "video";
    } catch {}
  } else if (qmsg.isAudio || qmsg.mimetype?.startsWith("audio")) {
    try {
      mediaBuffer = await qmsg.download();
      mediaType = "audio";
    } catch {}
  } else if (
    qmsg.isDocument ||
    (qmsg.mimetype && !qmsg.mimetype.startsWith("text/plain"))
  ) {
    try {
      mediaBuffer = await qmsg.download();
      mediaType = "document";
    } catch {}
  }

  const contentInfo =
    mediaBuffer || text ? { text, mediaBuffer, mediaType } : null;

  if (contentInfo) {
    jpmSessions[m.sender] = {
      text,
      mediaBuffer,
      mediaType,
      timestamp: Date.now(),
    };
  }

  return sendInteractiveJpm(m, sock, db, contentInfo);
}

async function handleInternalCommand(m, sock, db, fullInput) {
  const prefix = m.prefix;
  const cmd = fullInput.trim();

  if (cmd === "_mode_basic") return executeJpmWithSession(m, sock, db, "basic");
  if (cmd === "_mode_hidetag")
    return executeJpmWithSession(m, sock, db, "hidetag");
  if (cmd === "_mode_channel")
    return executeJpmWithSession(m, sock, db, "channel");
  if (cmd === "_mode_update")
    return executeJpmWithSession(m, sock, db, "update");
  if (cmd === "_mode_autojpm") return startAutoJpmSession(m, sock, db);
  if (cmd === "_set_delay") return handleSetDelay(m, sock, db, "");
  if (cmd === "_bl_jpm")
    return handleBlacklist(m, sock, db, "jpmBlacklist", "JPM");
  if (cmd === "_bl_autojpm")
    return handleBlacklist(m, sock, db, "autoJpmBlacklist", "AUTO JPM");
  if (cmd === "_autojpm_status") return showAutoJpmStatus(m);

  if (cmd === "_stop") {
    if (!global.statusjpm)
      return m.reply(`❌ No hay JPM en ejecución.`);
    global.stopjpm = true;
    m.react("⏹️");
    return m.reply(`⏹️ *JPM Detenido*\n\n> El proceso JPM se está deteniendo...`);
  }

  if (cmd === "_help") return showHelp(m);

  if (cmd.startsWith("_autojpm_interval_")) {
    const intervalStr = cmd.replace("_autojpm_interval_", "");
    return completeAutoJpmSetup(m, sock, db, intervalStr);
  }

  if (cmd.startsWith("_delay_")) {
    const ms = parseInt(cmd.replace("_delay_", ""));
    if (!isNaN(ms) && ms >= 1000 && ms <= 30000) {
      return handleSetDelay(m, sock, db, String(ms));
    }
  }

  return m.reply(
    `❌ Comando no reconocido. Escribe *${prefix}jpm* para abrir el menú.`,
  );
}

async function executeJpmWithSession(m, sock, db, mode) {
  const session = jpmSessions[m.sender];
  const text = session?.text || "";
  const mediaBuffer = session?.mediaBuffer || null;
  const mediaType = session?.mediaType || null;

  if (!text && !mediaBuffer) {
    return m.reply(
      `❌ *Sin Contenido*\n\n` +
        `Envía un mensaje, foto, audio o video primero, luego responde con *${m.prefix}jpm* y selecciona el modo de envío.\n\n` +
        `*Forma correcta:*\n` +
        `1. Envía texto/foto/video/audio\n` +
        `2. Responde a ese mensaje con *${m.prefix}jpm*\n` +
        `3. Selecciona el modo de los botones que aparecen`,
    );
  }

  if (mode === "update") return handleJpmUpdateWithContent(m, sock, db, text);
  if (mode === "channel")
    return handleJpmChannelWithContent(
      m,
      sock,
      db,
      text,
      mediaBuffer,
      mediaType,
    );

  if (global.statusjpm) {
    return m.reply(
      `❌ *JPM en Ejecución*\n\n> Escribe *${m.prefix}stopjpm* para detenerlo primero.`,
    );
  }

  m.react("📢");

  try {
    const { groupIds, allGroups, blacklistedCount } = await getTargetGroups(
      sock,
      db,
    );
    if (groupIds.length === 0) {
      m.react("❌");
      return m.reply(
        `❌ *Sin Grupos*\n\n` +
          `> El bot no encontró grupos a los que enviar${blacklistedCount > 0 ? ` (${blacklistedCount} grupos en lista negra)` : ""}`,
      );
    }
    await runBroadcast(sock, m, db, {
      groupIds,
      allGroups,
      mode,
      text,
      mediaBuffer,
      mediaType,
    });
  } catch (error) {
    delete global.statusjpm;
    m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  } finally {
    delete jpmSessions[m.sender];
  }
}

async function handleJpmDirect(m, sock, db, text, mode) {
  if (!text && m.quoted) {
    text = m.quoted.body || m.quoted.text || m.quoted.contentText || "";
  }

  if (!text) {
    const modeLabel = mode === "hidetag" ? "Hidetag" : "Basic";
    return m.reply(
      `📢 *JPM ${modeLabel}*\n\n` +
        `Enviar mensaje broadcast a todos los grupos${mode === "hidetag" ? " con tag oculto a todos los miembros" : ""}.\n\n` +
        `*USO:*\n` +
        `> *${m.prefix}${mode === "hidetag" ? "jpmht" : "jpm"} <mensaje>*\n` +
        `> *${m.prefix}${mode === "hidetag" ? "jpmht" : "jpm"}* (responder foto/video)\n\n` +
        `*EJEMPLO:*\n` +
        `> *${m.prefix}${mode === "hidetag" ? "jpmht" : "jpm"} ¡Hola a todos! No olviden el evento de mañana.*`,
    );
  }

  if (global.statusjpm) {
    return m.reply(
      `❌ *JPM en Ejecución*\n\n> Escribe *${m.prefix}stopjpm* para detener.`,
    );
  }

  m.react("📢");

  try {
    let mediaBuffer = null;
    let mediaType = null;
    const qmsg = m.quoted || m;
    if (qmsg.isImage) {
      try {
        mediaBuffer = await qmsg.download();
        mediaType = "image";
      } catch {}
    } else if (qmsg.isVideo) {
      try {
        mediaBuffer = await qmsg.download();
        mediaType = "video";
      } catch {}
    }

    const { groupIds, allGroups, blacklistedCount } = await getTargetGroups(
      sock,
      db,
    );
    if (groupIds.length === 0) {
      m.react("❌");
      return m.reply(
        `❌ *No hay Grupos*\n\n> El bot no encontro grupos a los que enviar${blacklistedCount > 0 ? ` (${blacklistedCount} grupos en lista negra)` : ""}`,
      );
    }

    await runBroadcast(sock, m, db, {
      groupIds,
      allGroups,
      mode,
      text,
      mediaBuffer,
      mediaType,
    });
  } catch (error) {
    delete global.statusjpm;
    m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

async function handleJpmChannel(m, sock, db, text) {
  if (!text && m.quoted) {
    text = m.quoted.body || m.quoted.text || m.quoted.contentText || "";
  }

  if (!text) {
    return m.reply(
      `📢 *JPM Canal*\n\n` +
        `Enviar mensaje a todos los canales de WhatsApp que el bot tiene suscritos.\n\n` +
        `*USO:*\n` +
        `> *${m.prefix}jpmch <mensaje>*\n` +
        `> *${m.prefix}jpmch* (responder foto/video)\n\n` +
        `*EJEMPLO:*\n` +
        `> *${m.prefix}jpmch ¡Hola a todos, sigan nuestras últimas actualizaciones!*`,
    );
  }
  return handleJpmChannelWithContent(m, sock, db, text, null, null);
}

async function handleJpmChannelWithContent(
  m,
  sock,
  db,
  text,
  mediaBuffer,
  mediaType,
) {
  if (global.statusjpm) {
    return m.reply(
      `❌ *JPM en Ejecución*\n\n> Escribe *${m.prefix}stopjpm* para detener.`,
    );
  }

  m.react("📢");

  try {
    if (!mediaBuffer) {
      const qmsg = m.quoted || m;
      if (qmsg.isImage) {
        try {
          mediaBuffer = await qmsg.download();
          mediaType = "image";
        } catch {}
      } else if (qmsg.isVideo) {
        try {
          mediaBuffer = await qmsg.download();
          mediaType = "video";
        } catch {}
      }
    }

    const channels = await fetchAllSubscribedChannels(sock);
    const channelIds = Object.keys(channels);
    if (channelIds.length === 0) {
      m.react("❌");
      return m.reply(
        `❌ *Sin Canales*\n\n> El bot no tiene ningún canal suscrito`,
      );
    }

    const jedaJpm = db.setting("jedaJpm") || 5000;
    const ctx = saluranCtx();

    await m.reply(
      `📢 *JPM Canal Iniciado*\n\n` +
        `> 📝 Mensaje: *${text.substring(0, 50)}${text.length > 50 ? "..." : ""}*\n` +
        `> 📷 Media: *${mediaBuffer ? mediaType : "Ninguno"}*\n` +
        `> 📺 Objetivo: *${channelIds.length}* canales\n` +
        `> ⏱️ Retraso: *${(jedaJpm / 1000).toFixed(1)} segundos*\n\n` +
        `_Enviando a todos los canales..._`,
    );

    global.statusjpm = true;
    let successCount = 0;
    let failedCount = 0;

    for (const chId of channelIds) {
      if (global.stopjpm) {
        delete global.stopjpm;
        delete global.statusjpm;
        await m.reply(
          `⏹️ *JPM Canal Detenido*\n\n` +
            `> ✅ Exitosos: *${successCount}*\n` +
            `> ❌ Fallidos: *${failedCount}*`,
        );
        return;
      }
      try {
        if (mediaBuffer) {
          await sock.sendMessage(chId, {
            [mediaType]: mediaBuffer,
            caption: text,
            contextInfo: ctx,
          });
        } else {
          await sock.sendMessage(chId, { text, contextInfo: ctx });
        }
        successCount++;
      } catch {
        failedCount++;
      }
      await new Promise((resolve) => setTimeout(resolve, jedaJpm));
    }

    delete global.statusjpm;
    m.react("✅");
    await m.reply(
      `✅ *JPM Canal ¡Completado!*\n\n` +
        `> ✅ Exitosos: *${successCount}*\n` +
        `> ❌ Fallidos: *${failedCount}*\n` +
        `> 📊 Total: *${channelIds.length}*`,
    );
  } catch (error) {
    delete global.statusjpm;
    m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

async function handleJpmUpdate(m, sock, db, input) {
  if (!input && m.quoted) {
    input = m.quoted.body || m.quoted.text || m.quoted.contentText || "";
  }

  if (!input) {
    return m.reply(
      `📢 *JPM Actualización*\n\n` +
        `¡Enviar información de actualización/changelog a todos los grupos!\n\n` +
        `*FORMATO:*\n` +
        `> *${m.prefix}jpmupdate <versión> | <contenido del changelog>*\n\n` +
        `*EJEMPLO:*\n` +
        `> *${m.prefix}jpmupdate v3.0 | Nuevas funciones: - JPM Hidetag - Sistema AFK*`,
    );
  }
  return handleJpmUpdateWithContent(m, sock, db, input);
}

async function handleJpmUpdateWithContent(m, sock, db, input) {
  if (global.statusjpm) {
    return m.reply(
      `❌ *JPM en Ejecución*\n\n> Escribe *${m.prefix}stopjpm* para detener.`,
    );
  }

  let version = config.bot?.version || "v1.0";
  let changelog = input;
  if (input.includes("|")) {
    const parts = input.split("|");
    version = parts[0].trim();
    changelog = parts.slice(1).join("|").trim();
  }
  if (!changelog) return m.reply(`❌ ¡El changelog no puede estar vacío!`);

  m.react("🕕");

  try {
    const { groupIds, blacklistedCount } = await getTargetGroups(sock, db);
    if (groupIds.length === 0) {
      m.react("❌");
      return m.reply(
        `❌ *No hay Grupos*\n\n> El bot no encontro grupos a los que enviar${blacklistedCount > 0 ? ` (${blacklistedCount} grupos en lista negra)` : ""}`,
      );
    }

    const botName = config.bot?.name || "Luffy-AI";
    const dateStr = timeHelper.formatDate("DD MMMM YYYY");
    const updateMessage =
      `🚀 *ACTUALIZACIÓN !! | ${version}*\n\n` +
      `📅 *Fecha:* ${dateStr}\n\n` +
      `*CHANGELOG:*\n${changelog}\n\n` +
      `*NOTAS RECIENTES:*\n` +
      `> 💡 Escribe *${m.prefix}menu* para explorar estas funciones.\n` +
      `> 📢 _Gracias por usar ${botName}_`;

    const jedaJpm = db.setting("jedaJpm") || 5000;

    await m.reply(
      `📢 *JPM Actualización Iniciada*\n\n` +
        `> 🏷️ Versión: *${version}*\n` +
        `> 👥 Objetivo: *${groupIds.length}* grupos\n` +
        `> ⏱️ Retraso: *${(jedaJpm / 1000).toFixed(1)} segundos*\n\n` +
        `_Enviando actualización a todos los grupos..._`,
    );

    global.statusjpm = true;
    let successCount = 0;
    let failedCount = 0;

    for (const groupId of groupIds) {
      if (global.stopjpm) {
        delete global.stopjpm;
        delete global.statusjpm;
        await m.reply(
          `⏹️ *JPM Actualización Detenida*\n\n` +
            `> ✅ Exitosos: *${successCount}*\n` +
            `> ❌ Fallidos: *${failedCount}*\n` +
            `> ⏸️ Restantes: *${groupIds.length - successCount - failedCount}*`,
        );
        return;
      }
      try {
        await sock.sendMessage(groupId, {
          text: updateMessage,
          contextInfo: saluranCtx(),
        });
        successCount++;
      } catch {
        failedCount++;
      }
      await new Promise((resolve) => setTimeout(resolve, jedaJpm));
    }

    delete global.statusjpm;
    m.react("✅");
    await m.reply(
      `✅ *JPM Actualización ¡Completada!*\n\n` +
        `> ✅ Éxitos: *${successCount}*\n` +
        `> ❌ Fallidos: *${failedCount}*\n` +
        `> 📊 Total: *${groupIds.length}*`,
    );
  } catch (error) {
    delete global.statusjpm;
    m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

async function startAutoJpmSession(m, sock, db) {
  const session = jpmSessions[m.sender];
  const prefix = m.prefix;
  const hasContent = session?.text || session?.mediaBuffer;

  let body =
    `🔄 *Auto JPM — Sesión de Configuración*\n\n` +
    `El bot enviará mensajes automáticamente a todos los grupos según el intervalo de tiempo que determines.\n\n`;

  if (hasContent) {
    body +=
      `📝 *Contenido a enviar:*\n` +
      `> Texto: *${session.text ? previewText(session.text) : "Ninguno"}*\n` +
      `> Media: *${session.mediaBuffer ? session.mediaType : "Ninguno"}*\n\n`;
  }

  body +=
    `*Selecciona el intervalo de abajo:*\n` +
    `> Cuanto más largo el intervalo, más seguro contra detección de spam.\n` +
    `> Mínimo: *15 minutos*`;

  const buttons = [
    {
      name: "single_select",
      buttonParamsJson: JSON.stringify({
        title: "⏱️ Seleccionar Intervalo",
        sections: [
          {
            title: "⏱️ INTERVALOS POPULARES",
            rows: [
              {
                title: "🕐 15 Minutos",
                description: "Ideal para recordatorios rápidos",
                id: `${prefix}jpm _autojpm_interval_15m`,
              },
              {
                title: "🕐 30 Minutos",
                description: "Intervalo estándar",
                id: `${prefix}jpm _autojpm_interval_30m`,
              },
              {
                title: "🕐 1 Hora",
                description: "El más utilizado",
                id: `${prefix}jpm _autojpm_interval_1h`,
              },
              {
                title: "🕐 2 Horas",
                description: "Seguro y no molesto",
                id: `${prefix}jpm _autojpm_interval_2h`,
              },
              {
                title: "🕐 3 Horas",
                description: "Muy seguro contra spam",
                id: `${prefix}jpm _autojpm_interval_3h`,
              },
              {
                title: "🕐 6 Horas",
                description: "Medio día",
                id: `${prefix}jpm _autojpm_interval_6h`,
              },
              {
                title: "🕐 12 Horas",
                description: "Dos veces al día",
                id: `${prefix}jpm _autojpm_interval_12h`,
              },
              {
                title: "🕐 1 Día",
                description: "Una vez al día",
                id: `${prefix}jpm _autojpm_interval_1d`,
              },
            ],
          },
          {
            title: "⚙️ PERSONALIZADO",
            rows: [
              {
                title: "✏️ Entrada Manual",
                description:
                  "Escribe el intervalo tú mismo (ejemplo: .autojpm on 2h30m mensaje)",
                id: `${prefix}jpm _help`,
              },
            ],
          },
        ],
      }),
    },
    {
      name: "quick_reply",
      buttonParamsJson: JSON.stringify({
        display_text: "❌ Cancelar",
        id: `${prefix}jpm`,
      }),
    },
  ];

  return sendInteractiveMessage(m, sock, {
    title: `🔄 ${config.bot?.name || "Luffy-AI"} AutoJPM`,
    body,
    footer: `${config.bot?.name || "Luffy-AI"} AutoJPM`,
    buttons,
  });
}

async function completeAutoJpmSetup(m, sock, db, intervalStr) {
  const intervalMs = parseInterval(intervalStr);
  if (!intervalMs)
    return m.reply(
      `❌ Intervalo no válido. Ejemplo: *15m*, *1h*, *2h30m*, *1d*`,
    );
  if (intervalMs < 15 * 60 * 1000)
    return m.reply(`❌ Intervalo mínimo *15 minutos* para prevenir spam.`);

  const session = jpmSessions[m.sender];
  const existing = getAutoJpmConfig();
  const quoted = m.quoted || m;
  let messageText = session?.text || "";
  if (!messageText && quoted.body)
    messageText = quoted.body.replace(/\\n/g, "\n").trim();

  let mediaData = existing?.message?.media || null;
  if (session?.mediaBuffer) {
    const buffer = session.mediaBuffer;
    const mType = session.mediaType || "image";
    const mimetype = quoted.mimetype || "image/jpeg";
    const extension = getExtension(mimetype) || "jpg";
    const fileName = `autojpm_${Date.now()}.${extension}`;
    const storageDir = getAutoJpmStorageDir();
    const filePath = path.join(storageDir, fileName);
    fs.writeFileSync(filePath, buffer);
    if (mediaData?.path && mediaData.path !== filePath) {
      try {
        const baseDir = getAutoJpmStorageDir();
        if (
          path.resolve(mediaData.path).startsWith(path.resolve(baseDir)) &&
          fs.existsSync(mediaData.path)
        ) {
          fs.unlinkSync(mediaData.path);
        }
      } catch {}
    }
    mediaData = { type: mType, path: filePath, mimetype, fileName };
  }

  if (
    !messageText &&
    !mediaData &&
    !existing?.message?.text &&
    !existing?.message?.media
  ) {
    return m.reply(
      `❌ *Mensaje o Media Requerido*\n\n> Envía contenido primero, luego escribe *${m.prefix}jpm* y selecciona Auto JPM.`,
    );
  }

  const updatedConfig = {
    enabled: true,
    intervalMs,
    message: {
      text: messageText || existing?.message?.text || "",
      media: mediaData,
    },
    lastRun: 0,
    nextRun: Date.now() + intervalMs,
  };

  setAutoJpmConfig(updatedConfig);
  startAutoJpmScheduler(sock);
  delete jpmSessions[m.sender];

  return m.reply(
    `✅ *¡Auto JPM Activo!*\n\n` +
      `> ⏱️ Intervalo: *${formatInterval(intervalMs)}*\n` +
      `> 🕒 Primera ejecución: *${timeHelper.fromTimestamp(updatedConfig.nextRun)}*\n` +
      `> 📷 Media: *${updatedConfig.message.media?.type || "Ninguno"}*\n` +
      `> 📝 Mensaje: *${previewText(updatedConfig.message.text)}*\n\n` +
      `_AutoJPM se ejecutará automáticamente según la programación._`,
  );
}

async function handleAutoJpm(m, sock, db, input, fullInput) {
  const prefix = m.prefix;
  if (!input) return startAutoJpmSession(m, sock, db);

  const match = input.match(/^(\S+)(?:\s+(\S+))?(?:\s+([\s\S]*))?$/);
  const action = match?.[1]?.toLowerCase() || "";
  const intervalRaw = match?.[2];
  const messageRaw = match?.[3];

  if (["off", "stop", "disable"].includes(action)) {
    const current = getAutoJpmConfig();
    if (!current.enabled) return m.reply(`ℹ️ AutoJPM ya está desactivado.`);
    setAutoJpmConfig({ ...current, enabled: false });
    stopAutoJpmScheduler();
    return m.reply(
      `✅ *AutoJPM Desactivado*\n\n> La programación de transmisiones automáticas ha sido desactivada.`,
    );
  }

  if (["status", "info"].includes(action)) return showAutoJpmStatus(m);

  if (!["on", "start", "enable"].includes(action)) {
    return m.reply(
      `❌ Formato incorrecto. Usa *${prefix}autojpm on/off/status*.`,
    );
  }

  if (!intervalRaw) return startAutoJpmSession(m, sock, db);

  const intervalMs = parseInterval(intervalRaw);
  if (!intervalMs)
    return m.reply(
      `❌ Intervalo no válido. Ejemplo: *10m*, *1h*, *2h30m*, *1d*.`,
    );
  if (intervalMs < 15 * 60 * 1000)
    return m.reply(`❌ Intervalo mínimo *15 minutos* para prevenir spam.`);

  const existing = getAutoJpmConfig();
  const quoted = m.quoted || m;
  let messageText = (messageRaw || "").replace(/\\n/g, "\n").trim();
  if (!messageText && quoted.body)
    messageText = quoted.body.replace(/\\n/g, "\n").trim();

  let mediaData = existing?.message?.media || null;
  if (quoted.isImage || quoted.isVideo || quoted.isAudio || quoted.isDocument) {
    const buffer = await quoted.download();
    if (buffer) {
      const mediaType = quoted.isImage
        ? "image"
        : quoted.isVideo
          ? "video"
          : quoted.isAudio
            ? "audio"
            : "document";
      const mimetype = quoted.mimetype || getMimeType(buffer);
      const extension = getExtension(mimetype);
      const fileName = quoted.fileName || `autojpm_${Date.now()}.${extension}`;
      const storageDir = getAutoJpmStorageDir();
      const filePath = path.join(storageDir, fileName);
      fs.writeFileSync(filePath, buffer);
      if (mediaData?.path && mediaData.path !== filePath) {
        try {
          const baseDir = getAutoJpmStorageDir();
          if (
            path.resolve(mediaData.path).startsWith(path.resolve(baseDir)) &&
            fs.existsSync(mediaData.path)
          ) {
            fs.unlinkSync(mediaData.path);
          }
        } catch {}
      }
      mediaData = { type: mediaType, path: filePath, mimetype, fileName };
    }
  }

  if (
    !messageText &&
    !mediaData &&
    !existing?.message?.text &&
    !existing?.message?.media
  ) {
    return m.reply(`❌ El mensaje o media es obligatorio.`);
  }

  const updatedConfig = {
    enabled: true,
    intervalMs,
    message: {
      text: messageText || existing?.message?.text || "",
      media: mediaData,
    },
    lastRun: 0,
    nextRun: Date.now() + intervalMs,
  };

  setAutoJpmConfig(updatedConfig);
  startAutoJpmScheduler(sock);

  return m.reply(
    `✅ *¡Auto JPM Activo!*\n\n` +
      `> ⏱️ Intervalo: *${formatInterval(intervalMs)}*\n` +
      `> 🕒 Primera ejecución: *${timeHelper.fromTimestamp(updatedConfig.nextRun)}*\n` +
      `> 📷 Media: *${updatedConfig.message.media?.type || "Ninguno"}*\n` +
      `> 📝 Mensaje: *${previewText(updatedConfig.message.text)}*`,
  );
}

function showAutoJpmStatus(m) {
  const current = getAutoJpmConfig();
  if (!current?.message)
    return m.reply(
      `ℹ️ AutoJPM no está configurado. Escribe *${m.prefix}jpm* para configurarlo.`,
    );
  return m.reply(
    `📢 *Estado Auto JPM*\n\n` +
      `> Estado: *${current.enabled ? "✅ Activo" : "❌ Desactivado"}*\n` +
      `> Intervalo: *${formatInterval(current.intervalMs || 0)}*\n\n` +
      `*Programación:*\n` +
      `> Última: *${current.lastRun ? timeHelper.fromTimestamp(current.lastRun) : "Nunca"}*\n` +
      `> Siguiente: *${current.nextRun ? timeHelper.fromTimestamp(current.nextRun) : "Sin programar"}*\n\n` +
      `*Mensaje:*\n` +
      `> Texto: *${previewText(current.message?.text)}*\n` +
      `> Media: *${current.message?.media?.type ? current.message.media.type.toUpperCase() : "Ninguno"}*`,
  );
}

async function handleSetDelay(m, sock, db, input) {
  const current = db.setting("jedaJpm") || 5000;
  const prefix = m.prefix;

  if (!input) {
    const body =
      `⏱️ *Retraso JPM*\n\n` +
      `Ajusta el tiempo de espera entre envíos de mensajes a cada grupo.\n` +
      `Cuanto más largo el retraso, más seguro contra la detección de spam.\n\n` +
      `> Retraso actual: *${current}ms* (*${(current / 1000).toFixed(1)} segundos*)\n\n` +
      `*Selecciona el retraso de abajo:*`;

    const buttons = [
      {
        name: "single_select",
        buttonParamsJson: JSON.stringify({
          title: "⏱️ Seleccionar Retraso",
          sections: [
            {
              title: "⏱️ RETRASOS POPULARES",
              rows: [
                {
                  title: "⚡ 1 segundo",
                  description: "Muy rápido, alto riesgo de spam",
                  id: `${prefix}jpm _delay_1000`,
                },
                {
                  title: "⚡ 2 segundos",
                  description: "Rápido, riesgo medio de spam",
                  id: `${prefix}jpm _delay_2000`,
                },
                {
                  title: "⚡ 3 segundos",
                  description: "Estándar, bastante seguro",
                  id: `${prefix}jpm _delay_3000`,
                },
                {
                  title: "🕐 5 segundos",
                  description: "Seguro, el más utilizado",
                  id: `${prefix}jpm _delay_5000`,
                },
                {
                  title: "🕐 7 segundos",
                  description: "Muy seguro",
                  id: `${prefix}jpm _delay_7000`,
                },
                {
                  title: "🕐 10 segundos",
                  description: "El más seguro contra spam",
                  id: `${prefix}jpm _delay_10000`,
                },
                {
                  title: "🕐 15 segundos",
                  description: "Para grupos muy numerosos",
                  id: `${prefix}jpm _delay_15000`,
                },
              ],
            },
          ],
        }),
      },
      {
        name: "quick_reply",
        buttonParamsJson: JSON.stringify({
          display_text: "↩️ Volver",
          id: `${prefix}jpm`,
        }),
      },
    ];

    return sendInteractiveMessage(m, sock, {
      title: `⏱️ ${config.bot?.name || "Luffy-AI"} Retraso`,
      body,
      footer: `${config.bot?.name || "Luffy-AI"} JPM System`,
      buttons,
    });
  }

  const ms = parseInt(input);
  if (isNaN(ms) || ms < 1000 || ms > 30000) {
    return m.reply(
      `❌ El retraso debe estar entre *1000ms* (1 segundo) y *30000ms* (30 segundos)`,
    );
  }
  db.setting("jedaJpm", ms);
  return m.reply(
    `✅ *Retraso JPM Modificado*\n\n` +
      `> Anterior: *${current}ms* (*${(current / 1000).toFixed(1)} segundos*)\n` +
      `> Ahora: *${ms}ms* (*${(ms / 1000).toFixed(1)} segundos*)\n\n` +
      `> Estimación para 100 grupos: *${Math.ceil((100 * ms) / 60000)} minutos*`,
  );
}

async function handleBlacklist(m, sock, db, settingKey, label) {
  let blacklist = db.setting(settingKey) || [];
  const allGroups = await sock.groupFetchAllParticipating();
  const groups = Object.values(allGroups).sort((a, b) =>
    a.subject.localeCompare(b.subject),
  );

  if (!m.text || m.text.trim().startsWith("_")) {
    if (groups.length === 0)
      return m.reply(`❌ El bot no está en ningún grupo.`);
    let listText =
      `📋 *Lista de Grupos y ${label} Lista Negra*\n\n` +
      `Aquí están los *${groups.length} grupos* que sigue el bot *${config.bot?.name}*\n` +
      `La marca *🚫* significa que el grupo está en lista negra.\n\n`;
    for (let i = 0; i < groups.length; i++) {
      const isBlacklisted = blacklist.includes(groups[i].id);
      listText += `*${i + 1}.* ${groups[i].subject}${isBlacklisted ? " 🚫" : ""}\n`;
    }
    listText +=
      `\n*AGREGAR/QUITAR DE LISTA NEGRA:*\n` +
      `Escribe el comando seguido del número del grupo (puedes poner más de uno, separados por espacio).\n\n` +
      `*Ejemplo:*\n` +
      `> *${m.prefix}${settingKey === "autoJpmBlacklist" ? "blautojpm" : "bljpm"} 2 3 7*`;
    return m.reply(listText);
  }

  const args = m.text.trim().split(/\s+/);
  const toggled = [];
  for (const numStr of args) {
    const num = parseInt(numStr);
    if (!isNaN(num) && num > 0 && num <= groups.length) {
      const targetGroup = groups[num - 1];
      if (blacklist.includes(targetGroup.id)) {
        blacklist = blacklist.filter((jid) => jid !== targetGroup.id);
        toggled.push(`*${num}.* ${targetGroup.subject} ✅ *(Quitado de lista negra)*`);
      } else {
        blacklist.push(targetGroup.id);
        toggled.push(`*${num}.* ${targetGroup.subject} 🚫 ~(Agregado a lista negra)~`);
      }
    }
  }

  if (toggled.length === 0) {
    return m.reply(
      `❌ No hay números de grupo válidos.\n\nEscribe *${m.prefix}${settingKey === "autoJpmBlacklist" ? "blautojpm" : "bljpm"}* para ver la lista de números.`,
    );
  }

  db.setting(settingKey, blacklist);
  m.react("✅");
  return m.reply(`📢 *${label} Lista Negra Actualizada*\n\n${toggled.join("\n")}`);
}

export { pluginConfig as config, handler };
