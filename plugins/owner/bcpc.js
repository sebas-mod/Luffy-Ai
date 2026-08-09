import { getDatabase } from "../../src/lib/luffy-database.js";
import {
  decodeAndNormalize,
  isLidConverted,
  resolveAnyLidToJid,
} from "../../src/lib/luffy-lid.js";
import config from "../../config.js";

const pluginConfig = {
  name: "bcpc",
  alias: ["broadcastpc", "bcprivate"],
  category: "owner",
  description: "Broadcast pesan ke semua kontak private chat",
  usage: ".bcpc <pesan>",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  carne: 0,
  isEnabled: true,
};

function getBcContextInfo() {
  const saluranId = config.saluran?.id || "";
  const saluranName = config.saluran?.name || config.bot?.name || "";
  const ctx = {
    forwardingScore: 1,
    isForwarded: true,
  };
  if (saluranId && saluranId !== "-@newsletter") {
    ctx.forwardedNewsletterMessageInfo = {
      newsletterJid: saluranId,
      newsletterName: saluranName,
      serverMessageId: Math.floor(Math.random() * 1000) + 1,
    };
  }
  return ctx;
}

async function handler(m, { sock }) {
  const db = getDatabase();
  const input = m.fullArgs?.trim() || m.text?.trim() || "";

  if (!input) {
    const jeda = db.setting("jedaBcpc") || 5000;
    return m.reply(
      `📱 *BROADCAST DE CHAT PRIVADO*\n\n` +
        `Pausa: ${jeda}ms (${(jeda / 1000).toFixed(1)}s)\n\n` +
        `*USO:*\n` +
        `• \`${m.prefix}bcpc <mensaje>\` — Enviar a todos los contactos\n` +
        `• \`${m.prefix}bcpc (responde media)\` — Enviar con media\n\n` +
        `⚠️ *Advertencia:* El bot enviará el mensaje a todos los contactos guardados!\n\n` +
        `ℹ️ *Nota:* Los contactos solo se detectan si ya enviaron un mensaje al bot. Los contactos guardados que nunca hablaron con el bot no aparecerán.`,
    );
  }

  if (global.statusBcpc) {
    return m.reply(
      `❌ El broadcast privado está en curso.\nEscribe \`${m.prefix}stopbcpc\` para detenerlo.`,
    );
  }

  m.react("📱");

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

    const privateJids = new Set();
    const botNum = sock.user?.id?.split(":")[0] || "";
    const botLid = sock.user?.lid
      ? String(sock.user.lid).replace(/@.+/g, "")
      : null;
    const addJidIfNotBot = (jid) => {
      const decoded = decodeAndNormalize(jid);
      if (decoded && decoded.endsWith("@s.whatsapp.net")) {
        const resolved = isLidConverted(decoded)
          ? resolveAnyLidToJid(decoded, [])
          : decoded;
        if (isLidConverted(resolved)) return;
        const num = resolved.split("@")[0];
        if (num !== botNum && (!botLid || !resolved.includes(botLid))) {
          privateJids.add(resolved);
        }
      }
    };

    const chatsMap = sock.store?.chats;
    if (chatsMap) {
      for (const [jid] of chatsMap.entries()) addJidIfNotBot(jid);
    }

    const messagesMap = sock.store?.messages;
    if (messagesMap) {
      for (const [jid] of messagesMap.entries()) addJidIfNotBot(jid);
    }

    const contactsObj = sock.store?.contacts;
    if (contactsObj) {
      for (const jid of Object.keys(contactsObj)) addJidIfNotBot(jid);
    }

    if (privateJids.size === 0) {
      m.react("❌");
      return m.reply(
        "❌ No se encontraron contactos.\n\nAsegúrate de que el bot ya haya recibido un mensaje de ese contacto.",
      );
    }

    const filtered = [...privateJids];

    const jeda = db.setting("jedaBcpc") || 5000;
    const ctx = getBcContextInfo();

    await sock.sendMessage(
      m.chat,
      {
        text:
          `📱 *ʙʀᴏᴀᴅᴄᴀsᴛ ᴘʀɪᴠᴀᴅᴏ*\n\n` +
          `╭┈┈⬡「 📋 *ᴅᴇᴛᴀʟʟᴇ* 」\n` +
          `┃ 📝 ᴍᴇɴsᴀᴊᴇ: \`${input.substring(0, 50)}${input.length > 50 ? "..." : ""}\`\n` +
          `┃ 📷 ᴍᴇᴅɪᴀ: \`${mediaBuffer ? mediaType : "No"}\`\n` +
          `┃ 👥 ᴛᴀʀɢᴇᴛ: \`${filtered.length}\` contactos\n` +
          `┃ ⏱️ ᴘᴀᴜsᴀ: \`${jeda}ms\`\n` +
          `┃ 📊 ᴇsᴛɪᴍᴀᴄɪóɴ: \`${Math.ceil((filtered.length * jeda) / 60000)} minutos\`\n` +
          `╰┈┈⬡\n\n` +
          `> Iniciando broadcast...`,
        contextInfo: ctx,
      },
      { quoted: m },
    );

    global.statusBcpc = true;
    let success = 0;
    let failed = 0;

    for (const jid of filtered) {
      if (global.stopBcpc) {
        delete global.stopBcpc;
        break;
      }
      try {
        if (mediaBuffer) {
          await sock.sendMedia(jid, mediaBuffer, input, null, {
            type: mediaType,
            contextInfo: ctx,
          });
        } else {
          await sock.sendText(jid, input, null, { contextInfo: ctx });
        }
        success++;
      } catch {
        failed++;
      }
      await new Promise((r) => setTimeout(r, jeda));
    }

    delete global.statusBcpc;
    m.react("✅");

    await sock.sendMessage(
      m.chat,
      {
        text:
          `✅ *ʙʀᴏᴀᴅᴄᴀsᴛ ᴘʀɪᴠᴀᴅᴏ ᴄᴏᴍᴘʟᴇᴛᴀᴅᴏ*\n\n` +
          `╭┈┈⬡「 📊 *ʀᴇsᴜʟᴛᴀᴅᴏ* 」\n` +
          `┃ ✅ ᴇxɪᴛᴏsᴏs: \`${success}\`\n` +
          `┃ ❌ ғᴀʟʟɪᴅᴏs: \`${failed}\`\n` +
          `┃ 📊 ᴛᴏᴛᴀʟ: \`${filtered.length}\`\n` +
          `╰┈┈⬡`,
        contextInfo: ctx,
      },
      { quoted: m },
    );
  } catch (e) {
    delete global.statusBcpc;
    m.react("❌");
    m.reply("Falló: " + e.message);
  }
}

export { pluginConfig as config, handler };
