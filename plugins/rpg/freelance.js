import { getDatabase } from "../../src/lib/luffy-database.js";
import { addExpWithLevelCheck } from "../../src/lib/luffy-level.js";

const pluginConfig = {
  name: "freelance",
  alias: ["desain", "koding"],
  category: "rpg",
  description: "Mengerjakan project online klien bule",
  usage: ".freelance",
  example: ".freelance",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 200,
  carne: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};
  
  const staminaCost = 25;
  user.rpg.stamina = user.rpg.stamina ?? 100;

  if (user.rpg.stamina < staminaCost) {
    return m.reply(`¡Tu cabeza echa humo pensando en errores! 🤯\n\nEl freelance necesita *${staminaCost} de Resistencia*, solo te quedan *${user.rpg.stamina}*. ¡Refresca tu mente! 🌿`);
  }

  user.rpg.stamina -= staminaCost;
  await m.react("💻");
  await m.reply(`Escribiendo código / dibujando en el portátil... ⌨️\n¡Ojalá el cliente no pida revisiones! 🙏`);
  await new Promise(r => setTimeout(r, 4000));

  const gacha = Math.random();

  if (gacha < 0.2) {
    await m.react("📉");
    return m.reply(`¡EL CLIENTE HUYÓ SIN PAGAR! 📉😡\n\nTrabajaste 3 días y 3 noches, y te dejó en visto!\n💵 Pago: 0\n⚡ Resistencia perdida: -${staminaCost}\n\nQué mala suerte, la próxima pide un adelanto! 😭`);
  } else if (gacha > 0.85) {
    const dollarRate = 16000;
    const payment = Math.floor(Math.random() * 10) + 5;
    const totalRupiah = payment * dollarRate;
    
    user.berry = (user.berry || 0) + totalRupiah;
    const expGain = Math.floor(totalRupiah / 30);
    await addExpWithLevelCheck(sock, m, db, user, expGain);
    
    await m.react("💸");
    return m.reply(`¡PAGADO EN DÓLARES POR UN EXTRANJERO! 💸✨\n\nEl cliente del extranjero quedó muy satisfecho y te dio $${payment}!\n💵 Pago: *+Rp ${totalRupiah.toLocaleString("id-ID")}*\n📈 EXP: *+${expGain}*\n⚡ Resistencia: -${staminaCost}\n\n¡Tu dinero de bolsillo de sultán te espera! 🤑`);
  }

  const earning = Math.floor(Math.random() * 40000) + 15000;
  user.berry = (user.berry || 0) + earning;
  const expGain = Math.floor(earning / 20);
  await addExpWithLevelCheck(sock, m, db, user, expGain);

  await m.react("✅");
  m.reply(`¡PROYECTO TERMINADO Y APROBADO! 💻✨\n\n💵 Pago Local: *+Rp ${earning.toLocaleString("id-ID")}*\n📈 EXP: *+${expGain}*\n⚡ Resistencia: -${staminaCost}\n\nNada mal para comprar un cafecito! ☕`);
}

export { pluginConfig as config, handler };
