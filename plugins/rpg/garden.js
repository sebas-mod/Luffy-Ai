import { getDatabase } from "../../src/lib/luffy-database.js";
import { addExpWithLevelCheck } from "../../src/lib/luffy-level.js";

const pluginConfig = {
  name: "garden",
  alias: ["kebun", "farm", "tanam"],
  category: "rpg",
  description: "Cultivar y cosechar plantas",
  usage: ".garden <plant/harvest/status>",
  example: ".garden plant carrot",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  carne: 0,
  isEnabled: true,
};

const CROPS = {
  carrot: { name: "🥕 Zanahoria", growTime: 300000, exp: 50, sellPrice: 30, seedPrice: 10 },
  tomato: { name: "🍅 Tomate", growTime: 600000, exp: 80, sellPrice: 50, seedPrice: 20 },
  corn: { name: "🌽 Maíz", growTime: 900000, exp: 120, sellPrice: 80, seedPrice: 35 },
  potato: { name: "🥔 Papa", growTime: 1200000, exp: 150, sellPrice: 100, seedPrice: 45 },
  strawberry: { name: "🍓 Fresa", growTime: 1800000, exp: 200, sellPrice: 150, seedPrice: 60 },
  watermelon: { name: "🍉 Sandía", growTime: 3600000, exp: 350, sellPrice: 300, seedPrice: 100 },
  pumpkin: { name: "🎃 Calabaza", growTime: 7200000, exp: 500, sellPrice: 500, seedPrice: 150 },
  herb: { name: "🌿 Hierba", growTime: 1500000, exp: 180, sellPrice: 120, seedPrice: 50 },
};

function formatTime(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};
  if (!user.inventory) user.inventory = {};
  if (!user.rpg.garden) user.rpg.garden = { plots: [], maxPlots: 3 };

  const args = m.args || [];
  const action = args[0]?.toLowerCase();
  const cropName = args[1]?.toLowerCase();

  if (!action || !["plant", "harvest", "status", "buy"].includes(action)) {
    let txt = `¡Hola Jefe del Huerto! 👨‍🌾🌻\n`;
    txt += `Este es el centro de información de tu huerto privado.\n\n`;
    
    txt += `*Menú del Huerto:*\n`;
    txt += `• \`${m.prefix}garden status\` - Ver el estado del huerto\n`;
    txt += `• \`${m.prefix}garden buy <planta> <cantidad>\` - Comprar semillas\n`;
    txt += `• \`${m.prefix}garden plant <planta>\` - Plantar semilla en tierra vacía\n`;
    txt += `• \`${m.prefix}garden harvest\` - Cosechar todo lo que esté maduro\n\n`;

    txt += `*Lista de Semillas Disponibles:*\n`;
    for (const [key, crop] of Object.entries(CROPS)) {
      txt += `\n*${crop.name}*\n`;
      txt += `⏳ Tiempo de Crecimiento: ${formatTime(crop.growTime)}\n`;
      txt += `💰 Precio de Venta: Rp ${crop.sellPrice} | 🌱 Precio de Semilla: Rp ${crop.seedPrice}\n`;
      txt += `👉 Comprar: \`.garden buy ${key}\`\n`;
    }
    return m.reply(txt);
  }

  if (action === "status") {
    const garden = user.rpg.garden;
    let txt = `Revisando el terreno del huerto... 🚜🌱\n\n`;
    txt += `*Capacidad de Tierra:* ${garden.plots.length} de ${garden.maxPlots} ocupadas.\n\n`;

    if (garden.plots.length === 0) {
      txt += `¡Uy, tu huerto aún está árido bro! 🏜️\n¡Apúrate a comprar semillas y luego \`${m.prefix}garden plant <nombre>\` para que vuelva a estar verde!`;
    } else {
      txt += `*Lista de Terrenos:*\n`;
      for (let i = 0; i < garden.plots.length; i++) {
        const plot = garden.plots[i];
        const crop = CROPS[plot.crop];
        const elapsed = Date.now() - plot.plantedAt;
        const remaining = Math.max(0, crop.growTime - elapsed);
        const ready = remaining <= 0;

        txt += `\n📍 Parcela ${i + 1}: *${crop.name}*\n`;
        txt += `└ Estado: ${ready ? "✨ ¡LISTA PARA COSECHAR! ✨" : `Creciendo en ⏳ ${formatTime(remaining)}`}\n`;
      }
    }
    return m.reply(txt);
  }

  if (action === "buy") {
    if (!cropName) {
      return m.reply(`¡Oye, ¿qué semilla quieres comprar? ¡Aún no escribiste el nombre bro! 😂\nEjemplo: \`${m.prefix}garden buy carrot 5\``);
    }

    const crop = CROPS[cropName];
    if (!crop) {
      return m.reply(`¡Esa semilla no se vende en nuestra tienda de campo bro! ❌\nRevisa la lista de nuevo con \`${m.prefix}garden\``);
    }

    const qty = Math.max(1, parseInt(args[2]) || 1);
    const totalCost = crop.seedPrice * qty;

    if ((user.berry || 0) < totalCost) {
      return m.reply(`¡Ey, te falta dinero bro! 😭\nEl total de la compra es Rp ${totalCost.toLocaleString()}, pero tus berry restantes son Rp ${(user.berry || 0).toLocaleString()}.`);
    }

    user.berry -= totalCost;
    const seedKey = `${cropName}seed`;
    user.inventory[seedKey] = (user.inventory[seedKey] || 0) + qty;
    db.save();

    return m.reply(`¡Gracias por comprar en la Tienda de Campo! 🛒🌱\n\nCompraste *${qty}x Semillas de ${crop.name}*\nTotal Pagado: *Rp ${totalCost.toLocaleString()}*\n\n¡No olvides plantarlas con \`${m.prefix}garden plant ${cropName}\`!`);
  }

  if (action === "plant") {
    if (!cropName) {
      return m.reply(`¡La tierra está lista, pero qué semilla quieres plantar? 🌱\nEjemplo: \`${m.prefix}garden plant carrot\``);
    }

    const crop = CROPS[cropName];
    if (!crop) {
      return m.reply(`¡Esa planta no está en el manual de campo bro! ❌`);
    }

    if (user.rpg.garden.plots.length >= user.rpg.garden.maxPlots) {
      return m.reply(`¡Uy, el terreno ya está completamente lleno! 🚜💨\n¡Debes cosechar primero o *mejorar* tu huerto!`);
    }

    const seedKey = `${cropName}seed`;
    if ((user.inventory[seedKey] || 0) < 1) {
      return m.reply(`¡No tienes semillas de *${crop.name}* bro! 😭\n¡Cómpralas primero en \`${m.prefix}garden buy ${cropName}\``);
    }

    user.inventory[seedKey]--;
    if (user.inventory[seedKey] <= 0) delete user.inventory[seedKey];

    user.rpg.garden.plots.push({
      crop: cropName,
      plantedAt: Date.now(),
    });
    db.save();

    return m.reply(`¡Listo! La semilla de *${crop.name}* ya fue plantada en la tierra! 🌱💦\nNo olvides regarla (bueno, es automático), solo espera *${formatTime(crop.growTime)}* para cosechar!`);
  }

  if (action === "harvest") {
    const garden = user.rpg.garden;
    const readyPlots = garden.plots.filter((p) => {
      const crop = CROPS[p.crop];
      return Date.now() - p.plantedAt >= crop.growTime;
    });

    if (readyPlots.length === 0) {
      return m.reply(`¡Vaya, aún no hay nada maduro bro! Ten un poco de paciencia 😂\nRevisa el tiempo con \`${m.prefix}garden status\``);
    }

    let totalExp = 0;
    let harvestedItems = [];

    for (const plot of readyPlots) {
      const crop = CROPS[plot.crop];
      const qty = Math.floor(Math.random() * 3) + 2;
      user.inventory[plot.crop] = (user.inventory[plot.crop] || 0) + qty;
      totalExp += crop.exp;
      harvestedItems.push(`• ${crop.name} x${qty}`);
    }

    garden.plots = garden.plots.filter((p) => {
      const crop = CROPS[p.crop];
      return Date.now() - p.plantedAt < crop.growTime;
    });

    await addExpWithLevelCheck(sock, m, db, user, totalExp);
    db.save();

    await m.react("✅");
    return m.reply(
      `¡HURRA! ¡LLEGÓ LA COSECHA! 🚜🌾✨\n\n` +
        `Tu esfuerzo dio frutos. Esto es lo que obtuviste:\n` +
        harvestedItems.join("\n") +
        `\n\n` +
        `📈 Bonus EXP de Campo: *+${totalExp}*\n\n` +
        `¡Apúrate a plantar de nuevo para volverte más rico! 💸`
    );
  }
}

export { pluginConfig as config, handler };
