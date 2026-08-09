import { getDatabase } from "../../src/lib/luffy-database.js";
import { addExpWithLevelCheck } from "../../src/lib/luffy-level.js";

const pluginConfig = {
  name: "streamer",
  alias: ["live", "vtuber"],
  category: "rpg",
  description: "Live streaming game dapet donasi besar tapi resiko dibanned platform!",
  usage: ".streamer",
  example: ".streamer",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 180,
  carne: 0,
  isEnabled: true,
};

async function handler(m, { sock, plugin }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};
  
  const staminaCost = 20;
  user.rpg.stamina = user.rpg.stamina ?? 100;

  if (user.rpg.stamina < staminaCost) {
    return m.reply(`¡Ojos hinchados de tanto mirar la pantalla! 😵\n\nStreaming necesita *${staminaCost} de Resistencia*, solo te quedan *${user.rpg.stamina}*. ¡Ve a dormir! 🛏️`);
  }

  user.rpg.stamina -= staminaCost;
  await m.react("🎥");
  await m.reply(`¡Hola chicos, bienvenidos a mi live stream! 🎮\nVamos a demostrar nuestra habilidad jugando... 😎`);
  await new Promise(r => setTimeout(r, 3500));

  const gacha = Math.random();

  if (gacha < 0.15) {
    const extraCooldown = 300;
    db.db.data.users[m.sender.split("@")[0]].lastStreamer = Date.now() + (extraCooldown * 1000);
    
    await m.react("🚫");
    return m.reply(`¡TU CUENTA DE STREAMING FUE BANEADA! 🚫😱\n\n¡Algún viewer travieso te reportó por estar AFK demasiado tiempo!\nNo recibiste ninguna donación y **sufriste una penalización de 5 minutos extra sin poder streamear**!\n\n⚡ La resistencia igual se gasta: -${staminaCost}\n\nTen paciencia jefe, intenta apelar... 😔`);
  }

  const earning = Math.floor(Math.random() * 30000) + 10000;
  let saweranPaus = 0;

  if (gacha > 0.85) {
    saweranPaus = Math.floor(Math.random() * 100000) + 50000;
  }

  const totalEarning = earning + saweranPaus;
  user.berry = (user.berry || 0) + totalEarning;
  const expGain = Math.floor(totalEarning / 30);
  await addExpWithLevelCheck(sock, m, db, user, expGain);

  await m.react("✅");
  let txt = `¡LIVE STREAMING TERMINADO! 🎥✨\n\n💵 Ingreso por Anuncios: *+Rp ${earning.toLocaleString("id-ID")}*\n`;
  if (saweranPaus > 0) txt += `🐳 ¡DONACIÓN DE RICACHÓN: *+Rp ${saweranPaus.toLocaleString("id-ID")}*\nVaya, ¡un espectador millonario donó a lo grande! 🐋🔥\n`;
  txt += `📈 EXP: *+${expGain}*\n⚡ Resistencia: -${staminaCost}\n\n¡Gracias a los que donaron! Los quiero mucho! 💖`;
  
  m.reply(txt);
}

export { pluginConfig as config, handler };
