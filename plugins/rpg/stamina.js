import { getDatabase } from "../../src/lib/luffy-database.js";
import { sendRpgPreview } from "../../src/lib/luffy-context.js";
const pluginConfig = {
  name: "stamina",
  alias: ["energy", "cekstamina"],
  category: "rpg",
  description: "Cek dan pulihkan stamina",
  usage: ".stamina / .stamina isi",
  example: ".stamina",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  carne: 0,
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
      return m.reply(`⚡ *ʀᴇꜱɪꜱᴛᴇɴᴄɪᴀ ʟʟᴇɴᴀ*\n\n> ¡Tu resistencia ya está llena!`);
    }

    if ((user.berry || 0) < potionCost) {
      return m.reply(`❌ *ꜱᴀʟᴅᴏ ɪɴꜱᴜꜰɪᴄɪᴇɴᴛᴇ*\n\n` + `> Costo: Rp ${potionCost.toLocaleString("id-ID")}\n` + `> Saldo: Rp ${(user.berry || 0).toLocaleString("id-ID")}`);
    }

    user.berry -= potionCost;
    const restored = user.rpg.maxStamina - user.rpg.stamina;
    user.rpg.stamina = user.rpg.maxStamina;

    db.save();

    await m.react("⚡");
    return sendRpgPreview(
      sock,
      m.chat,
      `⚡ *ʀᴇꜱɪꜱᴛᴇɴᴄɪᴀ ʀᴇꜱᴛᴀᴜʀᴀᴅᴀ*\n\n` +
        `*💊 *ʀᴇꜱᴛᴀᴜʀᴀʀ:*
\n` +
        `> ⚡ Resistencia: *+${restored}*\n` +
        `> 💵 Costo: *-Rp ${potionCost.toLocaleString("id-ID")}*\n` +
        `> 📊 Ahora: *${user.rpg.stamina}/${user.rpg.maxStamina}*\n` +
        ``,
      "⚡ RESISTENCIA",
      "Restaurar",
      { quoted: m },
    );
  }

  const staminaBar = createStaminaBar(user.rpg.stamina, user.rpg.maxStamina);

  let txt = `⚡ *ᴇꜱᴛᴀᴅᴏ ᴅᴇ ʀᴇꜱɪꜱᴛᴇɴᴄɪᴀ*\n\n`;
  txt += `*📊 *ɪɴꜰᴏ:*
\n`;
  txt += `> ⚡ Resistencia: *${user.rpg.stamina}/${user.rpg.maxStamina}*\n`;
  txt += `> 📊 [${staminaBar}]\n`;
  txt += `\n\n`;
  txt += `> Llenar resistencia: \`${m.prefix}stamina isi\` (Rp 5.000)\n`;
  txt += `> La resistencia se recupera sola cada hora`;

  await sendRpgPreview(sock, m.chat, txt, "⚡ RESISTENCIA", "Estado", {
    quoted: m,
  });
}

export { pluginConfig as config, handler };
