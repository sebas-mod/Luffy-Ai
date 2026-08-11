import { getDatabase } from "../../src/lib/luffy-database.js";
import { addExpWithLevelCheck } from "../../src/lib/luffy-level.js";

const pluginConfig = {
  name: "work",
  alias: ["kerja", "job"],
  category: "rpg",
  description: "Trabaja para ganar dinero",
  usage: ".work",
  example: ".work",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 180,
  carne: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};

  const staminaCost = 10;
  user.rpg.stamina = user.rpg.stamina || 100;

  if (user.rpg.stamina < staminaCost) {
    return m.reply(`Vaya bro, ¡tu cuerpo ya está muy agotado! 🥵💦\n\nTrabajar necesita *${staminaCost} de Resistencia*, solo te quedan *${user.rpg.stamina}*.\nDescansa un poco, no te esfuerces de más o te desmayas! 🛌💤`);
  }

  user.rpg.stamina -= staminaCost;

  const jobs = [
    { name: "👨‍🌾 Granjero", min: 1000, max: 3000 },
    { name: "🧹 Personal de Limpieza", min: 2000, max: 5000 },
    { name: "📦 Mensajero", min: 3000, max: 7000 },
    { name: "👨‍🍳 Cocinero", min: 4000, max: 10000 },
    { name: "👨‍💻 Programador", min: 8000, max: 20000 },
    { name: "👨‍⚕️ Médico", min: 15000, max: 30000 },
  ];

  const job = jobs[Math.floor(Math.random() * jobs.length)];
  const salary = Math.floor(Math.random() * (job.max - job.min + 1)) + job.min;
  const expGain = Math.floor(salary / 10);

  await m.reply(`En camino a trabajar como *${job.name.substring(3)}* bro! 🏃💼💨`);
  await new Promise((r) => setTimeout(r, 3000));

  user.berry = (user.berry || 0) + salary;
  const levelResult = await addExpWithLevelCheck(sock, m, db, user, expGain);

  db.save();

  let txt = `¡MIRA QUIÉN TERMINÓ DE TRABAJAR! 💸✨\n\n`;
  txt += `Qué locura, el sueldo está muy bien:\n`;
  txt += `💼 Profesión: *${job.name}*\n`;
  txt += `💵 Salario Neto: *+Rp ${salary.toLocaleString("id-ID")}*\n`;
  txt += `📈 EXP: *+${expGain}*\n`;
  txt += `⚡ Resistencia: *-${staminaCost}*\n\n`;
  txt += `El trabajo duro da frutos bro! ¡Sigue así! 🐴🔥`;

  await m.reply(txt);
}

export { pluginConfig as config, handler };
