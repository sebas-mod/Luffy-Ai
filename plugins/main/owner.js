import crypto from "crypto";
import config, { getOwnerName } from "../../config.js";
import { getDatabase } from "../../src/lib/luffy-database.js";
import {
  proto,
  generateWAMessageFromContent,
  prepareWAMessageMedia,
} from "ourin";
import { AIRich } from "../../src/lib/luffy-builder.js";
import axios from "axios";
import sharp from "sharp";
const pluginConfig = {
  name: "owner",
  alias: ["creator", "dev", "developer"],
  category: "main",
  description: "Mostrar el contacto del owner del bot",
  usage: ".owner",
  example: ".owner",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  carne: 0,
  isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  const db = getDatabase();
  const ownerType = db.setting("ownerType") || 1;
  const configOwners = botConfig.owner?.number || [];
  const dbOwners = db.data.owner || [];
  const ownerNumbers = [...new Set([...configOwners, ...dbOwners])];
  const botName = botConfig.bot?.name || "Luffy-Ai";
  if (ownerType === 2) {
    const contacts = [];

    for (const number of ownerNumbers) {
      const cleanNumber = number.replace(/[^0-9]/g, "");

      const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${getOwnerName(number)}\nTEL;type=CELL;type=VOICE;waid=${cleanNumber}:+${cleanNumber}\nEND:VCARD`;

      contacts.push({ vcard });
    }

    const zanne = await sock.sendMessage(
      m.chat,
      {
        contacts: {
          displayName: `Este es nuestro owner`,
          contacts,
        },
      },
      { quoted: m.raw },

    );
    await sock.sendMessage(m.chat, {
      text: "💬 Si tienes preguntas, no dudes en preguntar, el capitán es amigable"
    }, { quoted: zanne })
  } else {
    const ownerText = `👑 *ɪɴꜰᴏʀᴍᴀᴄɪóɴ ᴅᴇʟ ᴄᴀᴘɪᴛáɴ*\n\n╭┈┈⬡「 📋 *ᴅᴇᴛᴀɪʟ* 」\n┃ ㊗ ɴᴏᴍʙʀᴇ: *${ownerNumbers.map((n) => getOwnerName(n)).join(", ")}*\n┃ ㊗ ʙᴏᴛ: *${botName}*\n┃ ㊗ ᴇsᴛᴀᴅᴏ: *🟢 En línea*\n╰┈┈⬡\n\n> _Si tienes preguntas o problemas,_\n> _¡contacta al capitán de arriba!_\n> _📞 Tarjeta de contacto abajo._`;

    await m.reply(ownerText);

    for (const number of ownerNumbers) {
      const cleanNumber = number.replace(/[^0-9]/g, "");

      const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${getOwnerName(number)} (Capitán ${botName})\nTEL;type=CELL;type=VOICE;waid=${cleanNumber}:+${cleanNumber}\nEND:VCARD`;

      await sock.sendMessage(
        m.chat,
        {
          contacts: {
            displayName: getOwnerName(number),
            contacts: [{ vcard }],
          },
        },
        { quoted: m.raw },
      );
    }
  }
}

export { pluginConfig as config, handler };
