import { getDatabase } from "../../src/lib/ourin-database.js";
import { sendRpgPreview } from "../../src/lib/ourin-context.js";
const pluginConfig = {
  name: "stamina",
  alias: ["energy", "cekstamina"],
  category: "rpg",
  description: "Verificar y recuperar stamina",
  usage: ".stamina / .stamina llenar",
  example: ".stamina",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

function createStaminaBar(current, max) {
  const filled = Math.round((current / max) * 10);
  const empty = 10 - filled;
  return "█".repeat(filled) + "░".repeat(empty);
}

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);
  const args = m.args || [];

  if (!user.rpg) user.rpg = {};
  user.rpg.stamina = user.rpg.stamina ?? 100;
  user.rpg.maxStamina = user.rpg.maxStamina || 100;

  const subCmd = args[0]?.toLowerCase();

  if (subCmd === "isi" || subCmd === "restore" || subCmd === "heal") {
    const potionCost = 5000;

    if (user.rpg.stamina >= user.rpg.maxStamina) {
      return m.reply(`⚡ *ESTAMINA LLENA*\n\n> ¡Tu estamina ya está llena!`);
    }

    if ((user.belly || 0) < potionCost) {
      return m.reply(`❌ *SALDO INSUFICIENTE*\n\n` + `> Costo: Belly ${potionCost.toLocaleString("es-ES")}\n` + `> Saldo: Belly ${(user.belly || 0).toLocaleString("es-ES")}`);
    }

    user.belly -= potionCost;
    const restored = user.rpg.maxStamina - user.rpg.stamina;
    user.rpg.stamina = user.rpg.maxStamina;

    db.save();

    await m.react("⚡");
    return sendRpgPreview(
      sock,
      m.chat,
      `⚡ *ESTAMINA RESTAURADA*\n\n` +
        `*💊 *RESTAURAR:*
\n` +
        `> ⚡ Stamina: *+${restored}*\n` +
        `> 💵 Costo: *-Belly ${potionCost.toLocaleString("es-ES")}*\n` +
        `> 📊 Actualmente: *${user.rpg.stamina}/${user.rpg.maxStamina}*\n` +
        ``,
      "⚡ STAMINA",
      "Restore",
      { quoted: m },
    );
  }

  const staminaBar = createStaminaBar(user.rpg.stamina, user.rpg.maxStamina);

  let txt = `⚡ *ESTADO DE ESTAMINA*\n\n`;
  txt += `*📊 *INFO:*
\n`;
  txt += `> ⚡ Stamina: *${user.rpg.stamina}/${user.rpg.maxStamina}*\n`;
  txt += `> 📊 [${staminaBar}]\n`;
  txt += `\n\n`;
  txt += `> Restaurar estamina: \`${m.prefix}stamina restore\` (Belly 5.000)\n`;
  txt += `> La estamina se restaura automáticamente cada hora`;

  await sendRpgPreview(sock, m.chat, txt, "⚡ STAMINA", "Estado", {
    quoted: m,
  });
}

export { pluginConfig as config, handler };
