import { getDatabase } from "../../src/lib/ourin-database.js";
import { sendRpgPreview } from "../../src/lib/ourin-context.js";

const pluginConfig = {
  name: "dice",
  alias: ["dadu", "roll"],
  category: "rpg",
  description: "Lanzar dado para apostar",
  usage: ".dice <1-6> <bet>",
  example: ".dice 6 5000",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 15,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  const args = m.args || [];
  const guess = parseInt(args[0]);
  const bet = parseInt(args[1]);

  if (!guess || guess < 1 || guess > 6) {
    return m.reply(
        `🎲 *Dealer de Dados Callejero* 🎲\n\n` +
        `¡Adivina qué número saldrá! (1-6)\n\n` +
        `*Cómo Jugar:*\n` +
        `👉 \`.dice <número> <apuesta>\`\n\n` +
        `*Ejemplo:*\n` +
        `👉 \`.dice 6 5000\``
    );
  }

  if (!bet || bet < 1000) {
    return m.reply(`¡Ningún dealer acepta esa apuesta! ¡Trae mínimo *Belly 1.000*! 🎲`);
  }

  if ((user.belly || 0) < bet) {
    return m.reply(`¡Te falta dinero, jefe! Solo tienes *Belly ${(user.belly || 0).toLocaleString("es-ES")}* en el bolsillo. ¡No pidas prestado aquí! 😤`);
  }

  user.belly -= bet;

  await sendRpgPreview(sock, m.chat, `🎲 El dealer mezcla los dados en el tazón de madera... *krok krok krok*...`, "🎲 DADOS CALLEJEROS", "¡Rodando!", { quoted: m });
  await new Promise((r) => setTimeout(r, 2500));

  const result = Math.floor(Math.random() * 6) + 1;
  const diceEmoji = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"][result - 1];

  const isWin = guess === result;

  let txt = `*¡¡TAZÓN ABIERTO!!* 🎲💥\n\n`;
  txt += `Tu apuesta: *${guess}*\n`;
  txt += `Cara del dado: *${result}* ${diceEmoji}\n\n`;

  if (isWin) {
    const winnings = bet * 5;
    user.belly = (user.belly || 0) + winnings;
    txt += `🎉 *¡¡INCREÍBLE, TUVISTE MUCHA SUERTE!!*\n`;
    txt += `💰 Dinero multiplicado x5: *+Belly ${winnings.toLocaleString("es-ES")}*`;
  } else {
    txt += `🤣 *¡JAJAJA TE EQUIVOCASTES!*\n`;
    txt += `💸 Dinero confiscado: *-Belly ${bet.toLocaleString("es-ES")}*`;
  }

  db.save();
  await sendRpgPreview(sock, m.chat, txt, "🎲 RESULTADO DEL DADO", "¡Resultado!", { quoted: m });
}

export { pluginConfig as config, handler };
