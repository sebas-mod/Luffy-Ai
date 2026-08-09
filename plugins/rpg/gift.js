import { getDatabase } from "../../src/lib/luffy-database.js";
const pluginConfig = {
  name: "gift",
  alias: ["kasih", "hadiah"],
  category: "rpg",
  description: "Beri hadiah ke pasangan untuk meningkatkan love",
  usage: ".gift <item> <jumlah>",
  example: ".gift diamond 1",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 30,
  carne: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};

  if (!user.rpg.spouse) {
    return m.reply(`❌ *ɴᴏ ᴄᴀꜱᴀᴅᴏ*\n\n` + `> ¡Aún no estás casado!\n` + `> Cásate primero con \`.marry @user\``);
  }

  const args = m.args || [];
  const itemKey = args[0]?.toLowerCase();
  const amount = parseInt(args[1]) || 1;

  if (!itemKey) {
    return m.reply(
      `🎁 *ɢɪꜰᴛ*\n\n` +
        `*📋 *ᴜsᴏ:*
\n` +
        `> > Elige el ítem para regalar\n` +
        `> > \`.gift diamond 1\`\n` +
        ``,
    );
  }

  user.inventory = user.inventory || {};

  if ((user.inventory[itemKey] || 0) < amount) {
    return m.reply(`❌ *ɪᴛᴇᴍ ɪɴꜱᴜꜰɪᴄɪᴇɴᴛᴇ*\n\n` + `> Tu ítem *${itemKey}*: ${user.inventory[itemKey] || 0}\n` + `> Se necesita: ${amount}`);
  }

  const spouseJid = user.rpg.spouse;
  const partner = db.getUser(spouseJid);

  if (!partner) {
    return m.reply(`❌ *ᴘᴀʀᴇᴊᴀ ɴᴏ ᴇɴᴄᴏɴᴛʀᴀᴅᴀ*\n\n> ¡La pareja no fue encontrada en la base de datos!`);
  }

  partner.inventory = partner.inventory || {};

  user.inventory[itemKey] -= amount;
  partner.inventory[itemKey] = (partner.inventory[itemKey] || 0) + amount;

  user.rpg.love = (user.rpg.love || 0) + amount * 10;
  if (partner.rpg) partner.rpg.love = (partner.rpg.love || 0) + amount * 10;

  db.save();

  let txt = `🎁 *ʀᴇɢᴀʟᴏ ᴇxɪᴛᴏꜱᴏ*\n\n`;
  txt += `> 💝 Regalaste ${amount}x ${itemKey}\n`;
  txt += `> 👤 Para: @${spouseJid.split("@")[0]}\n`;
  txt += `> 💕 Amor: +${amount * 10}\n\n`;
  txt += `> _¡Tan dulce! 💖_`;

  await m.reply(txt, { mentions: [spouseJid] });
}

export { pluginConfig as config, handler };
