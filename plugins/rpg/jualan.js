import { getDatabase } from "../../src/lib/luffy-database.js";
import { addExpWithLevelCheck } from "../../src/lib/luffy-level.js";

const pluginConfig = {
  name: "jualan",
  alias: ["dagang", "pedagang"],
  category: "rpg",
  description: "Dagang asongan keliling",
  usage: ".jualan",
  example: ".jualan",
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
  
  const staminaCost = 18;
  user.rpg.stamina = user.rpg.stamina ?? 100;

  if (user.rpg.stamina < staminaCost) {
    return m.reply(`¡Piernas cansadas de tanto pasear! 🥵\n\nVender necesita *${staminaCost} de Resistencia*, solo te quedan *${user.rpg.stamina}*. ¡Descansa un rato! 🏖️`);
  }

  user.rpg.stamina -= staminaCost;
  await m.react("🛒");
  await m.reply(`¡Dulces y antojos! ¡Dulces y antojos! 🍬\nOfreciendo mercancía a los transeúntes... 🗣️`);
  await new Promise(r => setTimeout(r, 3000));

  const gacha = Math.random();

  if (gacha < 0.2) {
    const rugi = Math.floor(Math.random() * 10000) + 5000;
    user.berry = Math.max(0, (user.berry || 0) - rugi);
    await m.react("🌧️");
    return m.reply(`¡LLUVIA TORRENCIAL! ¡SIN CLIENTES! 🌧️🥶\n\nNo compró nadie y tus galletas quedaron empapadas.\nPérdida de Capital: *Rp ${rugi.toLocaleString("id-ID")}*\n⚡ Resistencia: -${staminaCost}\n\n¡La próxima revisa el pronóstico del tiempo! ☂️`);
  } else if (gacha > 0.85) {
    const lakuKeras = Math.floor(Math.random() * 80000) + 40000;
    user.berry = (user.berry || 0) + lakuKeras;
    const expGain = Math.floor(lakuKeras / 20);
    await addExpWithLevelCheck(sock, m, db, user, expGain);
    await m.react("🤑");
    return m.reply(`¡PASÓ UN GRUPO Y LO COMPRÓ TODO! 🚴‍♂️✨\n\nUna caravana de ciclistas se detuvo y se llevó todas tus bebidas y dulces!\n💵 Venta Súbita: *+Rp ${lakuKeras.toLocaleString("id-ID")}*\n📈 EXP: *+${expGain}*\n⚡ Resistencia: -${staminaCost}\n\n¡Hoy puedes irte a casa temprano! 🎉`);
  }

  const earning = Math.floor(Math.random() * 25000) + 10000;
  user.berry = (user.berry || 0) + earning;
  const expGain = Math.floor(earning / 20);
  await addExpWithLevelCheck(sock, m, db, user, expGain);

  await m.react("✅");
  m.reply(`¡VENTA NORMAL! 🛒✨\n\n💵 Venta: *+Rp ${earning.toLocaleString("id-ID")}*\n📈 EXP: *+${expGain}*\n⚡ Resistencia: -${staminaCost}\n\n¡Mañana a reabastecer otra vez! 🛍️`);
}

export { pluginConfig as config, handler };
