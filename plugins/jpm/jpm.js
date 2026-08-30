import { getDatabase } from "../../src/lib/luffy-database.js";
import { fetchGroupsSafe } from "../../src/lib/luffy-jpm-helper.js";
import {
  getAutoJpmConfig,
  setAutoJpmConfig,
  startAutoJpmScheduler,
  stopAutoJpmScheduler,
  getAutoJpmStorageDir,
} from "../../src/lib/luffy-auto-jpm.js";
import { getMimeType, getExtension } from "../../src/lib/luffy-utils.js";
import * as timeHelper from "../../src/lib/luffy-time.js";
import {
  getBinaryNodeChild,
  prepareWAMessageMedia,
  generateWAMessageFromContent,
  proto,
} from "ourin";
import config from "../../config.js";
import te from "../../src/lib/luffy-error.js";
import { saluranCtx } from "../../src/lib/luffy-context.js";
import util from "util";
import axios from "axios";
import path from "path";
import fs from "fs";
import { getAssetBuffer } from "../../src/lib/luffy-asset-manager.js";

const pluginConfig = {
  name: "jpm",
  alias: ["jasher", "jaser", "jpmht", "jpmhidetag", "jpmch", "jpmchannel", "autojpm", "autojasher", "stopjpm", "stopjasher", "configurar_pausa_jpm", "delayjpm", "pausa_jpm", "jpmupdate", "updatejpm", "broadcastupdate", "blacklistjpm", "bljpm", "jpmbl", "jpmblacklist", "blautojpm", "blacklistautojpm", "autojpmbl"],
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
  carne: 0,
  isEnabled: true,
};

const jpmSessions = {};

let cachedThumb = null;
try {
  cachedThumb = getAssetBuffer("luffy2");
} catch {}

function getVerifiedQuoted() {
  const botName = config.bot?.name || "Luffy-Ai";
  const botNumber = config.owner?.number?.[0] || "0";
  return {
    key: {
      participant: `0@s.whatsapp.net`,
      remoteJid: `status@broadcast`,
    },
    message: {
      contactMessage: {
        displayName: `📢 ${botName}`,
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:XL;${botName};;;\nFN:${botName}\nitem1.TEL;waid=${botNumber}:${botNumber}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
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
              name: ch.thread_metadata?.name?.text || ch.name || "Desconocido",
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

  const extraChannels = {
    "120363348355703366@newsletter": {
      id: "120363348355703366@newsletter",
      name: "Canal extra",
      subscribers: 0,
    },
  };

  return { ...extraChannels, ...data };
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

  const botName = config.bot?.name || "Luffy-Ai";
  const saluranId = config.saluran?.canalId || "120363400911374213@newsletter";
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
  const botName = config.bot?.name || "Luffy-Ai";
  const hasContent = contentInfo?.text || contentInfo?.mediaBuffer;

  const autoJpmCfg = getAutoJpmConfig();
  const autoJpmStatus = autoJpmCfg.enabled ? "✅ Activo" : "❌ Inactivo";
  const currentDelay = db.setting("jedaJpm") || 5000;
  const blCount = (db.setting("jpmBlacklist") || []).length;
  const autoBlCount = (db.setting("autoJpmBlacklist") || []).length;

  let body =
    `📢 *JPM — Sistema de Broadcast Masivo*\n\n` +
    `Envía mensajes a todos los grupos, canales o destinos específicos de forma automática o manual.\n\n` +
    `*Estado actual:*\n` +
    `> ⏱️ Delay: *${(currentDelay / 1000).toFixed(1)} segundos*\n` +
    `> 🔄 AutoJPM: *${autoJpmStatus}*\n` +
    `> 🚫 Blacklist JPM: *${blCount} grupos*\n` +
    `> 🚫 Blacklist Auto: *${autoBlCount} grupos*\n` +
    `> 📢 JPM en curso: *${global.statusjpm ? "⚠️ Sí" : "No"}*`;

  if (hasContent) {
    body +=
      `\n\n📝 *Contenido listo para enviar:*\n` +
      `> Texto: *${contentInfo?.text ? previewText(contentInfo.text) : "Nada"}*\n` +
      `> Media: *${contentInfo?.mediaBuffer ? contentInfo.mediaType : "Nada"}*\n\n` +
      `_Elige el modo de envío abajo para comenzar el broadcast_`;
  } else {
    body +=
      `\n\n💡 *Cómo usar:*\n` +
      `1. Envía texto, foto, audio o video\n` +
      `2. Responde a ese mensaje con *${prefix}jpm*\n` +
      `3. Elige el modo de envío en los botones de abajo\n\n` +
      `_O elige primero el modo y luego envía el contenido_`;
  }

  const buttons = [
    {
      name: "single_select",
      buttonParamsJson: JSON.stringify({
        title: "📢 Elige el Modo JPM",
        sections: [
          {
            title: "📨 MODO BROADCAST",
            rows: [
              {
                title: "📢 JPM Basic",
                description: "Envía el mensaje a todos los grupos sin etiqueta",
                id: `${prefix}jpm _mode_basic`,
              },
              {
                title: "👁️ JPM Hidetag",
                description: "Envía el mensaje a todos los grupos, etiqueta oculta",
                id: `${prefix}jpm _mode_hidetag`,
              },
              {
                title: "📺 JPM Channel",
                description: "Envía el mensaje a todos los canales de newsletter",
                id: `${prefix}jpm _mode_channel`,
              },
              {
                title: "🚀 JPM Update",
                description: "Transmite changelog/actualización a todos los grupos",
                id: `${prefix}jpm _mode_update`,
              },
              {
                title: "🔄 Auto JPM",
                description: "Configura el horario de transmisión automática según intervalo",
                id: `${prefix}jpm _mode_autojpm`,
              },
            ],
          },
          {
            title: "⚙️ CONFIGURACIÓN",
            rows: [
              {
                title: "⏱️ Configurar Delay JPM",
                description: `Delay actual: ${(currentDelay / 1000).toFixed(1)}s`,
                id: `${prefix}jpm _set_delay`,
              },
              {
                title: "🚫 Blacklist JPM",
                description: `Administra los grupos excluidos de JPM (${blCount})`,
                id: `${prefix}jpm _bl_jpm`,
              },
              {
                title: "🚫 Blacklist AutoJPM",
                description: `Administra los grupos excluidos de AutoJPM (${autoBlCount})`,
                id: `${prefix}jpm _bl_autojpm`,
              },
              {
                title: "⏹️ Stop JPM",
                description: "Detiene el JPM en curso",
                id: `${prefix}jpm _stop`,
              },
              {
                title: "📊 Estado AutoJPM",
                description: "Revisa el horario y detalles del Auto JPM",
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
      `> 📷 Media: *${mediaBuffer ? mediaType : "Nada"}*\n` +
      `> 👥 Destinos: *${groupIds.length}* ${mode === "channel" ? "canales" : "grupos"}\n` +
      `> ⏱️ Pausa: *${(jedaJpm / 1000).toFixed(1)} segundos*\n` +
      `> 📊 Estimado: *${Math.ceil((groupIds.length * jedaJpm) / 60000)} minutos*\n\n` +
      `_Enviando a todos los destinos..._ 🚀`,
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
    `──────────\n✅ *JPM ${modeLabel} Terminado!*\n` +
      `──────────\n` +
      `> ✅ Exitosos: *${successCount}*\n` +
      `> ❌ Fallidos: *${failedCount}*\n` +
      `> 📊 Total: *${groupIds.length}*`,
  );
}

function showHelp(m) {
  const p = m.prefix;
  return m.reply(
    `📢 *JPM — Sistema de Broadcast Masivo*\n\n` +
      `Sistema completo para enviar mensajes a todos los grupos, canales o destinos específicos de forma automática o manual.\n\n` +
      `*CÓMO USAR:*\n` +
      `› Escribe *${p}jpm* para abrir el menú interactivo\n` +
      `› Puedes responder/enviar texto, foto, audio o video y luego escribir *${p}jpm*\n` +
      `› Elige el modo de envío en los botones que aparecen\n\n` +
      `*MODOS DE BROADCAST:*\n` +
      `› 📢 *JPM Basic* — Envía el mensaje a todos los grupos sin etiqueta\n` +
      `› 👁️ *JPM Hidetag* — Envía el mensaje a todos los grupos, etiqueta oculta\n` +
      `› 📺 *JPM Channel* — Envía el mensaje a todos los canales de newsletter\n` +
      `› 🚀 *JPM Update* — Transmite changelog/actualización a todos los grupos\n` +
      `› 🔄 *Auto JPM* — Configura el horario de transmisión automática según intervalo\n\n` +
      `*CONFIGURACIÓN:*\n` +
      `› ⏱️ *Configurar Delay* — Pausa entre envíos por grupo\n` +
      `› 🚫 *Blacklist JPM* — Administra los grupos excluidos de JPM\n` +
      `› 🚫 *Blacklist AutoJPM* — Administra los grupos excluidos de AutoJPM\n` +
      `› ⏹️ *Stop JPM* — Detiene el JPM en curso\n\n` +
      `*FORMATO DE INTERVALO:*\n` +
      `› *10m* (10 minutos) • *1h* (1 hora) • *2h30m* (2 horas 30 minutos) • *1d* (1 día)`,
  );
}

async function handler(m, { sock }) {
  const db = getDatabase();
  const command = m.command?.toLowerCase() || "";
  const input = (m.text || "").trim();
  const fullInput = (m.fullArgs || m.text || "").trim();

  if (command === "stopjpm" || command === "stopjasher") {
    if (!global.statusjpm)
      return m.reply(`❌ No hay ningún JPM en curso.`);
    global.stopjpm = true;
    m.react("⏹️");
    return m.reply(`⏹️ *JPM Detenido*\n\n> Deteniendo el proceso JPM...`);
  }

  if (
    command === "configurar_pausa_jpm" ||
    command === "delayjpm" ||
    command === "pausa_jpm"
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
      return m.reply(`❌ No hay ningún JPM en curso.`);
    global.stopjpm = true;
    m.react("⏹️");
    return m.reply(`⏹️ *JPM Detenido*\n\n> Deteniendo el proceso JPM...`);
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
      `Envía primero un mensaje, foto, audio o video, luego responde con *${m.prefix}jpm* y elige el modo de envío.\n\n` +
      `*Forma correcta:*\n` +
      `1. Envía texto/foto/video/audio\n` +
      `2. Responde a ese mensaje con *${m.prefix}jpm*\n` +
      `3. Elige el modo en los botones que aparecen`,
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
      `❌ *JPM en Curso*\n\n> Escribe *${m.prefix}stopjpm* para detenerlo primero.`,
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
          `> El bot no encontró grupos disponibles${blacklistedCount > 0 ? ` (${blacklistedCount} grupos en blacklist)` : ""}`,
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
        `Envía un mensaje broadcast a todos los grupos${mode === "hidetag" ? " con etiqueta oculta a todos los miembros" : ""}.\n\n` +
        `*USO:*\n` +
        `> *${m.prefix}${mode === "hidetag" ? "jpmht" : "jpm"} <mensaje>*\n` +
        `> *${m.prefix}${mode === "hidetag" ? "jpmht" : "jpm"}* (responde foto/video)\n\n` +
        `*EJEMPLO:*\n` +
        `> *${m.prefix}${mode === "hidetag" ? "jpmht" : "jpm"} ¡Hola a todos! No olviden el evento de mañana.*`,
    );
  }

  if (global.statusjpm) {
    return m.reply(
      `❌ *JPM en Curso*\n\n> Escribe *${m.prefix}stopjpm* para detenerlo.`,
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
        `❌ *Sin Grupos*\n\n> El bot no encontró grupos disponibles${blacklistedCount > 0 ? ` (${blacklistedCount} grupos en blacklist)` : ""}`,
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
      `📢 *JPM Channel*\n\n` +
        `Envía mensajes a todos los canales de WhatsApp a los que el bot está suscrito.\n\n` +
        `*USO:*\n` +
        `> *${m.prefix}jpmch <mensaje>*\n` +
        `> *${m.prefix}jpmch* (responde foto/video)\n\n` +
        `*EJEMPLO:*\n` +
        `> *${m.prefix}jpmch ¡Hola a todos, sigan nuestras últimas novedades!*`,
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
      `❌ *JPM en Curso*\n\n> Escribe *${m.prefix}stopjpm* para detenerlo.`,
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
        `❌ *Sin Canales*\n\n> El bot no está suscrito a ningún canal`,
      );
    }

    const jedaJpm = db.setting("jedaJpm") || 5000;
    const ctx = saluranCtx();

    await m.reply(
      `📢 *JPM Channel Iniciado*\n\n` +
        `> 📝 Mensaje: *${text.substring(0, 50)}${text.length > 50 ? "..." : ""}*\n` +
        `> 📷 Media: *${mediaBuffer ? mediaType : "Nada"}*\n` +
        `> 📺 Destinos: *${channelIds.length}* canales\n` +
        `> ⏱️ Pausa: *${(jedaJpm / 1000).toFixed(1)} segundos*\n\n` +
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
          `⏹️ *JPM Channel Detenido*\n\n` +
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
      `✅ *JPM Channel Terminado!*\n\n` +
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
      `📢 *JPM Update*\n\n` +
        `¡Envía información de actualización / changelog a todos los grupos!\n\n` +
        `*FORMATO:*\n` +
        `> *${m.prefix}jpmupdate <versión> | <contenido del changelog>*\n\n` +
        `*EJEMPLO:*\n` +
        `> *${m.prefix}jpmupdate v3.0 | Funciones nuevas: - JPM Hidetag - Sistema AFK*`,
    );
  }
  return handleJpmUpdateWithContent(m, sock, db, input);
}

async function handleJpmUpdateWithContent(m, sock, db, input) {
  if (global.statusjpm) {
    return m.reply(
      `❌ *JPM en Curso*\n\n> Escribe *${m.prefix}stopjpm* para detenerlo.`,
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
        `❌ *Sin Grupos*\n\n> El bot no encontró grupos disponibles${blacklistedCount > 0 ? ` (${blacklistedCount} grupos en blacklist)` : ""}`,
      );
    }

    const botName = config.bot?.name || "Luffy-Ai";
    const dateStr = timeHelper.formatDate("DD MMMM YYYY");
    const updateMessage =
      `🚀 *UPDATE !! | ${version}*\n\n` +
      `📅 *Fecha:* ${dateStr}\n\n` +
      `*CHANGELOG:*\n${changelog}\n\n` +
      `*NOTA ACTUALIZADA:*\n` +
      `> 💡 Escribe *${m.prefix}menu* para explorar estas funciones.\n` +
      `> 📢 _Gracias por usar ${botName}_`;

    const jedaJpm = db.setting("jedaJpm") || 5000;

    await m.reply(
      `📢 *JPM Update Iniciado*\n\n` +
        `> 🏷️ Versión: *${version}*\n` +
        `> 👥 Destinos: *${groupIds.length}* grupos\n` +
        `> ⏱️ Pausa: *${(jedaJpm / 1000).toFixed(1)} segundos*\n\n` +
        `_Transmitiendo la actualización a todos los grupos..._`,
    );

    global.statusjpm = true;
    let successCount = 0;
    let failedCount = 0;

    for (const groupId of groupIds) {
      if (global.stopjpm) {
        delete global.stopjpm;
        delete global.statusjpm;
        await m.reply(
          `⏹️ *JPM Update Detenido*\n\n` +
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
      `✅ *JPM Update Terminado!*\n\n` +
        `> ✅ Exitosos: *${successCount}*\n` +
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
    `El bot enviará mensajes automáticamente a todos los grupos según el intervalo de tiempo que definas.\n\n`;

  if (hasContent) {
    body +=
      `📝 *Contenido que se enviará:*\n` +
      `> Texto: *${session.text ? previewText(session.text) : "Nada"}*\n` +
      `> Media: *${session.mediaBuffer ? session.mediaType : "Nada"}*\n\n`;
  }

  body +=
    `*Elige el intervalo abajo:*\n` +
    `> Cuanto mayor sea el intervalo, más seguro frente a la detección de spam.\n` +
    `> Mínimo: *15 minutos*`;

  const buttons = [
    {
      name: "single_select",
      buttonParamsJson: JSON.stringify({
        title: "⏱️ Elige el Intervalo",
        sections: [
          {
            title: "⏱️ INTERVALOS POPULARES",
            rows: [
              {
                title: "🕐 15 Minutos",
                description: "Ideal para recordatorios cortos",
                id: `${prefix}jpm _autojpm_interval_15m`,
              },
              {
                title: "🕐 30 Minutos",
                description: "Intervalo estándar",
                id: `${prefix}jpm _autojpm_interval_30m`,
              },
              {
                title: "🕐 1 Hora",
                description: "El más usado",
                id: `${prefix}jpm _autojpm_interval_1h`,
              },
              {
                title: "🕐 2 Horas",
                description: "Seguro y poco molesto",
                id: `${prefix}jpm _autojpm_interval_2h`,
              },
              {
                title: "🕐 3 Horas",
                description: "Muy seguro frente al spam",
                id: `${prefix}jpm _autojpm_interval_3h`,
              },
              {
                title: "🕐 6 Horas",
                description: "Una vez cada medio día",
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
                  "Escribe tu propio intervalo (ejemplo: .autojpm on 2h30m mensaje)",
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
    title: `🔄 ${config.bot?.name || "Luffy-Ai"} AutoJPM`,
    body,
    footer: `${config.bot?.name || "Luffy-Ai"} AutoJPM`,
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
    return m.reply(
      `❌ El intervalo mínimo es de *15 minutos* para evitar spam.`,
    );

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
      `❌ *Mensaje o Media Obligatorio*\n\n> Envía el contenido primero, luego escribe *${m.prefix}jpm* y elige Auto JPM.`,
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
    `✅ *Auto JPM Activo!*\n\n` +
      `> ⏱️ Intervalo: *${formatInterval(intervalMs)}*\n` +
      `> 🕒 Primera vez: *${timeHelper.fromTimestamp(updatedConfig.nextRun)}*\n` +
      `> 📷 Media: *${updatedConfig.message.media?.type || "Nada"}*\n` +
      `> 📝 Mensaje: *${previewText(updatedConfig.message.text)}*\n\n` +
      `_AutoJPM se ejecutará automáticamente según el horario._`,
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
    if (!current.enabled) return m.reply(`ℹ️ AutoJPM ya está inactivo.`);
    setAutoJpmConfig({ ...current, enabled: false });
    stopAutoJpmScheduler();
    return m.reply(
      `✅ *AutoJPM Desactivado*\n\n> El horario de transmisión automática se ha apagado.`,
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
    return m.reply(
      `❌ El intervalo mínimo es de *15 minutos* para evitar spam.`,
    );

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
    `✅ *Auto JPM Activo!*\n\n` +
      `> ⏱️ Intervalo: *${formatInterval(intervalMs)}*\n` +
      `> 🕒 Primera vez: *${timeHelper.fromTimestamp(updatedConfig.nextRun)}*\n` +
      `> 📷 Media: *${updatedConfig.message.media?.type || "Nada"}*\n` +
      `> 📝 Mensaje: *${previewText(updatedConfig.message.text)}*`,
  );
}

function showAutoJpmStatus(m) {
  const current = getAutoJpmConfig();
  if (!current?.message)
    return m.reply(
      `ℹ️ AutoJPM aún no está configurado. Escribe *${m.prefix}jpm* para configurarlo.`,
    );
  return m.reply(
    `📢 *Estado del Auto JPM*\n\n` +
      `> Estado: *${current.enabled ? "✅ Activo" : "❌ Inactivo"}*\n` +
      `> Intervalo: *${formatInterval(current.intervalMs || 0)}*\n\n` +
      `*Horario:*\n` +
      `> Última: *${current.lastRun ? timeHelper.fromTimestamp(current.lastRun) : "Nunca"}*\n` +
      `> Siguiente: *${current.nextRun ? timeHelper.fromTimestamp(current.nextRun) : "Sin programar"}*\n\n` +
      `*Mensaje:*\n` +
      `> Texto: *${previewText(current.message?.text)}*\n` +
      `> Media: *${current.message?.media?.type ? current.message.media.type.toUpperCase() : "Nada"}*`,
  );
}

async function handleSetDelay(m, sock, db, input) {
  const current = db.setting("jedaJpm") || 5000;
  const prefix = m.prefix;

  if (!input) {
    const body =
      `⏱️ *JPM Delay*\n\n` +
      `Configura la pausa entre el envío de mensajes a cada grupo.\n` +
      `Cuanto mayor sea el delay, más seguro frente a la detección de spam.\n\n` +
      `> Delay actual: *${current}ms* (*${(current / 1000).toFixed(1)} segundos*)\n\n` +
      `*Elige el delay abajo:*`;

    const buttons = [
      {
        name: "single_select",
        buttonParamsJson: JSON.stringify({
          title: "⏱️ Elige el Delay",
          sections: [
            {
              title: "⏱️ DELAYS POPULARES",
              rows: [
                {
                  title: "⚡ 1 segundo",
                  description: "Muy rápido, alto riesgo de spam",
                  id: `${prefix}jpm _delay_1000`,
                },
                {
                  title: "⚡ 2 segundos",
                  description: "Rápido, riesgo de spam medio",
                  id: `${prefix}jpm _delay_2000`,
                },
                {
                  title: "⚡ 3 segundos",
                  description: "Estándar, bastante seguro",
                  id: `${prefix}jpm _delay_3000`,
                },
                {
                  title: "🕐 5 segundos",
                  description: "Seguro, el más usado",
                  id: `${prefix}jpm _delay_5000`,
                },
                {
                  title: "🕐 7 segundos",
                  description: "Muy seguro",
                  id: `${prefix}jpm _delay_7000`,
                },
                {
                  title: "🕐 10 segundos",
                  description: "El más seguro frente al spam",
                  id: `${prefix}jpm _delay_10000`,
                },
                {
                  title: "🕐 15 segundos",
                  description: "Para muchos grupos",
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
      title: `⏱️ ${config.bot?.name || "Luffy-Ai"} Delay`,
      body,
      footer: `${config.bot?.name || "Luffy-Ai"} JPM System`,
      buttons,
    });
  }

  const ms = parseInt(input);
  if (isNaN(ms) || ms < 1000 || ms > 30000) {
    return m.reply(
      `❌ El delay debe estar entre *1000ms* (1 segundo) y *30000ms* (30 segundos)`,
    );
  }
  db.setting("jedaJpm", ms);
  return m.reply(
    `✅ *Delay JPM Cambiado*\n\n` +
      `> Antes: *${current}ms* (*${(current / 1000).toFixed(1)} segundos*)\n` +
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
      `📋 *Lista de Grupos & Blacklist ${label}*\n\n` +
      `Estos son *${groups.length} grupos* a los que sigue el bot *${config.bot?.name}*\n` +
      `La marca *🚫* significa que el grupo está en blacklist.\n\n`;
    for (let i = 0; i < groups.length; i++) {
      const isBlacklisted = blacklist.includes(groups[i].id);
      listText += `*${i + 1}.* ${groups[i].subject}${isBlacklisted ? " 🚫" : ""}\n`;
    }
    listText +=
      `\n*CÓMO PONER/QUITAR DE BLACKLIST:*\n` +
      `Escribe el comando seguido del número de grupo (pueden ser varios, separados por espacios).\n\n` +
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
        toggled.push(`*${num}.* ${targetGroup.subject} ✅ *(Quitado del blacklist)*`);
      } else {
        blacklist.push(targetGroup.id);
        toggled.push(`*${num}.* ${targetGroup.subject} 🚫 ~(En blacklist)~`);
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
  return m.reply(`📢 *Blacklist ${label} Actualizado*\n\n${toggled.join("\n")}`);
}

export { pluginConfig as config, handler };
