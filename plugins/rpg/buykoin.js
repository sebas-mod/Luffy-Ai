import { getDatabase } from "../../src/lib/ourin-database.js";
const pluginConfig = {
  name: "buybelly",
  alias: ["belibelly", "belicoin", "exptobelly", "exptocoin"],
  category: "rpg",
  description: "Canjear EXP por Belly",
  usage: ".buybelly <cantidad>",
  example: ".buybelly 10000",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

const EXP_PER_BELLY = 2;

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};

  const args = m.args || [];
  const amountStr = args[0];

  if (!amountStr) {
    let txt = `💱 *Buy Belly*\n\n`;
    txt += `> ¡Intercambia EXP por Belly!\n\n`;
    txt += `*📊 Tipo de Cambio:*\n`;
    txt += `> 💎 ${EXP_PER_BELLY} EXP = 1 Belly\n\n`;
    txt += `*📋 Saldo:*\n`;
    txt += `> 🚄 EXP: *${(user.exp || 0).toLocaleString("es-ES")}*\n`;
    txt += `> 💰 Belly: *${(user.belly || 0).toLocaleString("es-ES")}*\n\n`;
    txt += `> Ejemplo: \`.buybelly 10000\`\n`;
    txt += `> Se usarán ${10000 * EXP_PER_BELLY} EXP para 10.000 Belly`;

    return m.reply(txt);
  }

  let bellyAmount = 0;
  if (amountStr === "all" || amountStr === "max") {
    bellyAmount = Math.floor((user.exp || 0) / EXP_PER_BELLY);
  } else {
    bellyAmount = parseInt(amountStr);
  }

  if (!bellyAmount || bellyAmount <= 0) {
    return m.reply(`❌ ¡Ingresa una cantidad válida de belly!`);
  }

  const expNeeded = bellyAmount * EXP_PER_BELLY;

  if ((user.exp || 0) < expNeeded) {
    const maxPossible = Math.floor((user.exp || 0) / EXP_PER_BELLY);
    return m.reply(
      `❌ *¡EXP insuficiente!*\n\n` +
        `> Necesitas: *${expNeeded.toLocaleString("es-ES")} EXP*\n` +
        `> Tu EXP: *${(user.exp || 0).toLocaleString("es-ES")} EXP*\n\n` +
        `> Máximo: *${maxPossible.toLocaleString("es-ES")} Belly*`,
    );
  }

  // Use manual user update instead of updateBelly/updateExp to do batch update
  // But since logic was db.setUser, let's stick to update logic here
  const newExp = (user.exp || 0) - expNeeded;
  const newBelly = (user.belly || 0) + bellyAmount;

  db.setUser(m.sender, {
    exp: newExp,
    belly: newBelly,
  });

  await m.react("💱");

  let txt = `💱 *¡Intercambio Exitoso!*\n\n`;
  txt += `*📋 Detalle:*\n`;
  txt += `> 🚄 EXP: *-${expNeeded.toLocaleString("es-ES")}*\n`;
  txt += `> 💰 Belly: *+${bellyAmount.toLocaleString("es-ES")}*\n\n`;
  txt += `*📊 Saldo Actual:*\n`;
  txt += `> 🚄 EXP: *${newExp.toLocaleString("es-ES")}*\n`;
  txt += `> 💰 Belly: *${newBelly.toLocaleString("es-ES")}*`;

  m.reply(txt);
}

export { pluginConfig as config, handler };
