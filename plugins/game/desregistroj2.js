import { getDatabase } from "../../src/lib/luffy-database.js";
import config from "../../config.js";

const pluginConfig = {
  name: "desregistrogame",
  alias: ["desregistroj2", "unregjuego", "quitar_registroj2", "desregjuego"],
  category: "game",
  description: "Elimina tus datos de registro de juegos",
  usage: ".desregistrogame",
  example: ".desregistrogame",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 30,
  carne: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user?.j2Registered) {
    return m.reply(
      `❌ ¡Aún no tienes registro de juegos!\n\n` +
        `> Regístrate con \`${m.prefix}registrogame\``,
    );
  }

  const saluranId = config.saluran?.canalId || "120363400911374213@newsletter";
  const saluranName = config.saluran?.name || config.bot?.name || "Luffy-Ai";

  db.setUser(m.sender, {
    j2Registered: false,
    j2Name: null,
    j2Age: null,
    j2Gender: null,
    j2RegisteredAt: null,
  });

  await db.save();

  await sock.sendMessage(
    m.chat,
    {
      text:
        `☽◯☾ ╭━ ♰ ✦ ♰ ━╮ ☽◯☾\n✅ *ʀᴇɢɪsᴛʀᴏ ᴅᴇ ᴊᴜᴇɢᴏs ᴇʟɪᴍɪɴᴀᴅᴏ*\n\n` +
        `Tus datos de juegos han sido eliminados.\n\n` +
        `╰━ ⊱༺༒༻⊰ ━╯\n\n` +
        `> Para volver a registrarte: \`${m.prefix}registrogame\``,
      contextInfo: {
        forwardingScore: 9999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: saluranId,
          newsletterName: saluranName,
          serverMessageId: 127,
        },
      },
    },
    { quoted: m },
  );

  m.react("✅");
}

export { pluginConfig as config, handler };