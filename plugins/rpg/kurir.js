import { getDatabase } from "../../src/lib/ourin-database.js";
import { addExpWithLevelCheck } from "../../src/lib/ourin-level.js";

const pluginConfig = {
  name: "kurir",
  alias: ["antar", "paket"],
  category: "rpg",
  description: "Entregar paquetes, ¡cuidado con los perros!",
  usage: ".kurir",
  example: ".kurir",
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
  
  const staminaCost = 15;
  user.rpg.stamina = user.rpg.stamina ?? 100;

  if (user.rpg.stamina < staminaCost) {
    return m.reply(`¡Espalda destrozada de cargar cajas! 😩\n\nMensajero requiere *${staminaCost} Stamina*, te quedan *${user.rpg.stamina}*. ¡Masa un poco! 💆‍♂️`);
  }

  user.rpg.stamina -= staminaCost;
  await m.react("📦");
  await m.reply(`¡¡¡Paquete!!! 📦\nBuscando la dirección correcta en el mapa... 🗺️`);
  await new Promise(r => setTimeout(r, 3000));

  const gacha = Math.random();

  if (gacha < 0.2) {
    const extraStamina = 10;
    user.rpg.stamina = Math.max(0, user.rpg.stamina - extraStamina);
    
    const expGain = 500;
    await addExpWithLevelCheck(sock, m, db, user, expGain);
    
    await m.react("🐕");
    return m.reply(`¡GUAU GUAU GUAU! ¡PERRO FEROZ TE PERSIGUE! 🐕💨\n\n¡Corriste por todo el complejo para salvar el paquete!\n⚡ Estamina Extra: -${extraStamina}\n📈 EXP por Correr: *+${expGain}*\n💵 Ingresos: 0 (Lanzaste el paquete por la cerca)\n\n¡Te faltó el aire de verdad! 🥵`);
  }

  const items = ["Documentos Secretos", "Ropa Online", "Cosméticos de Ajena", "Olla de la Vecina"];
  const item = items[Math.floor(Math.random() * items.length)];
  const earning = Math.floor(Math.random() * 15000) + 5000;
  let tips = 0;

  if (gacha > 0.8) {
    tips = Math.floor(Math.random() * 10000) + 2000;
  }

  const totalEarning = earning + tips;
  user.belly = (user.belly || 0) + totalEarning;
  const expGain = Math.floor(totalEarning / 20);
  await addExpWithLevelCheck(sock, m, db, user, expGain);

  await m.react("✅");
  let txt = `¡¡GRACIAS A DIOS, EL PAQUETE LLEGÓ!! 📦✨\n\nArtículo: *${item}*\n💵 Envío: *+Belly ${earning.toLocaleString("es-ES")}*\n`;
  if (tips > 0) txt += `🎁 Propina Extra: *+Belly ${tips.toLocaleString("es-ES")}*\n`;
  txt += `📈 EXP: *+${expGain}*\n⚡ Stamina: -${staminaCost}\n\n¡Entregado a tiempo! 🚚💨`;
  m.reply(txt);
}

export { pluginConfig as config, handler };
