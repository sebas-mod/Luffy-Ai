import { getDatabase } from "../../src/lib/luffy-database.js";
import { sendRpgPreview } from "../../src/lib/luffy-context.js";

const pluginConfig = {
  name: "slot",
  alias: ["slots", "mesin"],
  category: "rpg",
  description: "Jugar a la máquina tragamonedas",
  usage: ".slot <bet>",
  example: ".slot 5000",
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
  let bet = parseInt(args[0]);

  if (!bet || bet < 1000) {
    return m.reply(`La apuesta mínima para jalar la palanca de esta máquina es *Rp 1.000* bro! 🎰\nEjemplo: \`.slot 5000\``);
  }

  if ((user.berry || 0) < bet) {
    return m.reply(`¡Tus berry están secos! 💸\nTu dinero: *Rp ${(user.berry || 0).toLocaleString("id-ID")}*\nNecesitas: *Rp ${bet.toLocaleString("id-ID")}*`);
  }

  user.berry -= bet;

  const symbols = ["🍒", "🍋", "🍊", "🍇", "💎", "7️⃣"];
  const weights = [30, 25, 20, 15, 7, 3];

  function spin() {
    const rand = Math.random() * 100;
    let cumulative = 0;
    for (let i = 0; i < symbols.length; i++) {
      cumulative += weights[i];
      if (rand <= cumulative) return symbols[i];
    }
    return symbols[0];
  }

  const result = [spin(), spin(), spin()];

  await sendRpgPreview(sock, m.chat, `🎰 *TREK TREK TREK...* Palanca jalada! La máquina tragamonedas gira rápido...`, "🎰 MÁQUINA TRAGAMONEDAS", "¡Girar!", {
    quoted: m,
  });
  await new Promise((r) => setTimeout(r, 2500));

  let multiplier = 0;
  let winText = "";

  if (result[0] === result[1] && result[1] === result[2]) {
    if (result[0] === "7️⃣") {
      multiplier = 10;
      winText = "¡¡LOCURA!! ¡¡JACKPOT 777!! 🎉💸 (x10)";
    } else if (result[0] === "💎") {
      multiplier = 5;
      winText = "¡GENIAL! ¡SUPER DIAMANTE!! 💎✨ (x5)";
    } else {
      multiplier = 3;
      winText = "¡VAMOS! ¡TRIPLE COMBO!! 🍒🎰 (x3)";
    }
  } else if (result[0] === result[1] || result[1] === result[2] || result[0] === result[2]) {
    multiplier = 1.5;
    winText = "¡NADA MAL! ¡DOBLE!! 👍 (x1.5)";
  }

  const winnings = Math.floor(bet * multiplier);
  user.berry = (user.berry || 0) + winnings;

  let txt = `🎰 *RESULTADO DE LA TRAGAMONEDAS* 🎰\n\n`;
  txt += `[ ${result[0]} | ${result[1]} | ${result[2]} ]\n\n`;

  if (multiplier > 0) {
    txt += `${winText}\n`;
    txt += `💰 Dinero Ganado: *+Rp ${winnings.toLocaleString("id-ID")}*\n`;
  } else {
    txt += `¡ZONK!! ¡Tu dinero fue tragado por la máquina! 😭💸\n`;
    txt += `💸 Dinero Perdido: *-Rp ${bet.toLocaleString("id-ID")}*\n`;
  }

  db.save();
  await sendRpgPreview(sock, m.chat, txt, "🎰 RESULTADO", "Listo", { quoted: m });
}

export { pluginConfig as config, handler };
