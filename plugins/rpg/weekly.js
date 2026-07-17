import { getDatabase } from "../../src/lib/ourin-database.js";

const pluginConfig = {
  name: "weekly",
  alias: ["mingguan"],
  category: "rpg",
  description: "Reclamar recompensa semanal (mayor que la diaria)",
  usage: ".weekly",
  example: ".weekly",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 0,
  energi: 0,
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
    return m.reply(`¡Vaya, tu recompensa semanal ya se agotó! 😂\n\nEspera *${days} días ${hours} horas* más para tu próximo sueldo semanal! 🗓️💨`);
  }

  const expReward = Math.floor(Math.random() * 20000) + 10000;
  const moneyReward = Math.floor(Math.random() * 50000) + 30000;
  const crateReward = Math.floor(Math.random() * 3) + 1;

  if (!user.rpg) user.rpg = {};
  db.updateExp(m.sender, expReward);
  user.belly = (user.belly || 0) + moneyReward;

  if (!user.inventory) user.inventory = {};
  user.inventory.uncommon = (user.inventory.uncommon || 0) + crateReward;

  user.cooldowns.weekly = now;
  db.save();

  let txt = `¡¡PAM! ¡¡SUELDO SEMANAL CAÍDO!! 🎉🎊🤑\n\n`;
  txt += `¡Genial, tu ración esta semana es enorme:\n`;
  txt += `📈 EXP: *+${expReward.toLocaleString("es-ES")}*\n`;
  txt += `💰 Belly: *+Belly ${moneyReward.toLocaleString("es-ES")}*\n`;
  txt += `🛍️ Caja Uncommon: *+${crateReward}x*\n\n`;
  txt += `¡No olvides guardar el dinero en el banco (\`.bank\`)! 🏦💖`;

  await m.reply(txt);
}

export { pluginConfig as config, handler };
