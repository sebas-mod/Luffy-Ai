import { getDatabase } from "../../src/lib/luffy-database.js";
import { fetchGroupsSafe } from "../../src/lib/luffy-jpm-helper.js";
import { saluranCtx } from "../../src/lib/luffy-context.js";
import config from "../../config.js";
import te from "../../src/lib/luffy-error.js";

const pluginConfig = {
  name: "difusion_grupo",
  alias: ["broadcastgc", "bcgroup", "pausa_bcgc", "delaybcgc", "configurar_pausa_bcgc", "stopbcgc", "stopbroadcastgc"],
  category: "owner",
  description:
    "Transmitir mensajes a todos los grupos con soporte de todo tipo de medios",
  usage: ".bcgc",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  carne: 0,
  isEnabled: true,
};

function parseDelay(input) {
  if (!input) return null;
  const match = input.match(/^(\d+)(s|m|h|d)$/i);
  if (!match) return null;
  const val = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  switch (unit) {
    case "s":
      return val * 1000;
    case "m":
      return val * 60 * 1000;
    case "h":
      return val * 60 * 60 * 1000;
    case "d":
      return val * 24 * 60 * 60 * 1000;
    default:
      return null;
  }
}

function formatDelay(ms) {
  if (ms >= 86400000) return `${(ms / 86400000).toFixed(0)} días`;
  if (ms >= 3600000) return `${(ms / 3600000).toFixed(0)} horas`;
  if (ms >= 60000) return `${(ms / 60000).toFixed(0)} minutos`;
  return `${(ms / 1000).toFixed(0)} segundos`;
}

async function handler(m, { sock }) {
  const db = getDatabase();
  const command = m.command?.toLowerCase() || "";
  const input = m.fullArgs?.trim() || m.text?.trim() || "";

  if (command === "stopbcgc" || command === "stopbroadcastgc") {
    if (!global.statusBcgc) {
      return m.reply(`❌ No hay un broadcast de grupos en curso.`);
    }
    global.stopBcgc = true;
    m.react("⏹️");
    return m.reply(
      `⏹️ *Broadcast de Grupos Detenido*\n\n> Deteniendo el proceso de broadcast...`,
    );
  }

  if (
    command === "pausa_bcgc" ||
    command === "delaybcgc" ||
    command === "configurar_pausa_bcgc"
  ) {
    return handleSetDelay(m, db, input);
  }

  if (input.toLowerCase() === "on") {
    db.setting("bcgcEnabled", true);
    return m.reply(
      `✅ *Broadcast de Grupos Activado*\n\n> Ahora puedes enviar broadcast a todos los grupos.`,
    );
  }

  if (input.toLowerCase() === "off") {
    db.setting("bcgcEnabled", false);
    return m.reply(
      `✅ *Broadcast de Grupos Desactivado*\n\n> El broadcast de grupos se ha apagado.`,
    );
  }

  if (!input && !m.quoted) {
    const enabled = db.setting("bcgcEnabled");
    const jeda = db.setting("jedaBcgc") || 5000;
    return m.reply(
      `📢 *Broadcast de Grupos*\n\n` +
        `Envía mensajes a todos los grupos a la vez con un solo comando.\n\n` +
        `*Estado actual:*\n` +
        `> Broadcast: *${enabled ? "✅ Activo" : "❌ Inactivo"}*\n` +
        `> Pausa: *${formatDelay(jeda)}* (*${jeda}ms*)\n\n` +
        `*USO:*\n` +
        `> *${m.prefix}difusion_grupo on* — Activar el broadcast\n` +
        `> *${m.prefix}difusion_grupo off* — Desactivar el broadcast\n` +
        `> *${m.prefix}difusion_grupo <mensaje>* — Enviar broadcast de texto\n` +
        `> *${m.prefix}difusion_grupo* (responde foto/vídeo/audio/documento) — Enviar con media\n` +
        `> *${m.prefix}difusion_grupo* (responde un mensaje de texto) — Enviar el contenido del mensaje respondido\n\n` +
        `*PAUSA:*\n` +
        `> *${m.prefix}jedabcgc 5s* — Configurar pausa de 5 segundos\n` +
        `> *${m.prefix}jedabcgc 2m* — Configurar pausa de 2 minutos\n\n` +
        `*DETENER:*\n` +
        `> *${m.prefix}stopbcgc* — Detener el broadcast en curso`,
    );
  }

  if (global.statusBcgc) {
    return m.reply(
      `❌ *Broadcast En Curso*\n\n> Escribe *${m.prefix}stopbcgc* para detenerlo primero.`,
    );
  }

  const enabled = db.setting("bcgcEnabled");
  if (!enabled) {
    return m.reply(
      `❌ *Broadcast Aún No Activo*\n\n> Escribe *${m.prefix}difusion_grupo on* primero para activarlo.`,
    );
  }

  m.react("📢");

  try {
    let mediaBuffer = null;
    let mediaType = null;
    let text = input || "";
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
    } else if (qmsg.isSticker) {
      try {
        mediaBuffer = await qmsg.download();
        mediaType = "sticker";
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

    if (!text && !mediaBuffer) {
      m.react("❌");
      return m.reply(
        `❌ *Sin Contenido*\n\n` +
          `Envía un mensaje, foto, audio, vídeo o documento primero.\n\n` +
          `*La forma correcta:*\n` +
          `1. Envía texto/foto/vídeo/audio/documento\n` +
          `2. Responde a ese mensaje con *${m.prefix}difusion_grupo*\n` +
          `3. El bot hará broadcast a todos los grupos`,
      );
    }

    const allGroups = await fetchGroupsSafe(sock);
    let groupIds = Object.keys(allGroups);

    const blacklist = db.setting("jpmBlacklist") || [];
    const blCount = groupIds.filter((id) => blacklist.includes(id)).length;
    groupIds = groupIds.filter((id) => !blacklist.includes(id));

    if (groupIds.length === 0) {
      m.react("❌");
      return m.reply(
        `❌ *Sin Grupos*\n\n> El bot no encontró grupos a los que enviar${blCount > 0 ? ` (${blCount} grupos en la lista negra)` : ""}`,
      );
    }

    const jeda = db.setting("jedaBcgc") || 5000;
    const ctx = saluranCtx();

    await m.reply(
      `📢 *Broadcast de Grupos Iniciado*\n\n` +
        `> 📝 Mensaje: *${text.substring(0, 50)}${text.length > 50 ? "..." : ""}*\n` +
        `> 📷 Media: *${mediaBuffer ? mediaType : "Ninguna"}*\n` +
        `> 👥 Destino: *${groupIds.length}* grupos\n` +
        `> ⏱️ Pausa: *${formatDelay(jeda)}*\n` +
        `> 📊 Estimado: *${Math.ceil((groupIds.length * jeda) / 60000)} minutos*\n\n` +
        `_Enviando a todos los grupos..._`,
    );

    global.statusBcgc = true;
    let success = 0;
    let failed = 0;

    for (const gid of groupIds) {
      if (global.stopBcgc) {
        delete global.stopBcgc;
        delete global.statusBcgc;
        await m.reply(
          `⏹️ *Broadcast de Grupos Detenido*\n\n` +
            `> ✅ Exitosos: *${success}*\n` +
            `> ❌ Fallidos: *${failed}*\n` +
            `> ⏸️ Restantes: *${groupIds.length - success - failed}*`,
        );
        return;
      }

      try {
        if (mediaType === "sticker") {
          await sock.sendMessage(
            gid,
            { sticker: mediaBuffer, contextInfo: ctx },
            { quoted: m },
          );
        } else if (mediaType === "audio") {
          await sock.sendMessage(
            gid,
            {
              audio: mediaBuffer,
              mimetype: qmsg.mimetype || "audio/mpeg",
              ptt: qmsg.ptt || false,
              contextInfo: ctx,
            },
            { quoted: m },
          );
        } else if (mediaType === "document") {
          await sock.sendMessage(
            gid,
            {
              document: mediaBuffer,
              mimetype: qmsg.mimetype || "application/octet-stream",
              fileName: qmsg.fileName || "file",
              caption: text || undefined,
              contextInfo: ctx,
            },
            { quoted: m },
          );
        } else if (mediaBuffer) {
          await sock.sendMessage(
            gid,
            {
              [mediaType]: mediaBuffer,
              caption: text,
              contextInfo: ctx,
            },
            { quoted: m },
          );
        } else {
          await sock.sendMessage(
            gid,
            { text, contextInfo: ctx },
            { quoted: m },
          );
        }
        success++;
      } catch {
        failed++;
      }

      await new Promise((r) => setTimeout(r, jeda));
    }

    delete global.statusBcgc;
    m.react("✅");
    await m.reply(
      `✅ *¡Broadcast de Grupos Completado!*\n\n` +
        `> ✅ Exitosos: *${success}*\n` +
        `> ❌ Fallidos: *${failed}*\n` +
        `> 📊 Total: *${groupIds.length}*`,
    );
  } catch (e) {
    delete global.statusBcgc;
    m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

async function handleSetDelay(m, db, input) {
  const current = db.setting("jedaBcgc") || 5000;

  if (!input) {
    return m.reply(
      `⏱️ *Pausa del Broadcast de Grupos*\n\n` +
        `Configura la pausa entre los envíos de mensajes a cada grupo.\n` +
        `Cuanto mayor sea la pausa, más seguro estás de la detección de spam.\n\n` +
        `> Pausa actual: *${formatDelay(current)}* (*${current}ms*)\n\n` +
        `*CÓMO USAR:*\n` +
        `> *${m.prefix}jedabcgc <número><unidad>*\n\n` +
        `*UNIDADES:*\n` +
        `> *s* — segundos • *m* — minutos • *h* — horas • *d* — días\n\n` +
        `*EJEMPLO:*\n` +
        `> *${m.prefix}jedabcgc 5s* → 5 segundos\n` +
        `> *${m.prefix}jedabcgc 2m* → 2 minutos\n` +
        `> *${m.prefix}jedabcgc 1h* → 1 hora`,
    );
  }

  const ms = parseDelay(input);
  if (!ms || ms < 1000) {
    return m.reply(`❌ Formato incorrecto. Ejemplo: *5s*, *2m*, *1h*, *1d*`);
  }

  db.setting("jedaBcgc", ms);
  return m.reply(
    `✅ *Pausa del Broadcast de Grupos Cambiada*\n\n` +
      `> Antes: *${formatDelay(current)}* (*${current}ms*)\n` +
      `> Ahora: *${formatDelay(ms)}* (*${ms}ms*)\n\n` +
      `> Estimación para 100 grupos: *${Math.ceil((100 * ms) / 60000)} minutos*`,
  );
}

export { pluginConfig as config, handler };
