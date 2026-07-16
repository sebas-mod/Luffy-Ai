import {
  isToxic,
  handleToxicMessage,
  DEFAULT_TOXIC_WORDS,
} from "./antitoxic.js";
import config from "../../config.js";
import { getDatabase } from "../../src/lib/ourin-database.js";
import te from "../../src/lib/ourin-error.js";
import { saluranCtx } from "../../src/lib/ourin-context.js";
const pluginConfig = {
  name: "notifgantitag",
  alias: ["notiflabel", "notiftag", "labeltag"],
  category: "group",
  description: "Configurar notificación de cambio de etiqueta/tag de miembro",
  usage: ".notifgantitag <on/off>",
  example: ".notifgantitag on",
  isGroup: true,
  isAdmin: true,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};
async function handler(m, { sock }) {
  const db = getDatabase();
  const args = m.args || [];
  const sub = args[0]?.toLowerCase();
  const sub2 = args[1]?.toLowerCase();
  const groupData = db.getGroup(m.chat) || {};
  const currentStatus = groupData.notifLabelChange === true;
  if (sub === "on" && sub2 === "all") {
    if (!m.isOwner) {
      return m.reply(`❌ Hanya owner yang bisa menggunakan fitur ini!`);
    }
    m.react("🕕");
    try {
      const groups = await sock.groupFetchAllParticipating();
      const groupIds = Object.keys(groups);
      let count = 0;
      for (const groupId of groupIds) {
        db.setGroup(groupId, { notifLabelChange: true });
        count++;
      }
      m.react("✅");
      return m.reply(
        `✅ *ɴᴏᴛɪꜰ ᴇᴛɪǫᴜᴇᴛᴀ ɢʟᴏʙᴀʟ ᴏɴ*\n\n` +
          `> ¡Notificación de cambio de etiqueta activada en *${count}* grupos!`,
      );
    } catch (err) {
      m.react("☢");
      return m.reply(te(m.prefix, m.command, m.pushName));
    }
  }
  if (sub === "off" && sub2 === "all") {
    if (!m.isOwner) {
      return m.reply(`❌ ¡Solo el owner puede usar esta función!`);
    }
    m.react("🕕");
    try {
      const groups = await sock.groupFetchAllParticipating();
      const groupIds = Object.keys(groups);
      let count = 0;
      for (const groupId of groupIds) {
        db.setGroup(groupId, { notifLabelChange: false });
        count++;
      }
      m.react("✅");
      return m.reply(
        `❌ *ɴᴏᴛɪꜰ ᴇᴛɪǫᴜᴇᴛᴀ ɢʟᴏʙᴀʟ ᴏꜰꜰ*\n\n` +
          `> ¡Notificación de cambio de etiqueta desactivada en *${count}* grupos!`,
      );
    } catch (err) {
      m.react("☢");
      return m.reply(te(m.prefix, m.command, m.pushName));
    }
  }
  if (sub === "on") {
    if (currentStatus) {
      return m.reply(
        `⚠️ *ɴᴏᴛɪꜰ ᴇᴛɪǫᴜᴇᴛᴀ ʏᴀ ᴇsᴛᴀ ᴀᴄᴛɪᴠᴀ*\n\n` +
          `> Estado: *✅ ON*\n` +
          `> La notificación de cambio de etiqueta ya está activa en este grupo.\n\n` +
          `_Usa \`${m.prefix}notifgantitag off\` para desactivar._`,
      );
    }
    db.setGroup(m.chat, { notifLabelChange: true });
    return m.reply(
      `✅ *ɴᴏᴛɪꜰ ᴇᴛɪǫᴜᴇᴛᴀ ᴀᴄᴛɪᴠᴀ*\n\n` +
        `> ¡Notificación de cambio de etiqueta de miembros activada!\n` +
        `> El bot notificará cuando un miembro cambie de etiqueta.\n\n` +
        `_Ejemplo: Admin agrega la etiqueta "VIP" a un miembro_`,
    );
  }
  if (sub === "off") {
    if (!currentStatus) {
      return m.reply(
        `⚠️ *ɴᴏᴛɪꜰ ᴇᴛɪǫᴜᴇᴛᴀ ʏᴀ ᴇsᴛᴀ ᴅᴇsᴀᴄᴛɪᴠᴀᴅᴀ*\n\n` +
          `> Estado: *❌ OFF*\n` +
          `> La notificación de cambio de etiqueta ya está desactivada en este grupo.\n\n` +
          `_Usa \`${m.prefix}notifgantitag on\` para activar._`,
      );
    }
    db.setGroup(m.chat, { notifLabelChange: false });
    return m.reply(
      `❌ *ɴᴏᴛɪꜰ ᴇᴛɪǫᴜᴇᴛᴀ ɴᴏɴᴀᴄᴛɪᴠᴀ*\n\n` +
        `> ¡Notificación de cambio de etiqueta de miembros desactivada!`,
    );
  }
  m.reply(
    `🏷️ *ɴᴏᴛɪꜰ ᴄᴀᴍʙɪᴏ ᴅᴇ ᴛᴀɢ/ᴇᴛɪǫᴜᴇᴛᴀ*\n\n` +
      `> Estado: *${currentStatus ? "✅ ON" : "❌ OFF"}*\n\n` +
      `\`\`\`━━━ ᴏᴘᴄɪᴏɴᴇs ━━━\`\`\`\n` +
      `> \`${m.prefix}notifgantitag on\` → Activar\n` +
      `> \`${m.prefix}notifgantitag off\` → Desactivar\n` +
      `> \`${m.prefix}notifgantitag on all\` → Global ON (owner)\n` +
      `> \`${m.prefix}notifgantitag off all\` → Global OFF (owner)\n\n` +
      `> 📋 *Esta función notificará cuando:*\n` +
      `> • Admin agrega una etiqueta a un miembro\n` +
      `> • Admin elimina una etiqueta de un miembro\n` +
      `> • La etiqueta de un miembro cambia\n\n` +
      `_¡Shishishi! ¡Nada pasa desapercibido con Luffy!_`,
  );
}
async function handleLabelChange(msg, sock) {
  try {
    const db = getDatabase();
    const protocolMessage = msg.message?.protocolMessage;
    if (!protocolMessage) return false;
    if (protocolMessage.type !== 30) return false;
    const memberLabel = protocolMessage.memberLabel;
    if (!memberLabel) return false;
    const groupJid = msg.key.remoteJid;
    if (!groupJid?.endsWith("@g.us")) return false;
    const groupData = db.getGroup(groupJid) || {};
    const participant = msg.key.participant || msg.participant || "Unknown";
    const label = memberLabel.label || "";
    if (groupData.antitoxic && label && label.trim()) {
      try {
        const toxicWords = groupData.toxicWords || DEFAULT_TOXIC_WORDS;
        const toxicCheck = isToxic(label, toxicWords);
        if (toxicCheck.toxic) {
          await sock.sendText(
            groupJid,
            `Hei @${participant.split("@")[0]}, ¡Tu etiqueta contiene palabras tóxicas!`,
            null,
            {
              mentions: [participant],
              contextInfo: {
                ...saluranCtx(),
                mentionedJid: [participant],
              },
            },
          );
          return true;
        }
      } catch {}
    }
    if (groupData.notifLabelChange !== true) return false;
    let groupMeta = null;
    try {
      groupMeta = await sock.groupMetadata(groupJid);
    } catch {}
    let notifText = "";
    if (label && label.trim()) {
      notifText = `🎉 @${participant.split("@")[0]} ha cambiado su etiqueta a *${label}*`;
    } else {
      notifText = `🥗 @${participant.split("@")[0]} ha eliminado su etiqueta`;
    }
    console.log(notifText);
    await sock.sendText(groupJid, notifText, null, {
      mentions: [participant],
      contextInfo: {
        ...saluranCtx(),
        mentionedJid: [participant],
      },
    });
    return true;
  } catch (error) {
    console.error("[NotifLabelChange] Error:", error.message);
    return false;
  }
}
export { pluginConfig as config, handler, handleLabelChange };
