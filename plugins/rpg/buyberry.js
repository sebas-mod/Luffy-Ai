import { getDatabase } from "../../src/lib/luffy-database.js";
const pluginConfig = {
  name: "buyberry",
  alias: ["beliberry", "exptoberry"],
  category: "rpg",
  description: "Cambiar EXP por Berry",
  usage: ".buyberry <cantidad>",
  example: ".buyberry 10000",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  carne: 0,
  isEnabled: true,
};

const EXP_PER_BERRY = 2;

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};

  const args = m.args || [];
  const amountStr = args[0];

  if (!amountStr) {
    let txt = `💱 *Comprar Berry*\n\n`;
    txt += `> ¡Cambia EXP por Berry!\n\n`;
    txt += `*📊 Tipo de Cambio:*\n`;
    txt += `> 💎 ${EXP_PER_BERRY} EXP = 1 Berry\n\n`;
    txt += `*📋 Saldo:*\n`;
    txt += `> 🚄 EXP: *${(user.exp || 0).toLocaleString("es-ES")}*\n`;
    txt += `> 💰 Berry: *${(user.berry || 0).toLocaleString("es-ES")}*\n\n`;
    txt += `> Ejemplo: \`.buyberry 10000\`\n`;
    txt += `> Usará ${10000 * EXP_PER_BERRY} EXP para 10.000 Berry`;

    return m.reply(txt);
  }

  let berryAmount = 0;
  if (amountStr === "all" || amountStr === "max") {
    berryAmount = Math.floor((user.exp || 0) / EXP_PER_BERRY);
  } else {
    berryAmount = parseInt(amountStr);
  }

  if (!berryAmount || berryAmount <= 0) {
    return m.reply(`❌ ¡Ingresa una cantidad de berry válida!`);
  }

  const expNeeded = berryAmount * EXP_PER_BERRY;

  if ((user.exp || 0) < expNeeded) {
    const maxPossible = Math.floor((user.exp || 0) / EXP_PER_BERRY);
    return m.reply(
      `❌ *¡EXP insuficiente!*\n\n` +
        `> Se necesita: *${expNeeded.toLocaleString("es-ES")} EXP*\n` +
        `> Tu EXP: *${(user.exp || 0).toLocaleString("es-ES")} EXP*\n\n` +
        `> Máximo: *${maxPossible.toLocaleString("es-ES")} Berry*`,
    );
  }

  // Use manual user update instead of updateBerry/updateExp to do batch update
  // But since logic was db.setUser, let's stick to update logic here
  const newExp = (user.exp || 0) - expNeeded;
  const newBerry = (user.berry || 0) + berryAmount;

  db.setUser(m.sender, {
    exp: newExp,
    berry: newBerry,
  });

  await m.react("💱");

  let txt = `💱 *¡Cambio Exitoso!*\n\n`;
  txt += `*📋 Detalle:*\n`;
  txt += `> 🚄 EXP: *-${expNeeded.toLocaleString("es-ES")}*\n`;
  txt += `> 💰 Berry: *+${berryAmount.toLocaleString("es-ES")}*\n\n`;
  txt += `*📊 Saldo Actual:*\n`;
  txt += `> 🚄 EXP: *${newExp.toLocaleString("es-ES")}*\n`;
  txt += `> 💰 Berry: *${newBerry.toLocaleString("es-ES")}*`;

  m.reply(txt);
}

export { pluginConfig as config, handler };
