import { getDatabase } from "../../src/lib/ourin-database.js";
const pluginConfig = {
  name: "leveluprpg",
  alias: ["lvluprpg", "rpglevelup"],
  category: "rpg",
  description: "Activar/desactivar notificación de subida de nivel RPG",
  usage: ".leveluprpg <on/off>",
  example: ".leveluprpg on",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);
  const args = m.args || [];
  const sub = args[0]?.toLowerCase();

  if (!user.settings) user.settings = {};

  if (sub === "on") {
    user.settings.rpgLevelupNotif = true;
    db.save();
    return m.reply(`✅ *ʀᴘɢ ʟᴇᴠᴇʟ ᴜᴘ ɴᴏᴛɪꜰ*\n\n` + `> Estado: *ON* ✅\n` + `> ¡Recibirás notificaciones de subida de nivel RPG!`);
  }

  if (sub === "off") {
    user.settings.rpgLevelupNotif = false;
    db.save();
    return m.reply(`❌ *ʀᴘɢ ʟᴇᴠᴇʟ ᴜᴘ ɴᴏᴛɪꜰ*\n\n` + `> Estado: *OFF* ❌\n` + `> Notificación de nivel RPG desactivada.`);
  }

  const status = user.settings.rpgLevelupNotif !== false ? "ON ✅" : "OFF ❌";
  return m.reply(
    `🔔 *ʀᴘɢ ʟᴇᴠᴇʟ ᴜᴘ ɴᴏᴛɪꜰ*\n\n` +
      `> Estado actual: *${status}*\n\n` +
      `*📋 *ᴜsᴀɢᴇ:*
\n` +
      `> > \`.leveluprpg on\` - Activar\n` +
      `> > \`.leveluprpg off\` - Desactivar\n` +
      ``,
  );
}

export { pluginConfig as config, handler };
