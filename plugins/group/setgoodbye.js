import { getDatabase } from "../../src/lib/ourin-database.js";
const pluginConfig = {
  name: "setgoodbye",
  alias: ["customgoodbye"],
  category: "group",
  description: "Set custom goodbye message",
  usage: ".setgoodbye <pesan>",
  example: ".setgoodbye Bye {user}, sampai jumpa lagi!",
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
  const text = m.text || m.args.join(" ");

  if (!text) {
    return m.reply(
      `📝 *sᴇᴛ ɢᴏᴏᴅʙʏᴇ*\n\n` +
        `╭┈┈⬡「 📋 *ᴘʟᴀᴄᴇʜᴏʟᴅᴇʀ* 」\n` +
        `┃ ◦ \`{user}\` - Nombre del miembro\n` +
        `┃ ◦ \`{number}\` - Número del miembro\n` +
        `┃ ◦ \`{group}\` - Nombre del grupo\n` +
        `┃ ◦ \`{desc}\` - Descripción del grupo\n` +
        `┃ ◦ \`{count}\` - Miembros restantes\n` +
        `┃ ◦ \`{owner}\` - Nombre del dueño del grupo\n` +
        `┃ ◦ \`{date}\` - Fecha (DD/MM/YYYY)\n` +
        `┃ ◦ \`{time}\` - Hora (HH:mm WIB)\n` +
        `┃ ◦ \`{day}\` - Día (Lunes, Martes, etc)\n` +
        `┃ ◦ \`{bot}\` - Nombre del bot\n` +
        `┃ ◦ \`{prefix}\` - Prefijo del bot\n` +
        `╰┈┈⬡\n\n` +
        `\`Ejemplo:\`\n` +
        `\`${m.prefix}setgoodbye Bye {user}! 👋\`\n` +
        `\`Hasta luego el {day}, {date}\``,
    );
  }

  db.setGroup(m.chat, { goodbyeMsg: text, goodbye: true, leave: true });
  db.save();

  m.react("✅");

  await m.reply(
    `✅ ¡Goodbye configurado como *${text}*!\n¿Quieres resetear? Escribe ${m.prefix}resetgoodbye`,
  );
}

export { pluginConfig as config, handler };
