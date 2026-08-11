import { getDatabase } from "../../src/lib/luffy-database.js";
import { sendRpgPreview } from "../../src/lib/luffy-context.js";

const pluginConfig = {
  name: "coinflip",
  alias: ["cf", "flip", "toss"],
  category: "rpg",
  description: "Lanza la moneda y apuesta (cara o cruz)",
  usage: ".coinflip <heads/tails> <bet>",
  example: ".coinflip heads 5000",
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
  const choice = args[0]?.toLowerCase();
  const bet = parseInt(args[1]);

  if (!choice || (choice !== "heads" && choice !== "tails" && choice !== "h" && choice !== "t")) {
    return m.reply(
      `🪙 *Adivina la Moneda del Bandar* 🪙\n\n` +
        `¡Elige Cara (Heads) o Cruz (Tails)!\n\n` +
        `*Cómo Jugar:*\n` +
        `👉 \`.coinflip heads <apuesta>\`\n` +
        `👉 \`.coinflip tails <apuesta>\``
    );
  }

  if (!bet || bet < 1000) {
    return m.reply(`¡Apuesta de centavos rechazada! ¡Mínimo *Rp 1.000* jefe! 🪙`);
  }

  if ((user.berry || 0) < bet) {
    return m.reply(`¿Dónde están tus berry? Solo te quedan *Rp ${(user.berry || 0).toLocaleString("id-ID")}* en el bolsillo, ¿y quieres apostar *Rp ${bet.toLocaleString("id-ID")}*! 😜`);
  }

  user.berry -= bet;

  const userChoice = choice === "heads" || choice === "h" ? "heads" : "tails";
  const result = Math.random() < 0.5 ? "heads" : "tails";
  const emoji = result === "heads" ? "🦅" : "🪙";

  await sendRpgPreview(sock, m.chat, `*¡CLING!* La moneda de oro se lanza alto al aire... girando y girando... 🪙✨`, "🪙 VOLADO DE MONEDA", "¡Lanzando!", { quoted: m });
  await new Promise((r) => setTimeout(r, 2500));

  const isWin = userChoice === result;

  let txt = `*¡PLAK!* El bandar cubre la moneda con su mano! 👋\n\n`;
  txt += `Tu Elección: *${userChoice.toUpperCase()}*\n`;
  txt += `La Moneda Muestra: *${result.toUpperCase()}* ${emoji}\n\n`;

  if (isWin) {
    const winnings = bet * 2;
    user.berry = (user.berry || 0) + winnings;
    txt += `🎉 *¡EXCELENTE! ¡ACERTASTE!*\n`;
    txt += `💰 Ganancias: *+Rp ${winnings.toLocaleString("id-ID")}*`;
  } else {
    txt += `🤣 *¡JAJAJA! ¡TE EQUIVOCASTE!*\n`;
    txt += `💸 El bandar te quitó los berry: *-Rp ${bet.toLocaleString("id-ID")}*`;
  }

  db.save();
  await sendRpgPreview(sock, m.chat, txt, "🪙 VOLADO DE MONEDA", "¡Resultado!", {
    quoted: m,
  });
}

export { pluginConfig as config, handler };
