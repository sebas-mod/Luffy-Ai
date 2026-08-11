import { getDatabase } from "../../src/lib/luffy-database.js";
const pluginConfig = {
  name: "sellall",
  alias: ["jualsemua", "quicksell"],
  category: "rpg",
  description: "Vender todos los ítems que se puedan vender a la vez",
  usage: ".sellall",
  example: ".sellall",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 30,
  carne: 0,
  isEnabled: true,
};

const SELL_PRICES = {
  rock: 20,
  coal: 50,
  iron: 200,
  gold: 1000,
  diamond: 5000,
  emerald: 10000,
  trash: 10,
  fish: 100,
  prawn: 200,
  octopus: 500,
  shark: 2000,
  whale: 10000,
  wood: 30,
  stick: 15,
  apple: 50,
  rubber: 100,
  rabbit: 150,
  deer: 300,
  boar: 500,
  bear: 1000,
  lion: 2000,
  dragon: 10000,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.inventory) user.inventory = {};

  let totalEarned = 0;
  let soldItems = [];

  for (const [item, price] of Object.entries(SELL_PRICES)) {
    const qty = user.inventory[item] || 0;
    if (qty > 0) {
      const earned = qty * price;
      totalEarned += earned;
      soldItems.push({ item, qty, earned });
      user.inventory[item] = 0;
    }
  }

  if (soldItems.length === 0) {
    return m.reply(`❌ *ꜱɪɴ ɪᴛᴇᴍꜱ*\n\n> ¡No hay ítems que se puedan vender!`);
  }

  user.berry = (user.berry || 0) + totalEarned;

  db.save();

  let txt = `💰 *ᴠᴇɴᴛᴀ ᴛᴏᴅᴏ ᴇxɪᴛᴏꜱᴀ*\n\n`;
  txt += `*📦 *ɪᴛᴇᴍꜱ ᴠᴇɴᴅɪᴅᴏꜱ:*
\n`;
  for (const s of soldItems.slice(0, 10)) {
    txt += `> ${s.item}: ${s.qty}x = Rp ${s.earned.toLocaleString("id-ID")}\n`;
  }
  if (soldItems.length > 10) {
    txt += `> ... y otros ${soldItems.length - 10} ítems\n`;
  }
  txt += `\n\n`;
  txt += `> 💵 Total: *Rp ${totalEarned.toLocaleString("id-ID")}*`;

  await m.reply(txt);
}

export { pluginConfig as config, handler };
