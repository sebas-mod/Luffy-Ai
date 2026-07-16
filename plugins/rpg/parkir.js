import { getDatabase } from "../../src/lib/ourin-database.js";
import { addExpWithLevelCheck } from "../../src/lib/ourin-level.js";

const pluginConfig = {
  name: "parkir",
  alias: ["kangparkir", "markir"],
  category: "rpg",
  description: "Ser estacionador de supermercado, ¡cuidado con la policía municipal!",
  usage: ".parkir",
  example: ".parkir",
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
  
  const staminaCost = 12;
  user.rpg.stamina = user.rpg.stamina ?? 100;

  if (user.rpg.stamina < staminaCost) {
    return m.reply(`¡Piernas adoloridas de estar parado mucho tiempo! 😫\n\nEstacionar requiere *${staminaCost} Stamina*, te quedan *${user.rpg.stamina}*. ¡Descansa en el puesto! 🏚️`);
  }

  user.rpg.stamina -= staminaCost;
  await m.react("🅿️");
  await m.reply(`¡Piiip! ¡Sigue, sigue, un poco a la izquierda! 🏁\nEmpezando a cobrar el estacionamiento... 💰`);
  await new Promise(r => setTimeout(r, 3000));

  const gacha = Math.random();

  if (gacha < 0.1) {
    const denda = Math.floor(Math.random() * 5000) + 1000;
    user.koin = Math.max(0, (user.koin || 0) - denda);
    await m.react("🚨");
    return m.reply(`¡¡OH NO, REDADA DE LA POLICÍA!! 🚓💨\n\n¡Corriste despavorido y tus monedas cayeron por valor de *Rp ${denda.toLocaleString("id-ID")}*!\n⚡ Stamina: -${staminaCost}\n\n¡Qué mala suerte hoy! 😭`);
  } else if (gacha > 0.9) {
    const jackpot = Math.floor(Math.random() * 50000) + 20000;
    user.koin = (user.koin || 0) + jackpot;
    const expGain = Math.floor(jackpot / 20);
    await addExpWithLevelCheck(sock, m, db, user, expGain);
    await m.react("🤑");
    return m.reply(`¡JACKPOT! ¡HAY UN AUTO DEPORTIVO DEL SULTÁN! 🏎️✨\n\nAl salir, baja la ventanilla y el sultán te da un billete de 100k!\n💵 Ingreso: *+Rp ${jackpot.toLocaleString("id-ID")}*\n📈 EXP: *+${expGain}*\n⚡ Stamina: -${staminaCost}\n\n¡Alabado sea Dios, bendiciones del cielo! 🙏`);
  }

  const earning = Math.floor(Math.random() * 8000) + 2000;
  user.koin = (user.koin || 0) + earning;
  const expGain = Math.floor(earning / 20);
  await addExpWithLevelCheck(sock, m, db, user, expGain);

  await m.react("✅");
  m.reply(`¡RESULTADO DEL ESTACIONAMIENTO HOY! 🅿️✨\n\n💵 Ingreso: *+Rp ${earning.toLocaleString("id-ID")}*\n📈 EXP: *+${expGain}*\n⚡ Stamina: -${staminaCost}\n\nDe moneda en moneda, ¡se forma una montaña! 💪`);
}

export { pluginConfig as config, handler };
