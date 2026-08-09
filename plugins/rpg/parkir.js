import { getDatabase } from "../../src/lib/luffy-database.js";
import { addExpWithLevelCheck } from "../../src/lib/luffy-level.js";

const pluginConfig = {
  name: "parkir",
  alias: ["kangparkir", "markir"],
  category: "rpg",
  description: "Jadi tukang parkir minimarket, waspada satpol PP!",
  usage: ".parkir",
  example: ".parkir",
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
  
  const staminaCost = 12;
  user.rpg.stamina = user.rpg.stamina ?? 100;

  if (user.rpg.stamina < staminaCost) {
    return m.reply(`¡Piernas cansadas de estar tanto tiempo de pie! 😫\n\nSer aparcacoches necesita *${staminaCost} de Resistencia*, solo te quedan *${user.rpg.stamina}*. ¡Descansa en el puesto! 🏚️`);
  }

  user.rpg.stamina -= staminaCost;
  await m.react("🅿️");
  await m.reply(`Piiiiit! Sigue, sigue, ¡un poco a la izquierda! 🏁\nEmpezando a cobrar el estacionamiento del minimarket... 💰`);
  await new Promise(r => setTimeout(r, 3000));

  const gacha = Math.random();

  if (gacha < 0.1) {
    const denda = Math.floor(Math.random() * 5000) + 1000;
    user.berry = Math.max(0, (user.berry || 0) - denda);
    await m.react("🚨");
    return m.reply(`¡CUIDADO, LLEGÓ LA INSPECCIÓN MUNICIPAL! 🚓💨\n\nSaliste corriendo y se te cayeron las monedas por valor de *Rp ${denda.toLocaleString("id-ID")}*!\n⚡ Resistencia: -${staminaCost}\n\n¡Qué día tan maldito! 😭`);
  } else if (gacha > 0.9) {
    const jackpot = Math.floor(Math.random() * 50000) + 20000;
    user.berry = (user.berry || 0) + jackpot;
    const expGain = Math.floor(jackpot / 20);
    await addExpWithLevelCheck(sock, m, db, user, expGain);
    await m.react("🤑");
    return m.reply(`¡JACKPOT! ¡UN COCHE DEPORTIVO DE RICO! 🏎️✨\n\nCuando iba a salir, bajó la ventanilla y el ricachón te dio un billete grande!\n💵 Ingreso: *+Rp ${jackpot.toLocaleString("id-ID")}*\n📈 EXP: *+${expGain}*\n⚡ Resistencia: -${staminaCost}\n\n¡Bendición para el buen trabajador! 🙏`);
  }

  const earning = Math.floor(Math.random() * 8000) + 2000;
  user.berry = (user.berry || 0) + earning;
  const expGain = Math.floor(earning / 20);
  await addExpWithLevelCheck(sock, m, db, user, expGain);

  await m.react("✅");
  m.reply(`¡RESULTADO DE APARCACOCHES HOY! 🅿️✨\n\n💵 Ingreso: *+Rp ${earning.toLocaleString("id-ID")}*\n📈 EXP: *+${expGain}*\n⚡ Resistencia: -${staminaCost}\n\n¡De moneda en moneda se hace una montaña! 💪`);
}

export { pluginConfig as config, handler };
