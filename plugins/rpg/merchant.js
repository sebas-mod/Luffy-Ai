import { getDatabase } from "../../src/lib/ourin-database.js";
const pluginConfig = {
  name: "merchant",
  alias: ["npc", "toko", "tokoku"],
  category: "rpg",
  description: "Comprar y vender objetos al NPC mercader",
  usage: ".merchant <buy/sell> <item> <qty>",
  example: ".merchant buy potion 5",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

const SHOP_ITEMS = {
  potion: { name: "🧪 Poción", buyPrice: 100, sellPrice: 50, desc: "Restaura 50 HP" },
  manapotion: { name: "💙 Poción de Maná", buyPrice: 150, sellPrice: 75, desc: "Restaura 50 Maná" },
  antidote: { name: "💊 Antídoto", buyPrice: 80, sellPrice: 40, desc: "Cura el veneno" },
  bread: { name: "🍞 Pan", buyPrice: 30, sellPrice: 15, desc: "Restaura 10 de estamina" },
  energydrink: { name: "⚡ Bebida Energética", buyPrice: 200, sellPrice: 100, desc: "Restaura 50 de estamina" },
  pickaxe: { name: "⛏️ Pico", buyPrice: 500, sellPrice: 250, desc: "Para minar" },
  fishingrod: { name: "🎣 Caña de Pescar", buyPrice: 400, sellPrice: 200, desc: "Para pescar" },
  wood: { name: "🪵 Madera", buyPrice: 50, sellPrice: 25, desc: "Material básico" },
  iron: { name: "🔩 Hierro", buyPrice: 80, sellPrice: 40, desc: "Material metálico" },
  leather: { name: "🧶 Cuero", buyPrice: 60, sellPrice: 30, desc: "Material de armadura" },
  string: { name: "🧵 Hilo", buyPrice: 40, sellPrice: 20, desc: "Material de arco" },
  herb: { name: "🌿 Hierba", buyPrice: 70, sellPrice: 35, desc: "Ingrediente de alquimia" },
  gold: { name: "🪙 Oro", buyPrice: 500, sellPrice: 250, desc: "Material raro" },
  diamond: { name: "💎 Diamante", buyPrice: 2000, sellPrice: 1000, desc: "Material de lujo" },
};

function handler(m) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.inventory) user.inventory = {};

  const args = m.args || [];
  const action = args[0]?.toLowerCase();
  const itemKey = args[1]?.toLowerCase();
  const qty = Math.max(1, parseInt(args[2]) || 1);

  if (!action || !["buy", "sell", "list"].includes(action)) {
    let txt = `🏪 *TIENDA DEL COMERCIANTE*\n\n`;
    txt += `> ¡Bienvenido a la tienda!\n\n`;
    txt += `*📋 *COMANDO:*
\n`;
    txt += `> ${m.prefix}merchant list\n`;
    txt += `> ${m.prefix}merchant buy <item> <qty>\n`;
    txt += `> ${m.prefix}merchant sell <item> <qty>\n`;
    txt += `\n\n`;
    txt += `💰 *Balance:* ${(user.belly || 0).toLocaleString()}`;
    return m.reply(txt);
  }

  if (action === "list") {
    let txt = `🏪 *LISTA DE ARTÍCULOS*\n\n`;
    txt += `*📦 *TIENDA:*
\n`;

    for (const [key, item] of Object.entries(SHOP_ITEMS)) {
      txt += `> ${item.name}\n`;
      txt += `> 💵 Comprar: ${item.buyPrice.toLocaleString()}\n`;
      txt += `> 💰 Vender: ${item.sellPrice.toLocaleString()}\n`;
      txt += `> 📝 ${item.desc}\n`;
      txt += `> → \`${key}\`\n`;
      txt += `> \n`;
    }
    txt += ``;

    return m.reply(txt);
  }

  if (action === "buy") {
    if (!itemKey) {
      return m.reply(`❌ ¡Especifica el objeto!\n\n> Ejemplo: \`${m.prefix}merchant buy potion 5\``);
    }

    const item = SHOP_ITEMS[itemKey];
    if (!item) {
      return m.reply(`❌ ¡Objeto no encontrado!\n\n> Escribe \`${m.prefix}merchant list\` para ver la lista.`);
    }

    const totalCost = item.buyPrice * qty;
    if ((user.belly || 0) < totalCost) {
      return m.reply(`❌ *SALDO INSUFICIENTE*\n\n` + `> Precio: ${totalCost.toLocaleString()}\n` + `> Balance: ${(user.belly || 0).toLocaleString()}`);
    }

    user.belly -= totalCost;
    user.inventory[itemKey] = (user.inventory[itemKey] || 0) + qty;
    db.save();

    return m.reply(
      `✅ *COMPRA EXITOSA*\n\n` +
        `*🛒 *DETALLE:*
\n` +
        `> 📦 Item: *${item.name}*\n` +
        `> 📊 Qty: *${qty}*\n` +
        `> 💵 Total: *-${totalCost.toLocaleString()}*\n` +
        `> 💰 Restante: *${user.belly.toLocaleString()}*\n` +
        ``,
    );
  }

  if (action === "sell") {
    if (!itemKey) {
      return m.reply(`❌ ¡Especifica el objeto!\n\n> Ejemplo: \`${m.prefix}merchant sell iron 10\``);
    }

    const item = SHOP_ITEMS[itemKey];
    if (!item) {
      return m.reply(`❌ ¡Este objeto no se puede vender al mercader!`);
    }

    const have = user.inventory[itemKey] || 0;
    if (have < qty) {
      return m.reply(`❌ *ARTÍCULO INSUFICIENTE*\n\n` + `> Tienes: ${have}\n` + `> Quieres vender: ${qty}`);
    }

    const totalEarn = item.sellPrice * qty;
    user.belly = (user.belly || 0) + totalEarn;
    user.inventory[itemKey] -= qty;
    if (user.inventory[itemKey] <= 0) delete user.inventory[itemKey];
    db.save();

    return m.reply(
      `✅ *VENTA EXITOSA*\n\n` +
        `*💰 *DETALLE:*
\n` +
        `> 📦 Item: *${item.name}*\n` +
        `> 📊 Qty: *${qty}*\n` +
        `> 💵 Total: *+${totalEarn.toLocaleString()}*\n` +
        `> 💰 Balance: *${user.belly.toLocaleString()}*\n` +
        ``,
    );
  }
}

export { pluginConfig as config, handler };
