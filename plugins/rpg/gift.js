import { getDatabase } from "../../src/lib/ourin-database.js";
const pluginConfig = {
  name: "gift",
  alias: ["kasih", "hadiah"],
  category: "rpg",
  description: "Dar regalos a tu pareja para aumentar el amor",
  usage: ".gift <item> <jumlah>",
  example: ".gift diamond 1",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 30,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};

  if (!user.rpg.spouse) {
    return m.reply(`❌ *ʙᴇʟᴜᴍ ᴇꜱᴛᴀ ᴄᴀꜱᴀᴅᴏ*\n\n` + `> ¡Aún no estás casado!\n` + `> Casate primero con \`.marry @user\``);
  }

  const args = m.args || [];
  const itemKey = args[0]?.toLowerCase();
  const amount = parseInt(args[1]) || 1;

  if (!itemKey) {
    return m.reply(
      `🎁 *ɢɪꜰᴛ*\n\n` +
        `*📋 *ᴜsᴀɢᴇ:*
\n` +
        `> > Elige el objeto para regalar\n` +
        `> > \`.gift diamond 1\`\n` +
        ``,
    );
  }

  user.inventory = user.inventory || {};

  if ((user.inventory[itemKey] || 0) < amount) {
    return m.reply(`❌ *ᴏʙᴊᴇᴛᴏ ɪɴꜰᴜꜰiciente*\n\n` + `> Tu objeto *${itemKey}*: ${user.inventory[itemKey] || 0}\n` + `> Necesitas: ${amount}`);
  }

  const spouseJid = user.rpg.spouse;
  const partner = db.getUser(spouseJid);

  if (!partner) {
    return m.reply(`❌ *ᴘᴀʀᴇᴊᴀ ɴᴏ ᴇɴᴄᴏɴᴛʀᴀᴅᴀ*\n\n> ¡Pareja no encontrada en la base de datos!`);
  }

  partner.inventory = partner.inventory || {};

  user.inventory[itemKey] -= amount;
  partner.inventory[itemKey] = (partner.inventory[itemKey] || 0) + amount;

  user.rpg.love = (user.rpg.love || 0) + amount * 10;
  if (partner.rpg) partner.rpg.love = (partner.rpg.love || 0) + amount * 10;

  db.save();

  let txt = `🎁 *ɢɪꜰᴛ sᴜᴋsᴇs*\n\n`;
  txt += `> 💝 Regalaste ${amount}x ${itemKey}\n`;
  txt += `> 👤 Para: @${spouseJid.split("@")[0]}\n`;
  txt += `> 💕 Amor: +${amount * 10}\n\n`;
  txt += `> _So sweet! 💖_`;

  await m.reply(txt, { mentions: [spouseJid] });
}

export { pluginConfig as config, handler };
