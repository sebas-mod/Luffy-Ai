import { getDatabase } from "../../src/lib/luffy-database.js";
import { addExpWithLevelCheck } from "../../src/lib/luffy-level.js";

const pluginConfig = {
  name: "kurir",
  alias: ["antar", "paket"],
  category: "rpg",
  description: "Reparte los paquetes de la gente, ¡cuidado con los perros bravos!",
  usage: ".kurir",
  example: ".kurir",
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
  
  const staminaCost = 15;
  user.rpg.stamina = user.rpg.stamina ?? 100;

  if (user.rpg.stamina < staminaCost) {
    return m.reply(`¡Cintura adolorida de cargar cajas! 😩\n\nEl mensajero necesita *${staminaCost} de Resistencia*, solo te quedan *${user.rpg.stamina}*. ¡Hazte un masaje primero! 💆‍♂️`);
  }

  user.rpg.stamina -= staminaCost;
  await m.react("📦");
  await m.reply(`¡Paqueeeete!!! 📦\nBuscando la dirección correcta en el mapa... 🗺️`);
  await new Promise(r => setTimeout(r, 3000));

  const gacha = Math.random();

  if (gacha < 0.2) {
    const extraStamina = 10;
    user.rpg.stamina = Math.max(0, user.rpg.stamina - extraStamina);
    
    const expGain = 500;
    await addExpWithLevelCheck(sock, m, db, user, expGain);
    
    await m.react("🐕");
    return m.reply(`¡GUAU GUAU GUAU! ¡TE PERSIGUE UN PERRO BRAVO! 🐕💨\n\nCorriste por todo el vecindario para salvar el paquete!\n⚡ Resistencia Adicional: -${extraStamina}\n📈 EXP por Correr: *+${expGain}*\n💵 Ingreso: 0 (el paquete voló por encima de la cerca)\n\n¡De verdad que te quedaste sin aire! 🥵`);
  }

  const items = ["Documento Secreto", "Ropa Online", "Skincare de la Esposa Ajena", "Olla de la Mamá"];
  const item = items[Math.floor(Math.random() * items.length)];
  const earning = Math.floor(Math.random() * 15000) + 5000;
  let tips = 0;

  if (gacha > 0.8) {
    tips = Math.floor(Math.random() * 10000) + 2000;
  }

  const totalEarning = earning + tips;
  user.berry = (user.berry || 0) + totalEarning;
  const expGain = Math.floor(totalEarning / 20);
  await addExpWithLevelCheck(sock, m, db, user, expGain);

  await m.react("✅");
  let txt = `¡POR FIN EL PAQUETE LLEGÓ! 📦✨\n\nArtículo: *${item}*\n💵 Envío: *+Rp ${earning.toLocaleString("id-ID")}*\n`;
  if (tips > 0) txt += `🎁 Propina Adicional: *+Rp ${tips.toLocaleString("id-ID")}*\n`;
  txt += `📈 EXP: *+${expGain}*\n⚡ Resistencia: -${staminaCost}\n\n¡Lograste entregarlo a tiempo! 🚚💨`;
  m.reply(txt);
}

export { pluginConfig as config, handler };
