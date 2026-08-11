import { getDatabase } from "../../src/lib/luffy-database.js";
import { addExpWithLevelCheck } from "../../src/lib/luffy-level.js";

const pluginConfig = {
  name: "nambalban",
  alias: ["tambal", "bengkel"],
  category: "rpg",
  description: "Abre un servicio de parcheo de llantas, ¡cuidado con las explosiones!",
  usage: ".nambalban",
  example: ".nambalban",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 150,
  carne: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};
  
  const staminaCost = 14;
  user.rpg.stamina = user.rpg.stamina ?? 100;

  if (user.rpg.stamina < staminaCost) {
    return m.reply(`¡La bomba de aire se atascó, tus manos tienen callos! 🤕\n\nParchear necesita *${staminaCost} de Resistencia*, solo te quedan *${user.rpg.stamina}*. ¡Tómate un té helado! 🧊`);
  }

  user.rpg.stamina -= staminaCost;
  await m.react("🛠️");
  await m.reply(`Sssshh... revisando la llanta pinchada con agua y jabón... 🫧\n¡Encontré el clavo! 📍`);
  await new Promise(r => setTimeout(r, 3000));

  const gacha = Math.random();

  if (gacha < 0.15) {
    const healthLoss = 15;
    user.rpg.health = Math.max(0, (user.rpg.health ?? 100) - healthLoss);
    await m.react("💥");
    return m.reply(`¡BOOOOM! ¡LA LLANTA EXPLOTÓ! 💥😭\n\nInflaste demasiado y la llanta del camión explotó frente a tu cara!\n💔 HP reducido: -${healthLoss}\n⚡ Resistencia: -${staminaCost}\n💵 Ingreso: 0\n\nTe quedó la cara llena de humo, qué mala suerte! 💀`);
  }

  const earning = Math.floor(Math.random() * 20000) + 10000;
  user.berry = (user.berry || 0) + earning;
  const expGain = Math.floor(earning / 25);
  await addExpWithLevelCheck(sock, m, db, user, expGain);

  await m.react("✅");
  m.reply(`¡RESULTADO DEL PARCHEO! 🛠️✨\n\n💵 Ingreso: *+Rp ${earning.toLocaleString("id-ID")}*\n📈 EXP: *+${expGain}*\n⚡ Resistencia: -${staminaCost}\n\n¡Ojalá ese tipo no vuelva a pincharse en el camino! 💨`);
}

export { pluginConfig as config, handler };
