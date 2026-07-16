import { getDatabase } from "../../src/lib/ourin-database.js";
const pluginConfig = {
  name: "setwelcome",
  alias: ["customwelcome"],
  category: "group",
  description: "Set custom welcome message",
  usage: ".setwelcome <pesan>",
  example: ".setwelcome Hola {user}, bienvenido a {group}!",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  isAdmin: true,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const text = m.fullArgs?.trim() || m.args.join(" ");

  if (!text) {
    return m.reply(
      `📝 *sᴇᴛ ᴡᴇʟᴄᴏᴍᴇ*\n\n` +
        `╭┈┈⬡「 📋 *ᴘʟᴀᴄᴇʜᴏʟᴅᴇʀ* 」\n` +
        `┃ ◦ \`{user}\` - Nombre del miembro\n` +
        `┃ ◦ \`{number}\` - Número del miembro\n` +
        `┃ ◦ \`{group}\` - Nombre del grupo\n` +
        `┃ ◦ \`{desc}\` - Descripción del grupo\n` +
        `┃ ◦ \`{count}\` - Cantidad de miembros\n` +
        `┃ ◦ \`{owner}\` - Nombre del dueño del grupo\n` +
        `┃ ◦ \`{date}\` - Fecha (DD/MM/YYYY)\n` +
        `┃ ◦ \`{time}\` - Hora (HH:mm WIB)\n` +
        `┃ ◦ \`{day}\` - Día (Lunes, Martes, etc)\n` +
        `┃ ◦ \`{bot}\` - Nombre del bot\n` +
        `┃ ◦ \`{prefix}\` - Prefijo del bot\n` +
        `╰┈┈⬡\n\n` +
        `\`Ejemplo:\`\n` +
        `\`${m.prefix}setwelcome ¡Hola {user}! 👋\`\n` +
        `\`¡Bienvenido a {group} el {day}, {date}\``,
    );
  }

  db.setGroup(m.chat, { welcomeMsg: text, welcome: true });
  db.save();

  m.react("✅");

  await m.reply(
    `✅ ¡Welcome configurado como *${text}*!\n¿Quieres resetear? Escribe ${m.prefix}resetwelcome`,
  );
}

export { pluginConfig as config, handler };
