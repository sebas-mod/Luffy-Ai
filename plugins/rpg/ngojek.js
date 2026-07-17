import { getDatabase } from "../../src/lib/ourin-database.js";
import { addExpWithLevelCheck } from "../../src/lib/ourin-level.js";

const pluginConfig = {
  name: "ngojek",
  alias: ["ojek", "gojek", "ojol"],
  category: "rpg",
  description: "Trabajar de motorista para ganar dinero",
  usage: ".ngojek",
  example: ".ngojek",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 120,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};

  const staminaCost = 15;
  user.rpg.stamina = user.rpg.stamina ?? 100;

  if (user.rpg.stamina < staminaCost) {
    return m.reply(`¡El motor está muy caliente, mejor descansa! 🥵🏍️💨\n\nNecesitas *${staminaCost} Stamina* para trabajar, solo tienes *${user.rpg.stamina}*. ¡Toma un café! ☕`);
  }

  user.rpg.stamina -= staminaCost;

  await m.react("🏍️");

  const orders = [
    { type: "🍔 GoFood", distance: "2km", min: 5000, max: 15000 },
    { type: "👤 GoRide", distance: "5km", min: 10000, max: 25000 },
    { type: "📦 GoSend", distance: "3km", min: 8000, max: 20000 },
    { type: "🛒 GoMart", distance: "4km", min: 12000, max: 30000 },
    { type: "👥 GoRide Plus", distance: "10km", min: 20000, max: 50000 },
  ];

  const order = orders[Math.floor(Math.random() * orders.length)];
  const earning = Math.floor(Math.random() * (order.max - order.min + 1)) + order.min;
  const tips = Math.random() > 0.7 ? Math.floor(Math.random() * 5000) + 1000 : 0;
  const totalEarning = earning + tips;

  await m.reply(`¡Encendiendo la moto, acelerando! Buscando pasajeros... 🏍️💨\nHay un pedido de *${order.type}* a *${order.distance}* de distancia, ¡Vamos! 🗺️`);
  await new Promise((r) => setTimeout(r, 3000));

  user.belly = (user.belly || 0) + totalEarning;

  const expGain = Math.floor(totalEarning / 20);
  const levelResult = await addExpWithLevelCheck(sock, m, db, user, expGain);

  db.save();

  await m.react("✅");

  let txt = `¡¡ALABADO SEA DIOS, PEDIDO COMPLETADO! 🏍️✨\n\n`;
  txt += `Resumen del trabajo hoy:\n`;
  txt += `📱 Tipo: *${order.type}*\n`;
  txt += `💵 Tarifa: *+Belly ${earning.toLocaleString("es-ES")}*\n`;
  if (tips > 0) {
    txt += `🎁 Propina del cliente: *+Belly ${tips.toLocaleString("es-ES")}*\n`;
  }
  txt += `📈 EXP: *+${expGain}*\n`;
  txt += `⚡ Stamina: *-${staminaCost}*\n\n`;
  txt += `¡Sirve para comprar algo! ¡Sigue así! 🔥💪`;

  m.reply(txt);
}

export { pluginConfig as config, handler };
