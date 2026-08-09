import { getDatabase } from "../../src/lib/luffy-database.js";
import { sendRpgPreview } from "../../src/lib/luffy-context.js";

const pluginConfig = {
  name: "dice",
  alias: ["dadu", "roll"],
  category: "rpg",
  description: "Lempar dadu untuk gambling",
  usage: ".dice <1-6> <bet>",
  example: ".dice 6 5000",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 15,
  carne: 1,
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
      `🎲 *El Bandar de Dados Callejero* 🎲\n\n` +
        `¡Adivina el número que saldrá! (1-6)\n\n` +
        `*Cómo Jugar:*\n` +
        `👉 \`.dice <número> <apuesta>\`\n\n` +
        `*Ejemplo:*\n` +
        `👉 \`.dice 6 5000\``
    );
  }

  if (!bet || bet < 1000) {
    return m.reply(`¡No hay bandar que acepte una apuesta así! ¡Trae mínimo *Rp 1.000*! 🎲`);
  }

  if ((user.berry || 0) < bet) {
    return m.reply(`Te falta dinero jefe! Solo tienes *Rp ${(user.berry || 0).toLocaleString("id-ID")}* en el bolsillo. ¡No pidas prestado aquí! 😤`);
  }

  user.berry -= bet;

  await sendRpgPreview(sock, m.chat, `🎲 El bandar agita los dados en el tazón de madera... *krok krok krok*...`, "🎲 DADOS CALLEJEROS", "¡Lanzando!", { quoted: m });
  await new Promise((r) => setTimeout(r, 2500));

  const result = Math.floor(Math.random() * 6) + 1;
  const diceEmoji = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"][result - 1];

  const isWin = guess === result;

  let txt = `*¡EL TAZÓN SE ABRE!* 🎲💥\n\n`;
  txt += `Tu Elección: *${guess}*\n`;
  txt += `Cara del Dado: *${result}* ${diceEmoji}\n\n`;

  if (isWin) {
    const winnings = bet * 5;
    user.berry = (user.berry || 0) + winnings;
    txt += `🎉 *¡ERES TREMENDAMENTE SUERTUDO!*\n`;
    txt += `💰 Dinero x5: *+Rp ${winnings.toLocaleString("id-ID")}*`;
  } else {
    txt += `🤣 *¡JAJAJA TE EQUIVOCASTE!*\n`;
    txt += `💸 El bandar te quitó tu dinero: *-Rp ${bet.toLocaleString("id-ID")}*`;
  }

  db.save();
  await sendRpgPreview(sock, m.chat, txt, "🎲 RESULTADO DE DADOS", "¡Resultado!", { quoted: m });
}

export { pluginConfig as config, handler };
