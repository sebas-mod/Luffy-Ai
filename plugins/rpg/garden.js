import { getDatabase } from "../../src/lib/ourin-database.js";
import { addExpWithLevelCheck } from "../../src/lib/ourin-level.js";

const pluginConfig = {
  name: "garden",
  alias: ["kebun", "farm", "tanam"],
  category: "rpg",
  description: "Jardinear y cosechar plantas",
  usage: ".garden <plant/harvest/status>",
  example: ".garden plant carrot",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
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
    let txt = `¡Hola Jardinero Jefe! 👨‍🌾🌻\n`;
    txt += `Centro de información de tu jardín personal.\n\n`;
    
    txt += `*Menú del Jardín:*\n`;
    txt += `• \`${m.prefix}garden status\` - Verificar estado del jardín\n`;
    txt += `• \`${m.prefix}garden buy <planta> <cantidad>\` - Comprar semillas\n`;
    txt += `• \`${m.prefix}garden plant <planta>\` - Plantar semilla en terreno vacío\n`;
    txt += `• \`${m.prefix}garden harvest\` - Cosechar todo lo que esté listo\n\n`;

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
    txt += `*Capacidad del Terreno:* ${garden.plots.length} de ${garden.maxPlots} ocupados.\n\n`;

    if (garden.plots.length === 0) {
      txt += `¡Vaya, tu jardín está completamente árido! 🏜️\n¡Compra semillas rápido y usa \`${m.prefix}garden plant <nombre>\` para que se vuelva verde!`;
    } else {
      txt += `*Lista de Terrenos:*\n`;
      for (let i = 0; i < garden.plots.length; i++) {
        const plot = garden.plots[i];
        const crop = CROPS[plot.crop];
        const elapsed = Date.now() - plot.plantedAt;
        const remaining = Math.max(0, crop.growTime - elapsed);
        const ready = remaining <= 0;

        txt += `\n📍 Plot ${i + 1}: *${crop.name}*\n`;
        txt += `└ Estado: ${ready ? "✨ ¡LISTO PARA COSECHAR! ✨" : `Crecimiento en ⏳ ${formatTime(remaining)}`}\n`;
      }
    }
    return m.reply(txt);
  }

  if (action === "buy") {
    if (!cropName) {
      return m.reply(`Oye, ¿qué semilla quieres comprar? ¡No escribiste el nombre! 😂\nEjemplo: \`${m.prefix}garden buy carrot 5\``);
    }

    const crop = CROPS[cropName];
    if (!crop) {
      return m.reply(`¡Esa semilla no se vende en nuestra tienda agrícola! ❌\n¡Revisa la lista de nuevo con \`${m.prefix}garden\``);
    }

    const qty = Math.max(1, parseInt(args[2]) || 1);
    const totalCost = crop.seedPrice * qty;

    if ((user.koin || 0) < totalCost) {
      return m.reply(`¡Eh, no tienes suficiente dinero! 😭\nEl total es Rp ${totalCost.toLocaleString()}, pero solo tienes Rp ${(user.koin || 0).toLocaleString()}.`);
    }

    user.koin -= totalCost;
    const seedKey = `${cropName}seed`;
    user.inventory[seedKey] = (user.inventory[seedKey] || 0) + qty;
    db.save();

    return m.reply(`¡Gracias por comprar en la Tienda Agrícola! 🛒🌱\n\nCompraste *${qty}x Semilla de ${crop.name}*\nTotal Pagado: *Rp ${totalCost.toLocaleString()}*\n\n¡No olvides plantarla con \`${m.prefix}garden plant ${cropName}\`!`);
  }

  if (action === "plant") {
    if (!cropName) {
      return m.reply(`El terreno está listo, pero ¿qué semilla vas a plantar? 🌱\nEjemplo: \`${m.prefix}garden plant carrot\``);
    }

    const crop = CROPS[cropName];
    if (!crop) {
      return m.reply(`¡Esa planta no existe en el libro de agricultura! ❌`);
    }

    if (user.rpg.garden.plots.length >= user.rpg.garden.maxPlots) {
      return m.reply(`¡Vaya, el terreno está lleno! 🚜💨\n¡Debes cosechar primero o hacer *upgrade* a tu jardín!`);
    }

    const seedKey = `${cropName}seed`;
    if ((user.inventory[seedKey] || 0) < 1) {
      return m.reply(`¡No tienes semillas de *${crop.name}*! 😭\nCompra primero con \`${m.prefix}garden buy ${cropName}\``);
    }

    user.inventory[seedKey]--;
    if (user.inventory[seedKey] <= 0) delete user.inventory[seedKey];

    user.rpg.garden.plots.push({
      crop: cropName,
      plantedAt: Date.now(),
    });
    db.save();

    return m.reply(`¡Listo! La semilla de *${crop.name}* está plantada en el terreno! 🌱💦\n¡No olvides regarla (bueno, es automático), solo espera *${formatTime(crop.growTime)}* para cosechar!`);
  }

  if (action === "harvest") {
    const garden = user.rpg.garden;
    const readyPlots = garden.plots.filter((p) => {
      const crop = CROPS[p.crop];
      return Date.now() - p.plantedAt >= crop.growTime;
    });

    if (readyPlots.length === 0) {
      return m.reply(`Vaya, ¡nada está listo para cosechar! ¡Ten un poco de paciencia! 😂\nConsulta el tiempo con \`${m.prefix}garden status\``);
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
      `¡JUJU! ¡LLEGÓ LA COSECHA! 🚜🌾✨\n\n` +
        `Tu arduo trabajo fue recompensado. Esto es lo que conseguiste:\n` +
        harvestedItems.join("\n") +
        `\n\n` +
        `📈 Bono EXP Agrícola: *+${totalExp}*\n\n` +
        `¡Planta otra vez para hacerte más rico! 💸`
    );
  }
}

export { pluginConfig as config, handler };
