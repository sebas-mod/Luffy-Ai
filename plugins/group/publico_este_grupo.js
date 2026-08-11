import { getDatabase } from "../../src/lib/luffy-database.js";
import te from "../../src/lib/luffy-error.js";
import config from "../../config.js";

const pluginConfig = {
  name: "publico_este_grupo",
  alias: ["publicgc", "publicgroup", "publicthisgroup"],
  category: "group",
  description: "Activar el modo público solo en este grupo",
  usage: ".publicthisgc",
  example: ".publicthisgc",
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
  const isPublicGroup = publicGroups.includes(m.chat);

  if (isPublicGroup && !isSelfGroup) {
    return m.reply(
      `ℹ️ *ᴇsᴛᴇ ɢʀᴜᴘᴏ ʏᴀ ᴇsᴛá ᴇɴ ᴍᴏᴅᴏ ᴘúʙʟɪᴄᴏ*\n\n` +
        `> El bot responde a todos los miembros de este grupo\n\n` +
        `_Usa ${m.prefix}privado_este_grupo para cerrar el acceso_`,
    );
  }

  const updatedSelf = selfGroups.filter((id) => id !== m.chat);
  db.setting("selfGroups", updatedSelf);

  if (!publicGroups.includes(m.chat)) {
    db.setting("publicGroups", [...publicGroups, m.chat]);
  }

  m.react("🌐");
  return m.reply(
    `🌐 *ᴍᴏᴅᴏ ᴘúʙʟɪᴄᴏ ᴀᴄᴛɪᴠᴀᴅᴏ*\n\n` +
      `> El bot ahora responde a todos los miembros de este grupo\n` +
      `> Override del modo global activado para este grupo\n\n` +
      `📋 *Los demás grupos no se ven afectados*\n\n` +
      `_Usa ${m.prefix}privado_este_grupo para cerrar el acceso de nuevo_`,
  );
}

export { pluginConfig as config, handler };
