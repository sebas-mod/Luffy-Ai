import { getDatabase } from "../../src/lib/luffy-database.js";
const pluginConfig = {
  name: "setgoodbye",
  alias: ["customgoodbye"],
  category: "group",
  description: "Configurar un mensaje de despedida personalizado",
  usage: ".setgoodbye <mensaje>",
  example: ".setgoodbye Adiós {user}, nos vemos pronto!",
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
  const text = m.text || m.args.join(" ");

  if (!text) {
    return m.reply(
      `📝 *ᴄᴏɴꜰɪɢᴜʀᴀʀ ᴅᴇsᴘᴇᴅɪᴅᴀ*\n\n` +
        `╭┈┈⬡「 📋 *ᴘʟᴀᴄᴇʜᴏʟᴅᴇʀs* 」\n` +
        `┃ ◦ \`{user}\` - Nombre del miembro\n` +
        `┃ ◦ \`{number}\` - Número del miembro\n` +
        `┃ ◦ \`{group}\` - Nombre del grupo\n` +
        `┃ ◦ \`{desc}\` - Descripción del grupo\n` +
        `┃ ◦ \`{count}\` - Miembros restantes\n` +
        `┃ ◦ \`{owner}\` - Nombre del owner del grupo\n` +
        `┃ ◦ \`{date}\` - Fecha (DD/MM/AAAA)\n` +
        `┃ ◦ \`{time}\` - Hora (HH:mm WIB)\n` +
        `┃ ◦ \`{day}\` - Día (Lunes, Martes, etc)\n` +
        `┃ ◦ \`{bot}\` - Nombre del bot\n` +
        `┃ ◦ \`{prefix}\` - Prefijo del bot\n` +
        `╰┈┈⬡\n\n` +
        `\`Ejemplo:\`\n` +
        `\`${m.prefix}setgoodbye Adiós {user}! 👋\`\n` +
        `\`Nos vemos el {day}, {date}\``,
    );
  }

  db.setGroup(m.chat, { goodbyeMsg: text, goodbye: true, leave: true });
  db.save();

  m.react("✅");

  await m.reply(
    `✅ Despedida configurada correctamente como *${text}*\n¿Quieres restablecerla? Escribe ${m.prefix}resetgoodbye`,
  );
}

export { pluginConfig as config, handler };
