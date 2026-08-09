import { getDatabase } from "../../src/lib/luffy-database.js";
const pluginConfig = {
  name: "leveluprpg",
  alias: ["lvluprpg", "rpglevelup"],
  category: "rpg",
  description: "Toggle notifikasi level up RPG",
  usage: ".leveluprpg <on/off>",
  example: ".leveluprpg on",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  carne: 0,
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
    return m.reply(`✅ *ʀᴘɢ ɴɪᴠᴇʟ ᴜᴘ ɴᴏᴛɪꜰ*\n\n` + `> Estado: *ON* ✅\n` + `> ¡Recibirás notificaciones RPG al subir de nivel!`);
  }

  if (sub === "off") {
    user.settings.rpgLevelupNotif = false;
    db.save();
    return m.reply(`❌ *ʀᴘɢ ɴɪᴠᴇʟ ᴜᴘ ɴᴏᴛɪꜰ*\n\n` + `> Estado: *OFF* ❌\n` + `> Notificación de subida de nivel RPG desactivada.`);
  }

  const status = user.settings.rpgLevelupNotif !== false ? "ON ✅" : "OFF ❌";
  return m.reply(
    `🔔 *ʀᴘɢ ɴɪᴠᴇʟ ᴜᴘ ɴᴏᴛɪꜰ*\n\n` +
      `> Estado actual: *${status}*\n\n` +
      `*📋 *ᴜsᴏ:*
\n` +
      `> > \`.leveluprpg on\` - Activar\n` +
      `> > \`.leveluprpg off\` - Desactivar\n` +
      ``,
  );
}

export { pluginConfig as config, handler };
