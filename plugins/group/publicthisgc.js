import { getDatabase } from "../../src/lib/ourin-database.js";
import te from "../../src/lib/ourin-error.js";
import config from "../../config.js";

const pluginConfig = {
  name: "publicthisgc",
  alias: ["publicgc", "publicgroup", "publicthisgroup"],
  category: "group",
  description: "Activar modo público solo en este grupo",
  usage: ".publicthisgc",
  example: ".publicthisgc",
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
  const isPublicGroup = publicGroups.includes(m.chat);

  if (isPublicGroup && !isSelfGroup) {
    return m.reply(
      `ℹ️ *ᴇsᴛᴇ ɢʀᴜᴘᴏ ʏᴀ ᴇsᴛᴀ ᴇɴ ᴍᴏᴅᴏ ᴘÚʙʟɪᴄᴏ*\n\n` +
        `> El bot responde a todos los miembros de este grupo\n\n` +
        `_Usa ${m.prefix}selfthisgc para cerrar el acceso_`,
    );
  }

  const updatedSelf = selfGroups.filter((id) => id !== m.chat);
  db.setting("selfGroups", updatedSelf);

  if (!publicGroups.includes(m.chat)) {
    db.setting("publicGroups", [...publicGroups, m.chat]);
  }

  m.react("🌐");
  return m.reply(
    `🌐 *ᴍᴏᴅᴏ ᴘÚʙʟɪᴄᴏ ᴀᴄᴛɪᴠᴀᴅᴏ*\n\n` +
      `> El bot ahora responde a todos los miembros de este grupo\n` +
      `> El modo global es sobrescrito para este grupo\n\n` +
      `📋 *Los demás grupos no son afectados*\n\n` +
      `_Usa ${m.prefix}selfthisgc para cerrar el acceso de nuevo_\n\n` +
      `_¡Shishishi! ¡Ahora todos pueden hablar con Luffy!_`,
  );
}

export { pluginConfig as config, handler };
