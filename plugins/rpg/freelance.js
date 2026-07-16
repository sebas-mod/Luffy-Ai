import { getDatabase } from "../../src/lib/ourin-database.js";
import { addExpWithLevelCheck } from "../../src/lib/ourin-level.js";

const pluginConfig = {
  name: "freelance",
  alias: ["desain", "koding"],
  category: "rpg",
  description: "Realizar proyectos online para clientes extranjeros",
  usage: ".freelance",
  example: ".freelance",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 200,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};
  
  const staminaCost = 25;
  user.rpg.stamina = user.rpg.stamina ?? 100;

  if (user.rpg.stamina < staminaCost) {
    return m.reply(`¡Cerebro humeante pensando en errores! 🤯\n\nFreelance requiere *${staminaCost} Stamina*, te quedan *${user.rpg.stamina}*. ¡Tómate un descanso! 🌿`);
  }

  user.rpg.stamina -= staminaCost;
  await m.react("💻");
  await m.reply(`Escribiendo código / dibujando en la laptop... ⌨️\n¡Ojalá el cliente no pida revisiones! 🙏`);
  await new Promise(r => setTimeout(r, 4000));

  const gacha = Math.random();

  if (gacha < 0.2) {
    await m.react("📉");
    return m.reply(`¡EL CLIENTE HUYÓ Y NO QUISO PAGAR! 📉😡\n\nTrabajaste 3 noches sin dormir y ¡te dejaron en visto!\n💵 Pago: 0\n⚡ Stamina perdida: -${staminaCost}\n\nQué mala suerte, ¡la próxima exige anticipo! 😭`);
  } else if (gacha > 0.85) {
    const dollarRate = 16000;
    const payment = Math.floor(Math.random() * 10) + 5;
    const totalRupiah = payment * dollarRate;
    
    user.koin = (user.koin || 0) + totalRupiah;
    const expGain = Math.floor(totalRupiah / 30);
    await addExpWithLevelCheck(sock, m, db, user, expGain);
    
    await m.react("💸");
    return m.reply(`¡PAGADO CON DÓLARES POR UN EXTRANJERO! 💸✨\n\n¡El cliente internacional está encantado y te dio $${payment}!\n💵 Pago: *+Rp ${totalRupiah.toLocaleString("id-ID")}*\n📈 EXP: *+${expGain}*\n⚡ Stamina: -${staminaCost}\n\n¡Te esperan los dulces del sultán! 🤑`);
  }

  const earning = Math.floor(Math.random() * 40000) + 15000;
  user.koin = (user.koin || 0) + earning;
  const expGain = Math.floor(earning / 20);
  await addExpWithLevelCheck(sock, m, db, user, expGain);

  await m.react("✅");
  m.reply(`¡PROYECTO TERMINADO Y APROBADO! 💻✨\n\n💵 Pago local: *+Rp ${earning.toLocaleString("id-ID")}*\n📈 EXP: *+${expGain}*\n⚡ Stamina: -${staminaCost}\n\n¡Sirve para comprar café! ☕`);
}

export { pluginConfig as config, handler };
