import { getDatabase } from "../../src/lib/luffy-database.js";
import { addExpWithLevelCheck } from "../../src/lib/luffy-level.js";

const pluginConfig = {
  name: "nyapu",
  alias: ["cleaning", "bersih"],
  category: "rpg",
  description: "Barre la calle, ¡quién sabe si encuentras algo caído!",
  usage: ".nyapu",
  example: ".nyapu",
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
  
  const staminaCost = 10;
  user.rpg.stamina = user.rpg.stamina ?? 100;

  if (user.rpg.stamina < staminaCost) {
    return m.reply(`¡Manos cansadas de agarrar la escoba! 😖\n\nBarrer necesita *${staminaCost} de Resistencia*, solo te quedan *${user.rpg.stamina}*. ¡Descansa bajo un árbol! 🌳`);
  }

  user.rpg.stamina -= staminaCost;
  await m.react("🧹");
  await m.reply(`Srak sruk srak sruk... 🧹\nLimpiando la basura de la gente... 🗑️`);
  await new Promise(r => setTimeout(r, 3000));

  const gacha = Math.random();

  if (gacha < 0.1) {
    const goldFound = Math.floor(Math.random() * 50000) + 15000;
    user.berry = (user.berry || 0) + goldFound;
    await m.react("💍");
    return m.reply(`¡QUÉ SUERTAZO! ¡ENCONTRASTE UN ANILLO DE ORO PERDIDO! 💍✨\n\nBarriendo la acera, encontraste un anillo de oro y lo vendiste al instante!\n💵 Ingreso Sorpresa: *+Rp ${goldFound.toLocaleString("id-ID")}*\n⚡ Resistencia: -${staminaCost}\n\n¡La buena suerte no se va a ningún lado! 🥳`);
  }

  const earning = Math.floor(Math.random() * 8000) + 3000;
  user.berry = (user.berry || 0) + earning;
  const expGain = Math.floor(earning / 20);
  await addExpWithLevelCheck(sock, m, db, user, expGain);

  await m.react("✅");
  m.reply(`¡TERMINASTE DE LIMPIAR! 🧹✨\n\n💵 Salario Diario: *+Rp ${earning.toLocaleString("id-ID")}*\n📈 EXP: *+${expGain}*\n⚡ Resistencia: -${staminaCost}\n\n¡El mundo cada vez más limpio y verde! 🌍`);
}

export { pluginConfig as config, handler };
