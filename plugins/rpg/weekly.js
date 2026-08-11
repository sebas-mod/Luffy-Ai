import { getDatabase } from "../../src/lib/luffy-database.js";

const pluginConfig = {
  name: "weekly",
  alias: ["mingguan"],
  category: "rpg",
  description: "Reclama la recompensa semanal (más grande que la diaria)",
  usage: ".weekly",
  example: ".weekly",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 0,
  carne: 0,
  isEnabled: true,
};

const WEEKLY_COOLDOWN = 7 * 24 * 60 * 60 * 1000;

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.cooldowns) user.cooldowns = {};
  const lastWeekly = user.cooldowns.weekly || 0;
  const now = Date.now();

  if (now - lastWeekly < WEEKLY_COOLDOWN) {
    const remaining = lastWeekly + WEEKLY_COOLDOWN - now;
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return m.reply(`Vaya, ¡tu pago semanal ya se agotó bro! 😂\n\nEspera *${days} días ${hours} horas* más para el siguiente sueldo semanal! 🗓️💨`);
  }

  const expReward = Math.floor(Math.random() * 20000) + 10000;
  const moneyReward = Math.floor(Math.random() * 50000) + 30000;
  const crateReward = Math.floor(Math.random() * 3) + 1;

  if (!user.rpg) user.rpg = {};
  db.updateExp(m.sender, expReward);
  user.berry = (user.berry || 0) + moneyReward;

  if (!user.inventory) user.inventory = {};
  user.inventory.uncommon = (user.inventory.uncommon || 0) + crateReward;

  user.cooldowns.weekly = now;
  db.save();

  let txt = `¡DORRR! ¡SUELDO SEMANAL LIQUIDADO! 🎉🎊🤑\n\n`;
  txt += `¡Qué locura, tu reparto de esta semana está enorme:\n`;
  txt += `📈 EXP: *+${expReward.toLocaleString("id-ID")}*\n`;
  txt += `💰 Berry: *+Rp ${moneyReward.toLocaleString("id-ID")}*\n`;
  txt += `🛍️ Cofre Poco Común: *+${crateReward}x*\n\n`;
  txt += `No olvides guardar tu dinero en el banco (\`.bank\`)! 🏦💖`;

  await m.reply(txt);
}

export { pluginConfig as config, handler };
