import { getDatabase } from "../../src/lib/luffy-database.js";
import { addExpWithLevelCheck } from "../../src/lib/luffy-level.js";

const pluginConfig = {
  name: "adventure",
  alias: ["adv", "petualangan"],
  category: "rpg",
  description: "Aventúrate para obtener Exp y premios",
  usage: ".adventure",
  example: ".adventure",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 120,
  carne: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};
  user.rpg.health = user.rpg.health || 100;

  if (user.rpg.health < 30) {
    return m.reply(`Uy bro, ¡tu HP está casi muerto! 😭💔\n\nNecesitas al menos *30 HP* para aventurarte y no morir en el camino.\nAhora solo te quedan *${user.rpg.health} HP*. ¡Ve a curarte primero! 💉✨`);
  }

  const locations = ["🌲 Bosque Oscuro", "🏔️ Montaña del Hielo Eterno", "🏜️ Desierto de la Muerte", "🌋 Volcán", "🏰 Castillo Antiguo Embrujado", "🌊 Playa Misteriosa"];
  const location = locations[Math.floor(Math.random() * locations.length)];

  await m.react("🗺️");
  await m.reply(`Empacando la mochila y encendiendo la antorcha... Entrando a *${location}*... ⚔️🗺️\nTen cuidado bro, el aura es bastante escalofriante!`);
  await new Promise((r) => setTimeout(r, 2500));

  const isWin = Math.random() < 0.6;

  if (isWin) {
    const expGain = Math.floor(Math.random() * 2000) + 500;
    const moneyGain = Math.floor(Math.random() * 10000) + 2000;

    user.berry = (user.berry || 0) + moneyGain;
    const levelResult = await addExpWithLevelCheck(sock, m, db, user, expGain);

    db.save();

    let txt = `🗡️ *¡¡AVENTURA EXITOSA!!* 🗡️\n\n`;
    txt += `📍 Ubicación: *${location}*\n\n`;
    txt += `¡Increíble bro! Lograste vencer al monstruo guardián y encontraste un cofre del tesoro!\n`;
    txt += `💰 Berry: *+Rp ${moneyGain.toLocaleString("id-ID")}*\n`;
    txt += `📈 EXP: *+${expGain.toLocaleString("id-ID")}*\n\n`;
    txt += `¡Volviste sano y salvo! Sigue aventurándote más tarde bro! 🚀✨`;

    await m.reply(txt);
  } else {
    const healthLoss = Math.floor(Math.random() * 30) + 10;
    user.rpg.health = Math.max(0, user.rpg.health - healthLoss);

    let msg = `☠️ *¡EMBOSCADA DE MONSTRUOS!!* ☠️\n\n`;
    msg += `📍 Ubicación: *${location}*\n\n`;
    msg += `Uy bro! Tus pasos fueron detectados, ¡un grupo de monstruos atacó sin piedad!\n`;
    msg += `❤️ HP Reducido: *-${healthLoss} HP* (Restante: ${user.rpg.health})\n\n`;

    if (user.rpg.health <= 0) {
      user.rpg.health = 0;
      user.exp = Math.floor((user.exp || 0) / 2);
      msg += `💀 *¡MORISTE!*\nAy no bro... Caíste en el lugar. Tu EXP sufrió una penalización del 50%. 💔🥀`;
    } else {
      msg += `Menos mal lograste escapar bro! Mejor descansa y curate! 🏃💨`;
    }

    db.save();
    await m.reply(msg);
  }
}

export { pluginConfig as config, handler };
