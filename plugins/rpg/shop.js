import { getDatabase } from "../../src/lib/ourin-database.js";

const pluginConfig = {
  name: "shop",
  alias: ["beli", "jual", "toko", "store", "buy", "sell"],
  category: "rpg",
  description: "Comprar y vender objetos RPG",
  usage: ".shop <buy/sell> <item> <cantidad>",
  example: ".shop buy potion 1",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

const ITEMS = {
  potion: { price: 500, type: "buyable", name: "🥤 Health Potion" },
  mpotion: { price: 500, type: "buyable", name: "🧪 Mana Potion" },
  stamina: { price: 1000, type: "buyable", name: "⚡ Stamina Potion" },

  common: { price: 2000, type: "buyable", name: "📦 Common Crate" },
  uncommon: { price: 10000, type: "buyable", name: "🛍️ Uncommon Crate" },
  mythic: { price: 50000, type: "buyable", name: "🎁 Mythic Crate" },
  legendary: { price: 200000, type: "buyable", name: "💎 Legendary Crate" },

  wheat: { price: 50, type: "buyable", name: "🌾 Trigo" },
  rice: { price: 50, type: "buyable", name: "🍚 Arroz" },
  egg: { price: 100, type: "buyable", name: "🥚 Huevos" },
  meat: { price: 300, type: "buyable", name: "🥩 Carne" },
  herb: { price: 150, type: "buyable", name: "🌿 Hierba" },
  carrot: { price: 50, type: "buyable", name: "🥕 Zanahoria" },
  potato: { price: 50, type: "buyable", name: "🥔 Papa" },
  strawberry: { price: 80, type: "buyable", name: "🍓 Fresa" },
  watermelon: { price: 100, type: "buyable", name: "🍉 Sandía" },
  apple: { price: 50, type: "buyable", name: "🍎 Manzana" },

  rock: { price: 20, type: "sellable", name: "🪨 Piedra" },
  coal: { price: 50, type: "sellable", name: "⚫ Carbón" },
  iron: { price: 200, type: "sellable", name: "⛓️ Hierro" },
  gold: { price: 1000, type: "sellable", name: "🥇 Oro" },
  diamond: { price: 5000, type: "sellable", name: "💠 Diamante" },
  emerald: { price: 10000, type: "sellable", name: "💚 Emerald" },

  trash: { price: 10, type: "sellable", name: "🗑️ Basura" },
  fish: { price: 100, type: "sellable", name: "🐟 Pescado" },
  prawn: { price: 200, type: "sellable", name: "🦐 Camarón" },
  octopus: { price: 500, type: "sellable", name: "🐙 Pulpo" },
  shark: { price: 2000, type: "sellable", name: "🦈 Tiburón" },
  whale: { price: 10000, type: "sellable", name: "🐳 Ballena" },
  
  leather: { price: 50, type: "sellable", name: "👞 Cuero" },
  mysterybox: { price: 1500, type: "sellable", name: "📦 Mystery Box" },
  kunai: { price: 100, type: "sellable", name: "🗡️ Kunai" },
  shuriken: { price: 150, type: "sellable", name: "⚔️ Shuriken" },
  chakra: { price: 500, type: "sellable", name: "🌀 Chakra" },
  scroll: { price: 2000, type: "sellable", name: "📜 Scroll Ninja" },
  bowlramen: { price: 800, type: "sellable", name: "🍜 Ramen" },
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);
  const args = m.args || [];

  const action = args[0]?.toLowerCase();

  if (!action || (action !== "buy" && action !== "sell")) {
    let txt = `🏪 *Tienda General RPG* ✨\n\n`;
    txt += `¡Hola! Bienvenido a la tienda.\n¿Quieres comprar pociones o vender chatarra? 😂\n\n`;
    
    txt += `*Cómo Comprar/Vender:* 💸\n`;
    txt += `Escribe \`.shop buy <nombre> <cantidad>\` para comprar.\n`;
    txt += `Escribe \`.shop sell <nombre> <cantidad>\` para vender.\n\n`;

    txt += `*🛍️ En Venta (BUY):*\n`;
    for (const [key, item] of Object.entries(ITEMS)) {
      if (item.type === "buyable") {
        txt += `${item.name}: *Belly ${item.price.toLocaleString("es-ES")}*\n`;
      }
    }
    txt += `\n`;

    txt += `*💰 A Compra (SELL):*\n`;
    for (const [key, item] of Object.entries(ITEMS)) {
      if (item.type === "sellable") {
        txt += `${item.name}: *Belly ${item.price.toLocaleString("es-ES")}*\n`;
      }
    }

    return m.reply(txt);
  }

  const itemKey = args[1]?.toLowerCase();
  const amount = parseInt(args[2]) || 1;

  if (!itemKey || !ITEMS[itemKey]) {
    return m.reply(`¡Ay, el item *${args[1] || "ese"}* no está en la lista! 😭❌\nRevisa la lista con \`.shop\`.`);
  }

  const item = ITEMS[itemKey];

  if (action === "buy") {
    if (item.type !== "buyable") {
      return m.reply(`¡Oye, el item *${item.name}* es solo para vender, ¡no se puede comprar! 🫣❌`);
    }

    const totalCost = item.price * amount;
    if ((user.belly || 0) < totalCost) {
      return m.reply(`¡Vaya, te faltan monedas para comprar *${amount}x ${item.name}*! 😭😭\nTus monedas: *Belly ${(user.belly || 0).toLocaleString("es-ES")}*\nFaltan *Belly ${(totalCost - (user.belly || 0)).toLocaleString("es-ES")}* más. ¡Busca dinero primero! 💸🏃💨`);
    }

    user.belly = (user.belly || 0) - totalCost;
    user.inventory = user.inventory || {};
    user.inventory[itemKey] = (user.inventory[itemKey] || 0) + amount;

    db.save();
    return m.reply(`¡¡MUCHAS GRACIAS! 🎉✨\n\nCompraste:\n🛒 Item: *${amount}x ${item.name}*\n💸 Total Pagado: *Belly ${totalCost.toLocaleString("es-ES")}*\n\n¡Esperamos tu próxima visita! 💖🛍️`);
  }

  if (action === "sell") {
    if (item.type !== "sellable") {
      return m.reply(`Lo siento, ¡nuestra tienda no acepta el item *${item.name}*! No se vende bien 😂❌`);
    }

    const userInventory = user.inventory || {};
    const userStock = userInventory[itemKey] || 0;

    if (userStock < amount) {
      return m.reply(`¡Ey, te faltan items! 🫣\nSolo tienes *${userStock}x ${item.name}*, ¿cómo vas a vender *${amount}*? ¡No mientas! 😂❌`);
    }

    const totalProfit = item.price * amount;

    user.inventory = user.inventory || {};
    user.inventory[itemKey] = userStock - amount;
    user.belly = (user.belly || 0) + totalProfit;

    db.save();
    return m.reply(`¡CLING! ¡DINERO RECIBIDO! 💰✨\n\nVendiste:\n📦 Item: *${amount}x ${item.name}*\n🤑 Total: *Belly ${totalProfit.toLocaleString("es-ES")}*\n\n¡Gracias por limpiar el almacén aquí! 🎉💖`);
  }
}

export { pluginConfig as config, handler };
