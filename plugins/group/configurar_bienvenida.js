import { getDatabase } from "../../src/lib/luffy-database.js";
const pluginConfig = {
  name: "configurar_bienvenida",
  alias: ["customwelcome"],
  category: "group",
  description: "Configurar un mensaje de bienvenida personalizado",
  usage: ".setwelcome <mensaje>",
  example: ".setwelcome Hola {user}, bienvenido a {group}!",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  isAdmin: true,
  cooldown: 5,
  carne: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const text = m.fullArgs?.trim() || m.args.join(" ");

  if (!text) {
    return m.reply(
      `📝 *ᴄᴏɴꜰɪɢᴜʀᴀʀ ʙɪᴇɴᴠᴇɴɪᴅᴀ*\n\n` +
        `╭┈┈⬡「 📋 *ᴘʟᴀᴄᴇʜᴏʟᴅᴇʀs* 」\n` +
        `┃ ◦ \`{user}\` - Nombre del miembro\n` +
        `┃ ◦ \`{number}\` - Número del miembro\n` +
        `┃ ◦ \`{group}\` - Nombre del grupo\n` +
        `┃ ◦ \`{desc}\` - Descripción del grupo\n` +
        `┃ ◦ \`{count}\` - Cantidad de miembros\n` +
        `┃ ◦ \`{owner}\` - Nombre del owner del grupo\n` +
        `┃ ◦ \`{date}\` - Fecha (DD/MM/AAAA)\n` +
        `┃ ◦ \`{time}\` - Hora (HH:mm hora local)\n` +
        `┃ ◦ \`{day}\` - Día (Lunes, Martes, etc)\n` +
        `┃ ◦ \`{bot}\` - Nombre del bot\n` +
        `┃ ◦ \`{prefix}\` - Prefijo del bot\n` +
        `╰┈┈⬡\n\n` +
        `\`Ejemplo:\`\n` +
        `\`${m.prefix}configurar_bienvenida Hola {user}! 👋\`\n` +
        `\`Bienvenido a {group} el {day}, {date}\``,
    );
  }

  db.setGroup(m.chat, { welcomeMsg: text, welcome: true });
  db.save();

  m.react("✅");

  await m.reply(
    `✅ Bienvenida configurada correctamente como *${text}*\n¿Quieres restablecerla? Escribe ${m.prefix}resetear_bienvenida`,
  );
}

export { pluginConfig as config, handler };
