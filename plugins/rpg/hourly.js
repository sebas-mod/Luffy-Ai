import { getDatabase } from "../../src/lib/luffy-database.js";
import { addExpWithLevelCheck } from "../../src/lib/luffy-level.js";
import config from "../../config.js";

const pluginConfig = {
  name: "hourly",
  alias: ["jam", "perjam"],
  category: "rpg",
  description: "Reclama tu recompensa cada hora",
  usage: ".hourly",
  example: ".hourly",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 0,
  carne: 0,
  isEnabled: true,
};

function msToTime(duration) {
  const minutes = Math.floor((duration / (1000 * 60)) % 60);
  const seconds = Math.floor((duration / 1000) % 60);
  return `${minutes} minutos ${seconds} segundos`;
}

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);
  const isPremium = config.isPremium?.(m.sender) || false;

  if (!user.rpg) user.rpg = {};

  const COOLDOWN = 3600000;
  const lastClaim = user.rpg.lastHourly || 0;
  const now = Date.now();

  if (now - lastClaim < COOLDOWN) {
    const remaining = COOLDOWN - (now - lastClaim);
    return m.reply(`¡Ey, con qué prisa vas bro! 😂\n\nYa reclamaste tu paga de esta hora, espera *${msToTime(remaining)}* más y vuelve! 🏃💨`);
  }

  const expReward = isPremium ? 1000 : 200;
  const moneyReward = isPremium ? 5000 : 1000;

  user.rpg.lastHourly = now;
  user.berry = (user.berry || 0) + moneyReward;

  const levelResult = await addExpWithLevelCheck(sock, m, db, user, expReward);
  db.save();

  await m.react("⏰");

  let txt = `¡HORA DE COBRAR EL SUELDO POR HORAS! ⏰✨\n\n`;
  txt += `Este es tu reparto:\n`;
  txt += `💸 Berry: *+Rp ${moneyReward.toLocaleString("id-ID")}*\n`;
  txt += `📈 EXP: *+${expReward.toLocaleString("id-ID")}*\n\n`;
  txt += `¡Vuelve en 1 hora bro! 😘`;

  m.reply(txt);
}

export { pluginConfig as config, handler };
