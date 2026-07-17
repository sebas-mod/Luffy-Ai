import { getDatabase } from "../../src/lib/ourin-database.js";
import { addExpWithLevelCheck } from "../../src/lib/ourin-level.js";

const pluginConfig = {
  name: "nambalban",
  alias: ["tambal", "bengkel"],
  category: "rpg",
  description: "Abrir taller de reparación de llantas, ¡cuidado con los estallidos!",
  usage: ".nambalban",
  example: ".nambalban",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 150,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};
  
  const staminaCost = 14;
  user.rpg.stamina = user.rpg.stamina ?? 100;

  if (user.rpg.stamina < staminaCost) {
    return m.reply(`¡La bomba de aire se atascó y las manos te arden! 🤕\n\nReparar neumáticos requiere *${staminaCost} Stamina*, te quedan *${user.rpg.stamina}*. ¡Toma un té helado primero! 🧊`);
  }

  user.rpg.stamina -= staminaCost;
  await m.react("🛠️");
  await m.reply(`Shhh... revisando neumático con agua y jabón... 🫧\n¡Encontraste un clavo clavado! 📍`);
  await new Promise(r => setTimeout(r, 3000));

  const gacha = Math.random();

  if (gacha < 0.15) {
    const healthLoss = 15;
    user.rpg.health = Math.max(0, (user.rpg.health ?? 100) - healthLoss);
    await m.react("💥");
    return m.reply(`¡¡PUM! ¡¡EL NEUMÁTICO EXPLOTÓ!! 💥😭\n\n¡Inflaste con fuerza y el neumático del camión explotó en tu cara!\n💔 HP Reducido: -${healthLoss}\n⚡ Stamina: -${staminaCost}\n💵 Ingresos: 0\n\n¡Tu cara cubierta de hollín, qué mala suerte! 💀`);
  }

  const earning = Math.floor(Math.random() * 20000) + 10000;
  user.belly = (user.belly || 0) + earning;
  const expGain = Math.floor(earning / 25);
  await addExpWithLevelCheck(sock, m, db, user, expGain);

  await m.react("✅");
  m.reply(`¡RESULTADO DE LA REPARACIÓN! 🛠️✨\n\n💵 Ingreso: *+Belly ${earning.toLocaleString("es-ES")}*\n📈 EXP: *+${expGain}*\n⚡ Stamina: -${staminaCost}\n\n¡Espero que no se vuelva a pinchad en camino! 💨`);
}

export { pluginConfig as config, handler };
