import { getDatabase } from "../../src/lib/ourin-database.js";
import { fetchGroupsSafe } from "../../src/lib/ourin-jpm-helper.js";
import { saluranCtx } from "../../src/lib/ourin-context.js";
import config from "../../config.js";
import te from "../../src/lib/ourin-error.js";

const pluginConfig = {
  name: "bcgc",
  alias: [
    "broadcastgc",
    "bcgroup",
    "jedabcgc",
    "delaybcgc",
    "setjedabcgc",
    "stopbcgc",
    "stopbroadcastgc",
  ],
  category: "owner",
  description:
    "Envía un mensaje masivo a todos los grupos con soporte para todo tipo de medios",
  usage: ".bcgc",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
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
  if (ms >= 86400000) return `${(ms / 86400000).toFixed(0)} día(s)`;
  if (ms >= 3600000) return `${(ms / 3600000).toFixed(0)} hora(s)`;
  if (ms >= 60000) return `${(ms / 60000).toFixed(0)} minuto`;
  return `${(ms / 1000).toFixed(0)} segundo`;
}

async function handler(m, { sock }) {
  const db = getDatabase();
  const command = m.command?.toLowerCase() || "";
  const input = m.fullArgs?.trim() || m.text?.trim() || "";

  if (command === "stopbcgc" || command === "stopbroadcastgc") {
    if (!global.statusBcgc) {
      return m.reply(`❌ No hay broadcast de grupos en ejecución.`);
    }
    global.stopBcgc = true;
    m.react("⏹️");
    return m.reply(
      `⏹️ *Broadcast Grup Dihentikan*\n\n> El proceso de broadcast ha sido detenido...`,
    );
  }

  if (
    command === "jedabcgc" ||
    command === "delaybcgc" ||
    command === "setjedabcgc"
  ) {
    return handleSetDelay(m, db, input);
  }

  if (input.toLowerCase() === "on") {
    db.setting("bcgcEnabled", true);
    return m.reply(
      `✅ *Broadcast Grup Diactivokan*\n\n> Ahora puedes enviar broadcast a todos los grupos.`,
    );
  }

  if (input.toLowerCase() === "off") {
    db.setting("bcgcEnabled", false);
    return m.reply(
      `✅ *Broadcast Grup Dinonactivokan*\n\n> El broadcast de grupos ha sido desactivado.`,
    );
  }

  if (!input && !m.quoted) {
    const enabled = db.setting("bcgcEnabled");
    const jeda = db.setting("jedaBcgc") || 5000;
    return m.reply(
      `📢 *Broadcast Grup*\n\n` +
        `Envía un mensaje a todos los grupos a la vez en un solo comando.\n\n` +
        `*Status actualmente:*\n` +
        `> Broadcast: *${enabled ? "✅ Aktif" : "❌ Nonaktif"}*\n` +
        `> Jeda: *${formatDelay(jeda)}* (*${jeda}ms*)\n\n` +
        `*PENGGUNAAN:*\n` +
        `> *${m.prefix}bcgc on* — Activokan broadcast\n` +
        `> *${m.prefix}bcgc off* — Nonactivokan broadcast\n` +
        `> *${m.prefix}bcgc <mensaje>* — Envía broadcast texto\n` +
        `> *${m.prefix}bcgc* (reply foto/video/audio/documento) — Envía con media\n` +
        `> *${m.prefix}bcgc* (reply mensaje texto) — Envía el contenido del mensaje que fue respondido\n\n` +
        `*JEDA:*\n` +
        `> *${m.prefix}jedabcgc 5s* — Set jeda 5 segundo\n` +
        `> *${m.prefix}jedabcgc 2m* — Set jeda 2 minuto\n\n` +
        `*STOP:*\n` +
        `> *${m.prefix}stopbcgc* — Detener el broadcast en ejecución`,
    );
  }

  if (global.statusBcgc) {
    return m.reply(
      `❌ *Broadcast está en ejecución*\n\n> Escribe *${m.prefix}stopbcgc* para detenerlo primero.`,
    );
  }

  const enabled = db.setting("bcgcEnabled");
  if (!enabled) {
    return m.reply(
      `❌ *Broadcast Aún no Activo*\n\n> Escribe *${m.prefix}bcgc on* primero para activarlo.`,
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
        mediaType = "sticar";
      } catch {}
    } else if (
      qmsg.isDocument ||
      (qmsg.mimetype && !qmsg.mimetype.startsWith("text/potro"))
    ) {
      try {
        mediaBuffer = await qmsg.download();
        mediaType = "document";
      } catch {}
    }

    if (!text && !mediaBuffer) {
      m.react("❌");
      return m.reply(
        `❌ *No hay contenido*\n\n` +
          `Envía un mensaje, foto, audio, video, o documento primero.\n\n` +
          `*Forma correcta:*\n` +
          `1. Envía texto/foto/video/audio/documento\n` +
          `2. Reply mensaje dicho con *${m.prefix}bcgc*\n` +
          `3. Bot va a broadcast a todos los grupos`,
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
        `❌ *No hay grupos*\n\n> El bot no encontró grupos a los que pueda enviar${blCount > 0 ? ` (${blCount} grup di-blacklist)` : ""}`,
      );
    }

    const jeda = db.setting("jedaBcgc") || 5000;
    const ctx = saluranCtx();

    await m.reply(
      `📢 *Broadcast Grup Dimulai*\n\n` +
        `> 📝 Mensaje: *${text.substring(0, 50)}${text.length > 50 ? "..." : ""}*\n` +
        `> 📷 Media: *${mediaBuffer ? mediaType : "No hay"}*\n` +
        `> 👥 Target: *${groupIds.length}* grup\n` +
        `> ⏱️ Jeda: *${formatDelay(jeda)}*\n` +
        `> 📊 Estimasi: *${Math.ceil((groupIds.length * jeda) / 60000)} minuto*\n\n` +
        `_Está enviando a todos los grupos..._`,
    );

    global.statusBcgc = true;
    let success = 0;
    let failed = 0;

    for (const gid of groupIds) {
      if (global.stopBcgc) {
        delete global.stopBcgc;
        delete global.statusBcgc;
        await m.reply(
          `⏹️ *Broadcast Grup Dihentikan*\n\n` +
            `> ✅ Éxito: *${success}*\n` +
            `> ❌ Fallo: *${failed}*\n` +
            `> ⏸️ Sisa: *${groupIds.length - success - failed}*`,
        );
        return;
      }

      try {
        if (mediaType === "sticar") {
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
      `✅ *Broadcast Grup Selesai!*\n\n` +
        `> ✅ Éxito: *${success}*\n` +
        `> ❌ Fallo: *${failed}*\n` +
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
      `⏱️ *Jeda Broadcast Grup*\n\n` +
        `Ajusta el tiempo de pausa entre el envío de mensajes a cada grupo.\n` +
        `Cuanto mayor sea la pausa, más seguro estarás contra la detección de spam.\n\n` +
        `> Jeda actualmente: *${formatDelay(current)}* (*${current}ms*)\n\n` +
        `*CARA PAKAI:*\n` +
        `> *${m.prefix}jedabcgc <angka><satuan>*\n\n` +
        `*SATUAN:*\n` +
        `> *s* — segundo • *m* — minuto • *h* — hora • *d* — día\n\n` +
        `*CONTOH:*\n` +
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
    `✅ *Jeda Broadcast Grup Diubah*\n\n` +
      `> Antes denya: *${formatDelay(current)}* (*${current}ms*)\n` +
      `> Ahora: *${formatDelay(ms)}* (*${ms}ms*)\n\n` +
      `> Estimasi 100 grup: *${Math.ceil((100 * ms) / 60000)} minuto*`,
  );
}

export { pluginConfig as config, handler };
