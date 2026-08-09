import { getDatabase } from "../../src/lib/luffy-database.js";

const pluginConfig = {
  name: "casino",
  alias: ["judi", "gamble"],
  category: "rpg",
  description: "Bermain casino untuk judi",
  usage: ".casino <jumlah>",
  example: ".casino 10000",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  carne: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);
  const args = m.args || [];

  let bet = args[0];

  if (!bet) {
    let txt = `🎰 *LAS VEGAS AMBULANTE* 🎰\n\n`;
    txt += `¡Bienvenido al Casino! ¿Quieres probar tu suerte contra el bandar?\n\n`;
    txt += `*Cómo Apostar:*\n`;
    txt += `👉 \`${m.prefix}casino <cantidad>\`\n\n`;
    txt += `Ejemplos:\n`;
    txt += `👉 \`${m.prefix}casino 10000\`\n`;
    txt += `👉 \`${m.prefix}casino all\` (¡Qué atrevido!)`;
    return m.reply(txt);
  }

  if (/^all$/i.test(bet)) {
    bet = user.berry || 0;
  } else {
    bet = parseInt(bet);
  }

  if (isNaN(bet) || bet < 1000) {
    return m.reply(`Vaya... ¿a jugar con monedas de a centavo? 💸\nLa apuesta mínima aquí es *Rp 1.000* bro!`);
  }

  if (bet > (user.berry || 0)) {
    return m.reply(`¡No pidas prestado jefe! 😂\nSolo tienes *Rp ${(user.berry || 0).toLocaleString("id-ID")}* pero apuestas *Rp ${bet.toLocaleString("id-ID")}*.\n¡Ve a trabajar primero!`);
  }

  await m.react("🎰");
  await m.reply(`🎲 El bandar lanza los dados y hace girar la ruleta... ¡Aguanta la respiración!`);
  await new Promise((r) => setTimeout(r, 2500));

  const playerScore = Math.floor(Math.random() * 100);
  const botScore = Math.floor(Math.random() * 100);

  let result, emoji, moneyChange, bandarTaunt;

  if (playerScore > botScore) {
    result = "¡GANASTE!";
    emoji = "🎉";
    moneyChange = bet;
    user.berry = (user.berry || 0) + bet;
    bandarTaunt = `"¡Bah! Pura suerte de principiante esta vez." - *Bandar* 😒`;
  } else if (playerScore < botScore) {
    result = "¡PERDISTE EN SECO!";
    emoji = "💸";
    moneyChange = -bet;
    user.berry = (user.berry || 0) - bet;
    bandarTaunt = `"¡JAJAJA! Ya eras pobre y ahora más pobre. ¡Vete a casa!" - *Bandar* 😈`;
  } else {
    result = "¡EMPATE!";
    emoji = "🤝";
    moneyChange = 0;
    bandarTaunt = `"Ho... ¿Empate? No tienes nada mal, tienes agallas." - *Bandar* 👀`;
  }

  db.save();

  await m.react(emoji);

  let txt = `🎰 *¡MESA DE CASINO CERRADA!* 🎰\n\n`;
  txt += `*Marcador:*\n`;
  txt += `👤 Tus Puntos: *${playerScore}*\n`;
  txt += `🤖 Puntos del Bandar: *${botScore}*\n\n`;
  txt += `*Resultado: ${emoji} ${result}*\n`;
  if (moneyChange !== 0) {
    txt += `Dinero en Juego: *${moneyChange > 0 ? "+" : ""}Rp ${moneyChange.toLocaleString("id-ID")}*\n\n`;
  } else {
    txt += `Dinero Devuelto (Recuperas tu apuesta)\n\n`;
  }
  txt += `${bandarTaunt}\n\n`;
  txt += `*Tu Saldo Restante:* Rp ${(user.berry || 0).toLocaleString("id-ID")}`;

  m.reply(txt);
}

export { pluginConfig as config, handler };
