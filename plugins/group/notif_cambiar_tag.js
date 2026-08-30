import {
  isToxic,
  handleToxicMessage,
  DEFAULT_TOXIC_WORDS,
} from "./antitoxico.js";
import config from "../../config.js";
import { getDatabase } from "../../src/lib/luffy-database.js";
import te from "../../src/lib/luffy-error.js";
import { saluranCtx } from "../../src/lib/luffy-context.js";
const pluginConfig = {
  name: "notif_cambiar_tag",
  alias: ["notiflabel", "notiftag", "labeltag"],
  category: "group",
  description: "Configurar la notificación de cambio de etiqueta/tag de miembro",
  usage: ".notif_cambiar_tag <on/off>",
  example: ".notif_cambiar_tag on",
  isGroup: true,
  isAdmin: true,
  cooldown: 5,
  carne: 0,
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
      return m.reply("☽◯☾ ♰ "+`❌ Solo el owner puede usar esta función!`);
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
        `✅ *ɴᴏᴛɪꜰ ʟᴀʙᴇʟ ɢʟᴏʙᴀʟ ᴏɴ*\n\n` +
          `> La notificación de cambio de etiqueta se activó en *${count}* grupos!`,
      );
    } catch (err) {
      m.react("☢");
      return m.reply(te(m.prefix, m.command, m.pushName));
    }
  }
  if (sub === "off" && sub2 === "all") {
    if (!m.isOwner) {
      return m.reply("☽◯☾ ♰ "+`❌ Solo el owner puede usar esta función!`);
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
        `❌ *ɴᴏᴛɪꜰ ʟᴀʙᴇʟ ɢʟᴏʙᴀʟ ᴏꜰꜰ*\n\n` +
          `> La notificación de cambio de etiqueta se desactivó en *${count}* grupos!`,
      );
    } catch (err) {
      m.react("☢");
      return m.reply(te(m.prefix, m.command, m.pushName));
    }
  }
  if (sub === "on") {
    if (currentStatus) {
      return m.reply(
        `⚠️ *ɴᴏᴛɪꜰ ʟᴀʙᴇʟ ʏᴀ ᴀᴄᴛɪᴠᴀ*\n\n` +
          `> Estado: *✅ ON*\n` +
          `> La notificación de cambio de etiqueta ya está activa en este grupo.\n\n` +
          `_Usa \`${m.prefix}notif_cambiar_tag off\` para desactivarla._`,
      );
    }
    db.setGroup(m.chat, { notifLabelChange: true });
    return m.reply(
      `✅ *ɴᴏᴛɪꜰ ʟᴀʙᴇʟ ᴀᴄᴛɪᴠᴀ*\n\n` +
        `> La notificación de cambio de etiqueta de miembro se activó correctamente!\n` +
        `> El bot avisará cuando un miembro cambie su etiqueta.\n\n` +
        `_Ejemplo: Un admin agrega la etiqueta "VIP" a un miembro_`,
    );
  }
  if (sub === "off") {
    if (!currentStatus) {
      return m.reply(
        `⚠️ *ɴᴏᴛɪꜰ ʟᴀʙᴇʟ ʏᴀ ɪɴᴀᴄᴛɪᴠᴀ*\n\n` +
          `> Estado: *❌ OFF*\n` +
          `> La notificación de cambio de etiqueta ya está inactiva en este grupo.\n\n` +
          `_Usa \`${m.prefix}notif_cambiar_tag on\` para activarla._`,
      );
    }
    db.setGroup(m.chat, { notifLabelChange: false });
    return m.reply(
      `❌ *ɴᴏᴛɪꜰ ʟᴀʙᴇʟ ɪɴᴀᴄᴛɪᴠᴀ*\n\n` +
        `> La notificación de cambio de etiqueta de miembro se desactivó correctamente.`,
    );
  }
  m.reply(
    `🏷️ *ɴᴏᴛɪꜰ ᴄᴀᴍʙɪᴏ ᴅᴇ ᴛᴀɢ/ʟᴀʙᴇʟ*\n\n` +
      `> Estado: *${currentStatus ? "✅ ON" : "❌ OFF"}*\n\n` +
      `\`\`\`━━━ ᴏᴘᴄɪᴏɴᴇs ━━━\`\`\`\n` +
      `> \`${m.prefix}notif_cambiar_tag on\` → Activar\n` +
      `> \`${m.prefix}notif_cambiar_tag off\` → Desactivar\n` +
      `> \`${m.prefix}notif_cambiar_tag on all\` → Global ON (owner)\n` +
      `> \`${m.prefix}notif_cambiar_tag off all\` → Global OFF (owner)\n\n` +
      `> 📋 *Esta función avisará cuando:*\n` +
      `> • Un admin agregue una etiqueta a un miembro\n` +
      `> • Un admin elimine una etiqueta de un miembro\n` +
      `> • La etiqueta de un miembro cambie`,
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
            `Hola @${participant.split("@")[0]}, tu etiqueta contiene una palabra tóxica!`,
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
      notifText = `🎉 @${participant.split("@")[0]} cambió su etiqueta a *${label}*`;
    } else {
      notifText = `🥗 @${participant.split("@")[0]} eliminó su etiqueta`;
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
