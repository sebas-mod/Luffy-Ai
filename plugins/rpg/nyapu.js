import { getDatabase } from "../../src/lib/ourin-database.js";
import { addExpWithLevelCheck } from "../../src/lib/ourin-level.js";

const pluginConfig = {
  name: "nyapu",
  alias: ["cleaning", "bersih"],
  category: "rpg",
  description: "Barrer la calle, ¡a ver si encuentras algo perdido!",
  usage: ".nyapu",
  example: ".nyapu",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 120,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};
  
  const staminaCost = 10;
  user.rpg.stamina = user.rpg.stamina ?? 100;

  if (user.rpg.stamina < staminaCost) {
    return m.reply(`¡Manos adoloridas de agarrar la escoba tanto! 😖\n\nBarrer requiere *${staminaCost} Stamina*, te quedan *${user.rpg.stamina}*. ¡Descansa bajo un árbol! 🌳`);
  }

  user.rpg.stamina -= staminaCost;
  await m.react("🧹");
  await m.reply(`Chasquido chasquido chasquido... 🧹\nLimpiando la basura de la sociedad... 🗑️`);
  await new Promise(r => setTimeout(r, 3000));

  const gacha = Math.random();

  if (gacha < 0.1) {
    const goldFound = Math.floor(Math.random() * 50000) + 15000;
    user.belly = (user.belly || 0) + goldFound;
    await m.react("💍");
    return m.reply(`¡¡SUERTE INCREÍBLE! ¡ENCONTRASTE UN ANILLO DE ORO! 💍✨\n\nMientras barrías la acera, encontraste un anillo de oro y lo vendiste de inmediato!\n💵 Ingreso Sorpresa: *+Belly ${goldFound.toLocaleString("es-ES")}*\n⚡ Stamina: -${staminaCost}\n\n¡La fortuna llega cuando menos lo esperas! 🥳`);
  }

  const earning = Math.floor(Math.random() * 8000) + 3000;
  user.belly = (user.belly || 0) + earning;
  const expGain = Math.floor(earning / 20);
  await addExpWithLevelCheck(sock, m, db, user, expGain);

  await m.react("✅");
  m.reply(`¡ALABADO SEA DIOS, LIMPIEZA COMPLETADA! 🧹✨\n\n💵 Salario Diario: *+Belly ${earning.toLocaleString("es-ES")}*\n📈 EXP: *+${expGain}*\n⚡ Stamina: -${staminaCost}\n\n¡El mundo está más limpio y hermoso! 🌍`);
}

export { pluginConfig as config, handler };
