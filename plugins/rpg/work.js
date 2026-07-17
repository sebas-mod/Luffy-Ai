import { getDatabase } from "../../src/lib/ourin-database.js";
import { addExpWithLevelCheck } from "../../src/lib/ourin-level.js";

const pluginConfig = {
  name: "work",
  alias: ["kerja", "job"],
  category: "rpg",
  description: "Trabajar para ganar dinero",
  usage: ".work",
  example: ".work",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 180,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};

  const staminaCost = 10;
  user.rpg.stamina = user.rpg.stamina || 100;

  if (user.rpg.stamina < staminaCost) {
    return m.reply(`¡Vaya, estás demasiado débil! 🥵💦\n\nTrabajar requiere *${staminaCost} Stamina*, pero solo tienes *${user.rpg.stamina}*.\n¡Descansa primero, no te fuerces o te desmayarás! 🛌💤`);
  }

  user.rpg.stamina -= staminaCost;

  const jobs = [
    { name: "👨‍🌾 Granjero", min: 1000, max: 3000 },
    { name: "🧹 Servicio de Limpieza", min: 2000, max: 5000 },
    { name: "📦 Mensajero", min: 3000, max: 7000 },
    { name: "👨‍🍳 Cocinero", min: 4000, max: 10000 },
    { name: "👨‍💻 Programador", min: 8000, max: 20000 },
    { name: "👨‍⚕️ Doctor", min: 15000, max: 30000 },
  ];

  const job = jobs[Math.floor(Math.random() * jobs.length)];
  const salary = Math.floor(Math.random() * (job.max - job.min + 1)) + job.min;
  const expGain = Math.floor(salary / 10);

  await m.reply(`¡Camino al trabajo como *${job.name.substring(3)}*! 🏃💼💨`);
  await new Promise((r) => setTimeout(r, 3000));

  user.belly = (user.belly || 0) + salary;
  const levelResult = await addExpWithLevelCheck(sock, m, db, user, expGain);

  db.save();

  let txt = `¡MIRA QUIEN ACABA DE TRABAJAR! 💸✨\n\n`;
  txt += `¡Genial, el sueldo es bastante bueno:\n`;
  txt += `💼 Profesión: *${job.name}*\n`;
  txt += `💵 Sueldo Neto: *+Belly ${salary.toLocaleString("es-ES")}*\n`;
  txt += `📈 EXP: *+${expGain}*\n`;
  txt += `⚡ Stamina: *-${staminaCost}*\n\n`;
  txt += `¡El trabajo duro da sus frutos! ¡Sigue así! 🐴🔥`;

  await m.reply(txt);
}

export { pluginConfig as config, handler };
