import { getDatabase } from "../../src/lib/luffy-database.js";

const pluginConfig = {
  name: "shop",
  alias: ["beli", "jual", "toko", "store", "buy", "sell"],
  category: "rpg",
  description: "Beli dan jual item RPG",
  usage: ".shop <buy/sell> <item> <jumlah>",
  example: ".shop buy potion 1",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  carne: 0,
  isEnabled: true,
};

const ITEMS = {
  potion: { price: 500, type: "buyable", name: "🥤 Poción de Salud" },
  mpotion: { price: 500, type: "buyable", name: "🧪 Poción de Maná" },
  stamina: { price: 1000, type: "buyable", name: "⚡ Poción de Resistencia" },

  common: { price: 2000, type: "buyable", name: "📦 Cofre Común" },
  uncommon: { price: 10000, type: "buyable", name: "🛍️ Cofre Poco Común" },
  mythic: { price: 50000, type: "buyable", name: "🎁 Cofre Mítico" },
  legendary: { price: 200000, type: "buyable", name: "💎 Cofre Legendario" },

  wheat: { price: 50, type: "buyable", name: "🌾 Trigo" },
  rice: { price: 50, type: "buyable", name: "🍚 Arroz" },
  egg: { price: 100, type: "buyable", name: "🥚 Huevo" },
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
  emerald: { price: 10000, type: "sellable", name: "💚 Esmeralda" },

  trash: { price: 10, type: "sellable", name: "🗑️ Basura" },
  fish: { price: 100, type: "sellable", name: "🐟 Pescado" },
  prawn: { price: 200, type: "sellable", name: "🦐 Camarón" },
  octopus: { price: 500, type: "sellable", name: "🐙 Pulpo" },
  shark: { price: 2000, type: "sellable", name: "🦈 Tiburón" },
  whale: { price: 10000, type: "sellable", name: "🐳 Ballena" },
  
  leather: { price: 50, type: "sellable", name: "👞 Cuero" },
  mysterybox: { price: 1500, type: "sellable", name: "📦 Caja Misteriosa" },
  kunai: { price: 100, type: "sellable", name: "🗡️ Kunai" },
  shuriken: { price: 150, type: "sellable", name: "⚔️ Shuriken" },
  chakra: { price: 500, type: "sellable", name: "🌀 Chakra" },
  scroll: { price: 2000, type: "sellable", name: "📜 Pergamino Ninja" },
  bowlramen: { price: 800, type: "sellable", name: "🍜 Ramen" },
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);
  const args = m.args || [];

  const action = args[0]?.toLowerCase();

  if (!action || (action !== "buy" && action !== "sell")) {
    let txt = `🏪 *Tienda de Abarrotes RPG* ✨\n\n`;
    txt += `¡Hola bro! Bienvenido a la tienda.\n¿Quieres comprar pociones o vender chatarra? 😂\n\n`;
    
    txt += `*Cómo Transaccionar:* 💸\n`;
    txt += `Escribe \`.shop buy <nombre> <cantidad>\` para comprar.\n`;
    txt += `Escribe \`.shop sell <nombre> <cantidad>\` para vender.\n\n`;

    txt += `*🛍️ Artículos a la Venta (BUY):*\n`;
    for (const [key, item] of Object.entries(ITEMS)) {
      if (item.type === "buyable") {
        txt += `${item.name}: *Rp ${item.price.toLocaleString("id-ID")}*\n`;
      }
    }
    txt += `\n`;

    txt += `*💰 Artículos que se Reciben (SELL):*\n`;
    for (const [key, item] of Object.entries(ITEMS)) {
      if (item.type === "sellable") {
        txt += `${item.name}: *Rp ${item.price.toLocaleString("id-ID")}*\n`;
      }
    }

    return m.reply(txt);
  }

  const itemKey = args[1]?.toLowerCase();
  const amount = parseInt(args[2]) || 1;

  if (!itemKey || !ITEMS[itemKey]) {
    return m.reply(`¡Uy bro, el artículo *${args[1] || "ese"}* no está en la lista! 😭❌\nRevisa de nuevo la lista escribiendo \`.shop\` por favor.`);
  }

  const item = ITEMS[itemKey];

  if (action === "buy") {
    if (item.type !== "buyable") {
      return m.reply(`¡Ojo bro, el artículo *${item.name}* es solo para vender, no se puede comprar! 🫣❌`);
    }

    const totalCost = item.price * amount;
    if ((user.berry || 0) < totalCost) {
      return m.reply(`¡Vaya, te faltan berry para comprar *${amount}x ${item.name}* bro! 😭😭\nTus berry: *Rp ${(user.berry || 0).toLocaleString("id-ID")}*\nTe faltan *Rp ${(totalCost - (user.berry || 0)).toLocaleString("id-ID")}* más. ¡Ve a buscar dinero primero! 💸🏃💨`);
    }

    user.berry = (user.berry || 0) - totalCost;
    user.inventory = user.inventory || {};
    user.inventory[itemKey] = (user.inventory[itemKey] || 0) + amount;

    db.save();
    return m.reply(`¡MUCHAS GRACIAS BRO! 🎉✨\n\nLograste comprar:\n🛒 Artículo: *${amount}x ${item.name}*\n💸 Total Pagado: *Rp ${totalCost.toLocaleString("id-ID")}*\n\n¡Te esperamos de nuevo! 💖🛍️`);
  }

  if (action === "sell") {
    if (item.type !== "sellable") {
      return m.reply(`Perdón bro, nuestra tienda no acepta el artículo *${item.name}*! Ya no se vende por eso 😂❌`);
    }

    const userInventory = user.inventory || {};
    const userStock = userInventory[itemKey] || 0;

    if (userStock < amount) {
      return m.reply(`¡Oye bro, faltan artículos! 🫣\nSolo tienes *${userStock}x ${item.name}* y quieres vender *${amount}*? ¡No mientas! 😂❌`);
    }

    const totalProfit = item.price * amount;

    user.inventory = user.inventory || {};
    user.inventory[itemKey] = userStock - amount;
    user.berry = (user.berry || 0) + totalProfit;

    db.save();
    return m.reply(`¡DING! ¡DINERO ENTRANTE! 💰✨\n\nLograste vender:\n📦 Artículo: *${amount}x ${item.name}*\n🤑 Total Obtenido: *Rp ${totalProfit.toLocaleString("id-ID")}*\n\n¡Gracias por liquidar el almacén aquí! 🎉💖`);
  }
}

export { pluginConfig as config, handler };
