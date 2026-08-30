import config from "../../config.js";
import te from "../../src/lib/luffy-error.js";
const pluginConfig = {
  name: "salir",
  alias: ["salirgrupo", "salirgc"],
  category: "owner",
  description: "El bot sale del grupo",
  usage: ".salir [link]",
  example: ".salir",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  carne: 0,
  isEnabled: true,
};

function extractInviteCode(text) {
  const patterns = [
    /chat\.whatsapp\.com\/([a-zA-Z0-9]{20,})/i,
    /wa\.me\/([a-zA-Z0-9]{20,})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1];
  }

  return null;
}

async function handler(m, { sock }) {
  const input = m.args.join(" ").trim();

  let targetGroupJid = null;
  let groupName = "";

  if (!input && m.isGroup) {
    targetGroupJid = m.chat;
    try {
      const meta = m.groupMetadata;
      groupName = meta.subject || "Este grupo";
    } catch {
      groupName = "Este grupo";
    }
  } else if (input) {
    const inviteCode = await extractInviteCode(input);

    if (!inviteCode) {
      return m.reply(`👑•─────•👑\n❌ *ꜰᴀʟʟɪᴅᴏ*\n\n> Enlace de invitación no válido\n♰ ──────── ♱`);
    }

    try {
      const groupInfo = await sock.groupGetInviteInfo(inviteCode);
      targetGroupJid = groupInfo.id;
      groupName = groupInfo.subject || "Unknown";
    } catch (error) {
      return m.reply(
        `👑•─────•👑\n❌ *ꜰᴀʟʟɪᴅᴏ*\n\n> No se pudo obtener la info del grupo desde el enlace\n♰ ──────── ♱`,
      );
    }
  } else {
    return m.reply(
      `🚪 *sᴀʟɪʀ ᴅᴇʟ ɢʀᴜᴘᴏ*\n\n` +
        `☽◯☾ ♰ 「 📋 *ᴄóᴍᴏ ᴜsᴀʀ* 」\n` +
        `┃ ◦ En el grupo: \`.salir\`\n` +
        `┃ ◦ Vía enlace: \`.salir <enlace>\`\n` +
        `╰━ ⊱༺༒༻⊰ ━╯\n\n` +
        `\`Ejemplo: ${m.prefix}salir https://chat.whatsapp.com/xxx\``,
    );
  }

  if (!targetGroupJid) {
    return m.reply(`👑•─────•👑\n❌ *ꜰᴀʟʟɪᴅᴏ*\n\n> Grupo no encontrado\n♰ ──────── ♱`);
  }

  await m.react("🕕");

  try {
    global.sewaLeaving = true;

    if (m.isGroup && targetGroupJid === m.chat) {
      await sock.sendMessage(m.chat, {
        text: `*🚪 El bot se saldrá del grupo, bye perras ✌️😂*

_by mi creador_`,
      });
    }

    await sock.groupLeave(targetGroupJid);

    global.sewaLeaving = false;

    if (!m.isGroup || targetGroupJid !== m.chat) {
      await m.react("✅");
      await m.reply(
        `✅ *sᴀʟɪᴅᴀ ᴇxɪᴛᴏsᴀ*\n\n` + `> El bot salió de: *${groupName}*`,
      );
    }
  } catch (error) {
    global.sewaLeaving = false;
    await m.react("☢");
    await m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
