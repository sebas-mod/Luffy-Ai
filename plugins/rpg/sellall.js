import { getDatabase } from "../../src/lib/ourin-database.js";
const pluginConfig = {
  name: "sellall",
  alias: ["jualsemua", "quicksell"],
  category: "rpg",
  description: "Vender todos los objetos vendibles de golpe",
  usage: ".sellall",
  example: ".sellall",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 30,
  energi: 0,
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
    return m.reply(`❌ *NO HAY OBJETOS*\n\n> No hay objetos para vender!`);
  }

  user.belly = (user.belly || 0) + totalEarned;

  db.save();

  let txt = `💰 ¡¡VENTA EXITOSA!!\n\n`;
  txt += `*📦 Objetos vendidos:*\n`;
  for (const s of soldItems.slice(0, 10)) {
    txt += `> ${s.item}: ${s.qty}x = Belly ${s.earned.toLocaleString("es-ES")}\n`;
  }
  if (soldItems.length > 10) {
    txt += `> ... y ${soldItems.length - 10} objetos más\n`;
  }
  txt += `\n\n`;
  txt += `> 💵 Total: *Belly ${totalEarned.toLocaleString("es-ES")}*`;

  await m.reply(txt);
}

export { pluginConfig as config, handler };
