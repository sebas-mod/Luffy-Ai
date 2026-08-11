import { getDatabase } from "../../src/lib/luffy-database.js";
import { addExpWithLevelCheck } from "../../src/lib/luffy-level.js";
import config from "../../config.js";

const pluginConfig = {
  name: "daily",
  alias: ["harian", "claim"],
  category: "rpg",
  description: "Reclama tu recompensa diaria",
  usage: ".daily",
  example: ".daily",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 0,
  carne: 0,
  isEnabled: true,
};

function msToTime(duration) {
  const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((duration / (1000 * 60)) % 60);
  const seconds = Math.floor((duration / 1000) % 60);
  return `${hours} horas ${minutes} minutos ${seconds} segundos`;
}

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);
  const isPremium = config.isPremium?.(m.sender) || false;

  if (!user.rpg) user.rpg = {};

  const COOLDOWN = 86400000;
  const lastClaim = user.rpg.lastDaily || 0;
  const now = Date.now();

  if (now - lastClaim < COOLDOWN) {
    const remaining = COOLDOWN - (now - lastClaim);
    return m.reply(`¡Paciencia bro, ya tomaste tu ración diaria! 😂\n\nEspera *${msToTime(remaining)}* más para tomar la de mañana. ¡No seas avaricioso! 🏃💨`);
  }

  const expReward = isPremium ? 5000 : 1000;
  const moneyReward = isPremium ? 25000 : 5000;
  const carneReward = isPremium ? 10 : 3;

  user.rpg.lastDaily = now;
  user.berry = (user.berry || 0) + moneyReward;
  user.carne = (user.carne || 0) + carneReward;

  const levelResult = await addExpWithLevelCheck(sock, m, db, user, expReward);
  db.save();

  await m.react("🎁");

  let txt = `¡GENIAL! ¡Tu paga diaria ya llegó bro! 🎉✨\n\n`;
  txt += `Esta es tu ración de hoy:\n`;
  txt += `💸 Berry: *+Rp ${moneyReward.toLocaleString("id-ID")}*\n`;
  txt += `📈 EXP: *+${expReward.toLocaleString("id-ID")}*\n`;
  txt += `⚡ Energía: *+${carneReward}*\n\n`;
  
  if (isPremium) {
    txt += `👑 *¡Guau, el bono de miembro Premium sí es diferente! El sultán es libre!* 😎💸`;
  } else {
    txt += `¿Quieres un bono más grande? ¡Haz *Upgrade a Premium* bro! ¡Para volverte más rico! 🤑💎`;
  }

  m.reply(txt);
}

export { pluginConfig as config, handler };
