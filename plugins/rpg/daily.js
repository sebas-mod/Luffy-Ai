import { getDatabase } from "../../src/lib/ourin-database.js";
import { addExpWithLevelCheck } from "../../src/lib/ourin-level.js";
import config from "../../config.js";

const pluginConfig = {
  name: "daily",
  alias: ["harian", "claim"],
  category: "rpg",
  description: "Reclamar recompensa diaria",
  usage: ".daily",
  example: ".daily",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 0,
  energi: 0,
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
    return m.reply(`¡Ten paciencia, tu recompensa diaria ya fue reclamada! 😂\n\nEspera *${msToTime(remaining)}* más para reclamar la de mañana. ¡No seas codicioso! 🏃💨`);
  }

  const expReward = isPremium ? 5000 : 1000;
  const moneyReward = isPremium ? 25000 : 5000;
  const energiReward = isPremium ? 10 : 3;

  user.rpg.lastDaily = now;
  user.koin = (user.koin || 0) + moneyReward;
  user.energi = (user.energi || 0) + energiReward;

  const levelResult = await addExpWithLevelCheck(sock, m, db, user, expReward);
  db.save();

  await m.react("🎁");

  let txt = `¡GENIAL! ¡El sueldo diario ya cayó! 🎉✨\n\n`;
  txt += `Esta es tu ración de hoy:\n`;
  txt += `💸 Monedas: *+Rp ${moneyReward.toLocaleString("id-ID")}*\n`;
  txt += `📈 EXP: *+${expReward.toLocaleString("id-ID")}*\n`;
  txt += `⚡ Energía: *+${energiReward}*\n\n`;
  
  if (isPremium) {
    txt += `👑 *¡Wow, el bonus de Premium es diferente! ¡Los sultanes son libres!* 😎💸`;
  } else {
    txt += `¿Quieres un bonus mayor? ¡*Upgrade Premium*! ¡Para ser aún más rico! 🤑💎`;
  }

  m.reply(txt);
}

export { pluginConfig as config, handler };
