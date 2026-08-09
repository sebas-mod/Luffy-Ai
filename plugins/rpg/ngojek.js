import { getDatabase } from "../../src/lib/luffy-database.js";
import { addExpWithLevelCheck } from "../../src/lib/luffy-level.js";

const pluginConfig = {
  name: "ngojek",
  alias: ["ojek", "gojek", "ojol"],
  category: "rpg",
  description: "Ngojek untuk mendapat uang",
  usage: ".ngojek",
  example: ".ngojek",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 120,
  carne: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};

  const staminaCost = 15;
  user.rpg.stamina = user.rpg.stamina ?? 100;

  if (user.rpg.stamina < staminaCost) {
    return m.reply(`¡El motor de tu moto ya está muy caliente bro, mejor descansa! 🥵🏍️💨\n\nSer mototaxista necesita *${staminaCost} de Resistencia*, solo te quedan *${user.rpg.stamina}*. ¡Tómate un café! ☕`);
  }

  user.rpg.stamina -= staminaCost;

  await m.react("🏍️");

  const orders = [
    { type: "🍔 Entrega de Comida", distance: "2km", min: 5000, max: 15000 },
    { type: "👤 Viaje en Moto", distance: "5km", min: 10000, max: 25000 },
    { type: "📦 Envío de Paquete", distance: "3km", min: 8000, max: 20000 },
    { type: "🛒 Compra en Supermercado", distance: "4km", min: 12000, max: 30000 },
    { type: "👥 Viaje en Moto Plus", distance: "10km", min: 20000, max: 50000 },
  ];

  const order = orders[Math.floor(Math.random() * orders.length)];
  const earning = Math.floor(Math.random() * (order.max - order.min + 1)) + order.min;
  const tips = Math.random() > 0.7 ? Math.floor(Math.random() * 5000) + 1000 : 0;
  const totalEarning = earning + tips;

  await m.reply(`Encendiendo la moto, ¡a todo gas! Buscando pasajeros... 🏍️💨\nHay un pedido de *${order.type}* a *${order.distance}*, ¡Vámonos! 🗺️`);
  await new Promise((r) => setTimeout(r, 3000));

  user.berry = (user.berry || 0) + totalEarning;

  const expGain = Math.floor(totalEarning / 20);
  const levelResult = await addExpWithLevelCheck(sock, m, db, user, expGain);

  db.save();

  await m.react("✅");

  let txt = `¡PEDIDO TERMINADO! 🏍️✨\n\n`;
  txt += `Detalles de las carreras de hoy:\n`;
  txt += `📱 Tipo: *${order.type}*\n`;
  txt += `💵 Tarifa: *+Rp ${earning.toLocaleString("id-ID")}*\n`;
  if (tips > 0) {
    txt += `🎁 Propina del Cliente: *+Rp ${tips.toLocaleString("id-ID")}*\n`;
  }
  txt += `📈 EXP: *+${expGain}*\n`;
  txt += `⚡ Resistencia: *-${staminaCost}*\n\n`;
  txt += `¡Nada mal para aumentar la mesada bro! ¡Sigue trabajando duro! 🔥💪`;

  m.reply(txt);
}

export { pluginConfig as config, handler };
