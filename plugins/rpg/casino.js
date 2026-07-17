import { getDatabase } from "../../src/lib/ourin-database.js";

const pluginConfig = {
  name: "casino",
  alias: ["judi", "gamble"],
  category: "rpg",
  description: "Jugar en el casino para apostar",
  usage: ".casino <cantidad>",
  example: ".casino 10000",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);
  const args = m.args || [];

  let bet = args[0];

  if (!bet) {
    let txt = `🎰 *LAS VEGAS MÓVIL* 🎰\n\n`;
    txt += `¡Bienvenido al Casino! ¿Quieres competir contra la casa?\n\n`;
    txt += `*Cómo Apostar:*\n`;
    txt += `👉 \`${m.prefix}casino <cantidad>\`\n\n`;
    txt += `Ejemplo:\n`;
    txt += `👉 \`${m.prefix}casino 10000\`\n`;
    txt += `👉 \`${m.prefix}casino all\` (¡Te vas a lo loco!)`;
    return m.reply(txt);
  }

  if (/^all$/i.test(bet)) {
    bet = user.belly || 0;
  } else {
    bet = parseInt(bet);
  }

  if (isNaN(bet) || bet < 1000) {
    return m.reply(`Vaya... ¿apostar con monedas? 💸\n¡La apuesta mínima aquí es *Belly 1.000*, tío!`);
  }

  if (bet > (user.belly || 0)) {
    return m.reply(`¡No pidas prestado, jefe! 😂\nSolo tienes *Belly ${(user.belly || 0).toLocaleString("es-ES")}* pero pretendes apostar *Belly ${bet.toLocaleString("es-ES")}*.\n¡Ve a trabajar primero!`);
  }

  await m.react("🎰");
  await m.reply(`🎲 El dealer mezcla los dados y gira la ruleta... ¡Respira hondo!`);
  await new Promise((r) => setTimeout(r, 2500));

  const playerScore = Math.floor(Math.random() * 100);
  const botScore = Math.floor(Math.random() * 100);

  let result, emoji, moneyChange, bandarTaunt;

  if (playerScore > botScore) {
    result = "¡GANASTE!";
    emoji = "🎉";
    moneyChange = bet;
    user.belly = (user.belly || 0) + bet;
    bandarTaunt = `"¡Cih! Solo tuviste suerte esta vez." - *Dealer* 😒`;
  } else if (playerScore < botScore) {
    result = "¡DERROTA ABSOLUTA!";
    emoji = "💸";
    moneyChange = -bet;
    user.belly = (user.belly || 0) - bet;
    bandarTaunt = `"¡JAJAJA! ¡Eras pobre y ahora más pobre! ¡Lárgate!" - *Dealer* 😈`;
  } else {
    result = "¡EMPATE!";
    emoji = "🤝";
    moneyChange = 0;
    bandarTaunt = `"Hoo... ¿Empate? No está mal tu valentía." - *Dealer* 👀`;
  }

  db.save();

  await m.react(emoji);

  let txt = `🎰 *¡¡MESA DEL CASINO CERRADA!!* 🎰\n\n`;
  txt += `*Marcador:*\n`;
  txt += `👤 Tus Puntos: *${playerScore}*\n`;
  txt += `🤖 Puntos del Dealer: *${botScore}*\n\n`;
  txt += `*Resultado: ${emoji} ${result}*\n`;
  if (moneyChange !== 0) {
    txt += `Dinero del Dealer: *${moneyChange > 0 ? "+" : ""}Belly ${moneyChange.toLocaleString("es-ES")}*\n\n`;
  } else {
    txt += `Dinero devuelto (recuperas tu apuesta)\n\n`;
  }
  txt += `${bandarTaunt}\n\n`;
  txt += `*Tu Saldo:* Belly ${(user.belly || 0).toLocaleString("es-ES")}`;

  m.reply(txt);
}

export { pluginConfig as config, handler };
