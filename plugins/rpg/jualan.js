import { getDatabase } from "../../src/lib/ourin-database.js";
import { addExpWithLevelCheck } from "../../src/lib/ourin-level.js";

const pluginConfig = {
  name: "jualan",
  alias: ["dagang", "pedagang"],
  category: "rpg",
  description: "Vender como vendedor ambulante",
  usage: ".jualan",
  example: ".jualan",
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
  
  const staminaCost = 18;
  user.rpg.stamina = user.rpg.stamina ?? 100;

  if (user.rpg.stamina < staminaCost) {
    return m.reply(`¡Piernas débiles de caminar tanto! 🥵\n\nVender requiere *${staminaCost} Stamina*, te quedan *${user.rpg.stamina}*. ¡Descansa un momento! 🏖️`);
  }

  user.rpg.stamina -= staminaCost;
  await m.react("🛒");
  await m.reply(`¡Cangcimen, cangcimen! ¡Cacahuates, dulces, caramelos! 🍬\nOfreciendo mercancía a los que pasan... 🗣️`);
  await new Promise(r => setTimeout(r, 3000));

  const gacha = Math.random();

  if (gacha < 0.2) {
    const rugi = Math.floor(Math.random() * 10000) + 5000;
    user.koin = Math.max(0, (user.koin || 0) - rugi);
    await m.react("🌧️");
    return m.reply(`¡LLUVIA FUERTE! ¡VENTAS EN CRISIS! 🌧️🥶\n\nNadie compra y tus fritos se pusieron todos blandos.\nPérdida de Capital: *Rp ${rugi.toLocaleString("id-ID")}*\n⚡ Stamina: -${staminaCost}\n\n¡Mañana revisa el pronóstico del tiempo! ☂️`);
  } else if (gacha > 0.85) {
    const lakuKeras = Math.floor(Math.random() * 80000) + 40000;
    user.koin = (user.koin || 0) + lakuKeras;
    const expGain = Math.floor(lakuKeras / 20);
    await addExpWithLevelCheck(sock, m, db, user, expGain);
    await m.react("🤑");
    return m.reply(`¡PASAN CICLISTAS Y LO COMPRAN TODO! 🚴‍♂️✨\n\n¡Un grupo de ciclistas de élite se detiene y compra todas las bebidas isotónicas y caramelos!\n💵 Facturación Sorpresa: *+Rp ${lakuKeras.toLocaleString("id-ID")}*\n📈 EXP: *+${expGain}*\n⚡ Stamina: -${staminaCost}\n\n¡Puedes irte a casa temprano! 🎉`);
  }

  const earning = Math.floor(Math.random() * 25000) + 10000;
  user.koin = (user.koin || 0) + earning;
  const expGain = Math.floor(earning / 20);
  await addExpWithLevelCheck(sock, m, db, user, expGain);

  await m.react("✅");
  m.reply(`¡VENTAS NORMALES! 🛒✨\n\n💵 Facturación: *+Rp ${earning.toLocaleString("id-ID")}*\n📈 EXP: *+${expGain}*\n⚡ Stamina: -${staminaCost}\n\n¡Mañana a abastecerse de nuevo! 🛍️`);
}

export { pluginConfig as config, handler };
