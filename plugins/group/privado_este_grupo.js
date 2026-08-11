import { getDatabase } from "../../src/lib/luffy-database.js";
import te from "../../src/lib/luffy-error.js";
import config from "../../config.js";

const pluginConfig = {
  name: "privado_este_grupo",
  alias: ["selfgc", "selfgroup", "selfthisgroup"],
  category: "group",
  description: "Activar el modo self solo en este grupo",
  usage: ".selfthisgc",
  example: ".selfthisgc",
  isOwner: true,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 3,
  carne: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const selfGroups = db.setting("selfGroups") || [];
  const publicGroups = db.setting("publicGroups") || [];

  const isSelfGroup = selfGroups.includes(m.chat);

  if (isSelfGroup) {
    return m.reply(
      `ℹ️ *ᴇsᴛᴇ ɢʀᴜᴘᴏ ʏᴀ ᴇsᴛá ᴇɴ ᴍᴏᴅᴏ sᴇʟꜰ*\n\n` +
        `> El bot solo responde al owner y al propio bot\n\n` +
        `_Usa ${m.prefix}publico_este_grupo para abrir el acceso_`,
    );
  }

  if (!selfGroups.includes(m.chat)) {
    db.setting("selfGroups", [...selfGroups, m.chat]);
  }

  const updatedPublic = publicGroups.filter((id) => id !== m.chat);
  db.setting("publicGroups", updatedPublic);

  m.react("🔒");
  return m.reply(
    `🔒 *ᴍᴏᴅᴏ sᴇʟꜰ ᴀᴄᴛɪᴠᴏ*\n\n` +
      `> El bot en este grupo ahora solo responde a:\n` +
      `> • El owner del bot\n` +
      `> • El propio bot (fromMe)\n\n` +
      `📋 *Los demás grupos no se ven afectados*\n\n` +
      `_Usa ${m.prefix}publico_este_grupo para abrir el acceso_`,
  );
}

export { pluginConfig as config, handler };
