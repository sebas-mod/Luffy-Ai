import { getDatabase } from "../../src/lib/ourin-database.js";
import { addExpWithLevelCheck } from "../../src/lib/ourin-level.js";

const pluginConfig = {
  name: "streamer",
  alias: ["live", "vtuber"],
  category: "rpg",
  description: "Transmitir en vivo para ganar donaciones (riesgo de ban)",
  usage: ".streamer",
  example: ".streamer",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 180,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, plugin }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};
  
  const staminaCost = 20;
  user.rpg.stamina = user.rpg.stamina ?? 100;

  if (user.rpg.stamina < staminaCost) {
    return m.reply(`¡Ojos quemados de mirar tanto la pantalla! 😵\n\nStreaming requiere *${staminaCost} Stamina*, te quedan *${user.rpg.stamina}*. ¡Duerme primero! 🛏️`);
  }

  user.rpg.stamina -= staminaCost;
  await m.react("🎥");
  await m.reply(`Halo guys, welcome back to my live stream! 🎮\nMari kita unjuk skill main game cacing... 😎`);
  await new Promise(r => setTimeout(r, 3500));

  const gacha = Math.random();

  if (gacha < 0.15) {
    const extraCooldown = 300;
    db.db.data.users[m.sender.split("@")[0]].lastStreamer = Date.now() + (extraCooldown * 1000);
    
    await m.react("🚫");
    return m.reply(`¡TU CUENTA DE STREAMING FUE BANEADA! 🚫😱\n\n¡Un espectador tramposo te reportó por estar AFK demasiado tiempo!\n¡No recibiste donaciones y **recibiste una penalización de 5 minutos de ban extra**!\n\n⚡ Stamina sigue reducida: -${staminaCost}\n\nTen paciencia, intenta apelar... 😔`);
  }

  const earning = Math.floor(Math.random() * 30000) + 10000;
  let saweranPaus = 0;

  if (gacha > 0.85) {
    saweranPaus = Math.floor(Math.random() * 100000) + 50000;
  }

  const totalEarning = earning + saweranPaus;
  user.belly = (user.belly || 0) + totalEarning;
  const expGain = Math.floor(totalEarning / 30);
  await addExpWithLevelCheck(sock, m, db, user, expGain);

  await m.react("✅");
  let txt = `¡STREAMING EN VIVO TERMINADO! 🎥✨\n\n💵 Ingreso por anuncios: *+Belly ${earning.toLocaleString("es-ES")}*\n`;
  if (saweranPaus > 0) txt += `🐳 DONACIÓN DEL SULTÁN: *+Belly ${saweranPaus.toLocaleString("es-ES")}*\n¡Vaya, ¡un espectador sultán donó una fortuna! 🐋🔥\n`;
  txt += `📈 EXP: *+${expGain}*\n⚡ Stamina: -${staminaCost}\n\n¡Gracias por las donaciones! ¡Te queremos! 💖`;
  
  m.reply(txt);
}

export { pluginConfig as config, handler };
