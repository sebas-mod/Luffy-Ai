import { getDatabase } from "../../src/lib/luffy-database.js";
import { addExpWithLevelCheck } from "../../src/lib/luffy-level.js";

const pluginConfig = {
  name: "mulung",
  alias: ["scavenge", "kumpulsampah"],
  category: "rpg",
  description: "Memulung untuk mengumpulkan barang",
  usage: ".mulung",
  example: ".mulung",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 300,
  carne: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};
  if (!user.inventory) user.inventory = {};

  const staminaCost = 15;
  user.rpg.stamina = user.rpg.stamina ?? 100;

  if (user.rpg.stamina < staminaCost) {
    return m.reply(`Vaya bro, ¡hasta para recolectar basura necesitas energía! 🥵🗑️\n\nSolo te quedan *${user.rpg.stamina}*, pero necesitas *${staminaCost}*. ¡Descansa! 🛌💤`);
  }

  user.rpg.stamina -= staminaCost;

  await m.react("🗑️");
  await m.reply(`Rebuscando en la basura con mucha esperanza... 🗑️👀\n¡Ojalá hoy encuentres algo bueno! ✨`);
  await new Promise((r) => setTimeout(r, 3000));

  const drops = [
    { item: "botol", name: "🍶 Botella", min: 1, max: 10 },
    { item: "kaleng", name: "🥫 Lata", min: 1, max: 8 },
    { item: "kardus", name: "📦 Cartón", min: 1, max: 5 },
    { item: "sampah", name: "🗑️ Basura", min: 1, max: 15 },
    { item: "koran", name: "📰 Periódico", min: 0, max: 3 },
  ];

  let results = [];
  let moneyEarned = 0;

  for (const drop of drops) {
    const qty = Math.floor(Math.random() * (drop.max - drop.min + 1)) + drop.min;
    if (qty > 0) {
      user.inventory[drop.item] = (user.inventory[drop.item] || 0) + qty;
      results.push({ name: drop.name, qty });
      moneyEarned += qty * Math.floor(Math.random() * 50 + 10);
    }
  }

  user.berry = (user.berry || 0) + moneyEarned;

  const expGain = Math.floor(Math.random() * 200) + 50;
  const levelResult = await addExpWithLevelCheck(sock, m, db, user, expGain);

  db.save();

  await m.react("✅");

  let txt = `¡GENIAL, ENCONTRASTE CHATARRA! 🗑️💸\n\n`;
  txt += `Lograste juntar estos objetos bro:\n`;
  for (const r of results) {
    txt += `• ${r.name}: *+${r.qty}*\n`;
  }
  txt += `\n¡La chatarra se vende directo al reciclador!\n`;
  txt += `💵 Ganancia de la Venta: *+Rp ${moneyEarned.toLocaleString("id-ID")}*\n`;
  txt += `📈 EXP: *+${expGain}*\n`;
  txt += `⚡ Resistencia usada: *-${staminaCost}*\n\n`;
  txt += `¡Sigue recolectando hasta volverte rico! 🔥🚀`;

  m.reply(txt);
}

export { pluginConfig as config, handler };
