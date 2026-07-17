import { getDatabase } from "../../src/lib/ourin-database.js";
import { sendRpgPreview } from "../../src/lib/ourin-context.js";

const pluginConfig = {
  name: "coinflip",
  alias: ["cf", "flip", "toss"],
  category: "rpg",
  description: "Lanzar una moneda para apostar",
  usage: ".coinflip <heads/tails> <bet>",
  example: ".coinflip heads 5000",
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
  const choice = args[0]?.toLowerCase();
  const bet = parseInt(args[1]);

  if (!choice || (choice !== "heads" && choice !== "tails" && choice !== "h" && choice !== "t")) {
    return m.reply(
      `🪙 *Adivina la Moneda* 🪙\n\n` +
        `¡Elige Garuda (Cara) o Cruz! 🦅\n\n` +
        `*Cómo Jugar:*\n` +
        `👉 \`.coinflip heads <apuesta>\`\n` +
        `👉 \`.coinflip tails <apuesta>\``
    );
  }

  if (!bet || bet < 1000) {
    return m.reply(`¡Apuestas de mentira no cuentan! Mínimo *Belly 1.000*, jefe! 🪙`);
  }

  if ((user.belly || 0) < bet) {
    return m.reply(`¿Dónde están tus monedas? Solo tienes *Belly ${(user.belly || 0).toLocaleString("es-ES")}* en el bolsillo, ¡y quieres apostar *Belly ${bet.toLocaleString("es-ES")}*! 😜`);
  }

  user.belly -= bet;

  const userChoice = choice === "heads" || choice === "h" ? "heads" : "tails";
  const result = Math.random() < 0.5 ? "heads" : "tails";
  const emoji = result === "heads" ? "🦅" : "🪙";

  await sendRpgPreview(sock, m.chat, `*¡CLING!* La moneda de oro se lanza alto al aire... girando... 🪙✨`, "🪙 COINFLIP", "¡Lanzando!", { quoted: m });
  await new Promise((r) => setTimeout(r, 2500));

  const isWin = userChoice === result;

  let txt = `*¡CLAC!* ¡El dealer cubre la moneda con su mano! 👋\n\n`;
  txt += `Tu apuesta: *${userChoice.toUpperCase()}*\n`;
  txt += `La moneda muestra: *${result.toUpperCase()}* ${emoji}\n\n`;

  if (isWin) {
    const winnings = bet * 2;
    user.belly = (user.belly || 0) + winnings;
    txt += `🎉 ¡¡GENIAL! ¡¡ACERTASTE!!\n`;
    txt += `💰 Ganancia: *+Belly ${winnings.toLocaleString("es-ES")}*`;
  } else {
    txt += `🤣 ¡¡JA JA JA! ¡¡TE EQUIVOCASTE!!\n`;
    txt += `💸 El dealer se lleva tus monedas: *-Belly ${bet.toLocaleString("es-ES")}*`;
  }

  db.save();
  await sendRpgPreview(sock, m.chat, txt, "🪙 COINFLIP", "Result!", {
    quoted: m,
  });
}

export { pluginConfig as config, handler };
