const pluginConfig = {
  name: ["arsip", "archive"],
  alias: [],
  category: "owner",
  description: "Archiva o desarchiva un chat",
  usage: ".arsip <número/reply> o .arsip buka <número>",
  example: ".arsip 628xxx",
  isOwner: true,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const action = m.args[0]?.toLowerCase();
  let targetJid = null;
  let archive = true;

  if (action === "buka" || action === "unarchive") {
    archive = false;
    const num = (m.args[1] || "").replace(/[^0-9]/g, "");
    if (num) {
      targetJid = num + "@s.whatsapp.net";
    } else if (m.quoted) {
      targetJid = m.quoted.sender || m.quoted.participant;
    } else if (!m.isGroup) {
      targetJid = m.chat;
    }
  } else if (action === "todos") {
    try {
      await m.react("🕕");
      global.isFetchingGroups = true;
      const groups = await sock.groupFetchAllParticipating();
      global.isFetchingGroups = false;
      const groupIds = Object.keys(groups);
      let count = 0;
      for (const jid of groupIds) {
        try {
          await sock.chatModify({ archive: true, lastMessages: [] }, jid);
          count++;
        } catch {}
      }
      await m.react("✅");
      return m.reply(
        `📁 *${count} grup diarsipkan*\n\n> Private chat no se puede diarsipkan sekaligus (no hay lista chat)`,
      );
    } catch (err) {
      global.isFetchingGroups = false;
      return m.reply(`❌ Fallo: ${err.message}`);
    }
  } else {
    if (m.mentionedJid?.length > 0) {
      targetJid = m.mentionedJid[0];
    } else if (m.quoted) {
      targetJid = m.quoted.sender || m.quoted.participant;
    } else if (m.args[0]) {
      const num = m.args[0].replace(/[^0-9]/g, "");
      if (num) targetJid = num + "@s.whatsapp.net";
    } else if (!m.isGroup) {
      targetJid = m.chat;
    }
  }

  if (!targetJid) {
    return m.reply(
      "📁 *ᴀʀsɪᴘ ᴄʜᴀᴛ*\n\n" +
        "> `.arsip 628xxx` — Arsipkan chat\n" +
        "> `.arsip` (di private chat) — Arsipkan chat esto\n" +
        "> `.arsip` (reply mensaje) — Arsipkan chat pengirim\n" +
        "> `.arsip buka 628xxx` — Buka arsip chat\n" +
        "> `.arsip todos` — Arsipkan todos chat",
    );
  }

  try {
    await sock.chatModify({ archive, lastMessages: [] }, targetJid);
    await m.react("✅");
    const target = targetJid.split("@")[0];
    return m.reply(
      archive
        ? `📁 *ᴄʜᴀᴛ ᴅɪᴀʀsɪᴘᴋᴀɴ*\n\n> Target: ${target}\n> Usa \`.arsip buka ${target}\` para abriendo`
        : `📂 *ᴀʀsɪᴘ ᴅɪʙᴜᴋᴀ*\n\n> Target: ${target}`,
    );
  } catch (err) {
    return m.reply(`❌ Fallo: ${err.message}`);
  }
}

export { pluginConfig as config, handler };
