import { getDatabase } from "../../src/lib/luffy-database.js";
import { addExpWithLevelCheck } from "../../src/lib/luffy-level.js";

const pluginConfig = {
  name: "ngemis",
  alias: ["minta", "gembel"],
  category: "rpg",
  description: "Pide limosna en la calle con la posibilidad de conseguir un almuerzo gratis (aumenta resistencia)",
  usage: ".ngemis",
  example: ".ngemis",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 120,
  carne: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};
  
  const staminaCost = 5;
  user.rpg.stamina = user.rpg.stamina ?? 100;

  if (user.rpg.stamina < staminaCost) {
    return m.reply(`¡Sin fuerzas para limosnear! 🥺\n\nPedir necesita *${staminaCost} de Resistencia*, solo te quedan *${user.rpg.stamina}*. Ya no puedo ni abrir la boca... 💔`);
  }

  user.rpg.stamina -= staminaCost;
  await m.react("🤲");
  await m.reply(`Señor, señora, una limosnita por favor... 🥺\nEsperando que pase un alma caritativa por este cruce... 🚶‍♂️`);
  await new Promise(r => setTimeout(r, 3000));

  const gacha = Math.random();

  if (gacha < 0.3) {
    const heal = Math.floor(Math.random() * 20) + 10;
    user.rpg.stamina = Math.min(100, user.rpg.stamina + heal);
    await m.react("🍱");
    return m.reply(`¡GRACIAS A DIOS, TE REGALARON COMIDA! 🍱✨\n\nUn señor bondadoso te dio un pedazo de arroz con pollo!\n💖 Resistencia aumentada: *+${heal}*\n💵 Dinero obtenido: 0\n\n¡Vaya, panza llena, corazón contento! 🥰`);
  }

  if (gacha > 0.9) {
    await m.react("💢");
    return m.reply(`¡EXPULSADO POR EL MATÓN DEL MERCADO! 💢\n\n"¡Oye, ese es mi puesto! ¡Lárgate!"\nSaliste corriendo asustado sin recibir ni una moneda...\n⚡ Resistencia: -${staminaCost}\n\n¡Qué difícil es encontrar un buen lugar para pedir hoy en día! 😭`);
  }

  const earning = Math.floor(Math.random() * 3000) + 500;
  user.berry = (user.berry || 0) + earning;
  const expGain = Math.floor(earning / 10);
  await addExpWithLevelCheck(sock, m, db, user, expGain);

  await m.react("✅");
  m.reply(`¡RESULTADO DE LIMOSNEAR HOY! 🤲✨\n\n💵 Ganancias en Monedas: *+Rp ${earning.toLocaleString("id-ID")}*\n📈 EXP: *+${expGain}*\n⚡ Resistencia: -${staminaCost}\n\nAgradecido por la bendición de hoy, aunque sea poco, mientras sea lícito! 🙏`);
}

export { pluginConfig as config, handler };
