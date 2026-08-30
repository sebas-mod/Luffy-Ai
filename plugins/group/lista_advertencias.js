import { getDatabase } from '../../src/lib/luffy-database.js'
import * as timeHelper from '../../src/lib/luffy-time.js'
const pluginConfig = {
  name: "lista_advertencias",
  alias: ["warnings", "ver_advertencias", "warnlist"],
  category: "group",
  description: "Ver la lista de advertencias de los miembros",
  usage: ".listwarn o .listwarn @user",
  example: ".listwarn @user",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  isAdmin: true,
  cooldown: 5,
  carne: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  let groupData = db.getGroup(m.chat) || {};
  let warnings = groupData.warnings || {};
  const maxWarns = groupData.maxWarnings || 3;

  let targetUser = null;
  if (m.quoted) {
    targetUser = m.quoted.sender;
  } else if (m.mentionedJid && m.mentionedJid.length > 0) {
    targetUser = m.mentionedJid[0];
  }
  if (targetUser) {
    const userWarnings = warnings[targetUser] || [];
    const targetName = targetUser.split("@")[0];

    if (userWarnings.length === 0) {
      await m.reply("☽◯☾ ╭━ ♰ 👑 ADMIN ♰ ━╮ ☽◯☾\n┃ "+`✅ @${targetName} no tiene advertencias.`+"\n╰━ ⊱༺༒༻⊰ ━╯", {
        mentions: [targetUser],
      });
      return;
    }

    let txt = `⚠️ *ᴀᴅᴠᴇʀᴛᴇɴᴄɪᴀs ᴅᴇ @${targetName}*\n\n`;
    txt += `> Total: *${userWarnings.length}/${maxWarns}*\n\n`;

    userWarnings.forEach((w, i) => {
      const date = timeHelper.fromTimestamp(w.time, "DD/MM/YYYY");
      txt += `*${i + 1}.* ${w.reason}\n`;
      txt += `   └ _${date}_\n`;
    });

    await m.reply(txt, { mentions: [targetUser] });
  } else {
    // Show all users with warnings
    const usersWithWarnings = Object.keys(warnings).filter(
      (u) => warnings[u].length > 0,
    );

    if (usersWithWarnings.length === 0) {
      await m.reply("☽◯☾ ╭━ ♰ 👑 ADMIN ♰ ━╮ ☽◯☾\n┃ "+`✅ No hay miembros con advertencias en este grupo.`+"\n╰━ ⊱༺༒༻⊰ ━╯");
      return;
    }

    let txt = `⚠️ *ʟɪsᴛᴀ ᴅᴇ ᴀᴅᴠᴇʀᴛᴇɴᴄɪᴀs*\n\n`;

    usersWithWarnings.forEach((user, i) => {
      const count = warnings[user].length;
      const name = user.split("@")[0];
      txt += `*${i + 1}.* @${name} - *${count}/${maxWarns}* advertencias\n`;
    });

    txt += `\n> Escribe \`${m.prefix}lista_advertencias @user\` para ver los detalles`;

    await m.reply(txt, { mentions: usersWithWarnings });
  }
}

export { pluginConfig as config, handler }