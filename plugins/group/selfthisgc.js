import { getDatabase } from "../../src/lib/ourin-database.js";
import te from "../../src/lib/ourin-error.js";
import config from "../../config.js";

const pluginConfig = {
  name: "selfthisgc",
  alias: ["selfgc", "selfgroup", "selfthisgroup"],
  category: "group",
  description: "Activar modo self solo en este grupo",
  usage: ".selfthisgc",
  example: ".selfthisgc",
  isOwner: true,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const selfGroups = db.setting("selfGroups") || [];
  const publicGroups = db.setting("publicGroups") || [];

  const isSelfGroup = selfGroups.includes(m.chat);

  if (isSelfGroup) {
    return m.reply(
      `ℹ️ *ᴇsᴛᴇ ɢʀᴜᴘᴏ ʏᴀ ᴇsᴛᴀ ᴇɴ ᴍᴏᴅᴏ sᴇʟꜰ*\n\n` +
        `> El bot solo responde al owner y al bot mismo\n\n` +
        `_Usa ${m.prefix}publicthisgc para abrir el acceso_`,
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
      `> • Owner del bot\n` +
      `> • El bot mismo (fromMe)\n\n` +
      `📋 *Los demás grupos no son afectados*\n\n` +
      `_Usa ${m.prefix}publicthisgc para abrir el acceso_\n\n` +
      `_¡Shishishi! ¡Un capitán tiene su privacidad!_`,
  );
}

export { pluginConfig as config, handler };
