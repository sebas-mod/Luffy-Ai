import { getDatabase } from "../../src/lib/ourin-database.js";
import { addExpWithLevelCheck } from "../../src/lib/ourin-level.js";

const pluginConfig = {
  name: "adventure",
  alias: ["adv", "petualangan"],
  category: "rpg",
  description: "Aventurarse para obtener EXP y recompensas",
  usage: ".adventure",
  example: ".adventure",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 120,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};
  user.rpg.health = user.rpg.health || 100;

  if (user.rpg.health < 30) {
    return m.reply(`¡Ay, tu HP está por los suelos! 😭💔\n\nNecesitas al menos *30 HP* para aventurarte sin morir en el camino.\nAhora solo tienes *${user.rpg.health} HP*. ¡Ve a curarte! 💉✨`);
  }

  const locations = ["🌲 Bosque Oscuro", "🏔️ Monte Hielo Eterno", "🏜️ Desierto de la Muerte", "🌋 Volcán", "🏰 Castillo Antiguo Embrujado", "🌊 Playa Misteriosa"];
  const location = locations[Math.floor(Math.random() * locations.length)];

  await m.react("🗺️");
  await m.reply(`Preparando la mochila y encendiendo la antorcha... Entrando en *${location}*... ⚔️🗺️\n¡Ten cuidado, el ambiente está muy tenso!`);
  await new Promise((r) => setTimeout(r, 2500));

  const isWin = Math.random() < 0.6;

  if (isWin) {
    const expGain = Math.floor(Math.random() * 2000) + 500;
    const moneyGain = Math.floor(Math.random() * 10000) + 2000;

    user.belly = (user.belly || 0) + moneyGain;
    const levelResult = await addExpWithLevelCheck(sock, m, db, user, expGain);

    db.save();

    let txt = `🗡️ *¡¡AVENTURA EXITOSA!!* 🗡️\n\n`;
    txt += `📍 Ubicación: *${location}*\n\n`;
    txt += `¡Genial! ¡Lograste derrotar al monstruo guardián y encontraste un cofre del tesoro!\n`;
    txt += `💰 Belly: *+Belly ${moneyGain.toLocaleString("es-ES")}*\n`;
    txt += `📈 EXP: *+${expGain.toLocaleString("es-ES")}*\n\n`;
    txt += `¡Regresaste a salvo! ¡Sigue aventurándote más tarde! 🚀✨`;

    await m.reply(txt);
  } else {
    const healthLoss = Math.floor(Math.random() * 30) + 10;
    user.rpg.health = Math.max(0, user.rpg.health - healthLoss);

    let msg = `☠️ *¡¡EMBOSCADO POR MONSTRUOS!!* ☠️\n\n`;
    msg += `📍 Ubicación: *${location}*\n\n`;
    msg += `¡Ay! ¡Te descubrieron, un grupo de monstruos te atacó sin piedad!\n`;
    msg += `❤️ HP Reducido: *-${healthLoss} HP* (Restante: ${user.rpg.health})\n\n`;

    if (user.rpg.health <= 0) {
      user.rpg.health = 0;
      user.exp = Math.floor((user.exp || 0) / 2);
      msg += `💀 ¡¡HAS MUERTO!!\n¡Vaya... moriste en el campo! Tu EXP recibió una penalización del 50%. 💔🥀`;
    } else {
      msg += `¡Tuvo suerte que pudiste escapar! Mejor descansa para curarte. 🏃💨`;
    }

    db.save();
    await m.reply(msg);
  }
}

export { pluginConfig as config, handler };
