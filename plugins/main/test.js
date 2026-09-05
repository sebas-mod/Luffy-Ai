import config from "../../config.js";
import { generateWAMessageFromContent } from "ourin";

const pluginConfig = {
  name: "test",
  alias: [],
  category: "test",
  description: "Menú de encuesta interactivo de prueba",
  usage: ".poll",
  example: ".poll",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  carne: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  try {
    await m.reply("test")
    const msg = generateWAMessageFromContent(m.chat, {
      pollCreationMessageV6: {
        name: "🔥 ELIGE MENÚ INTERACTIVO 🔥",
        options: [
          { optionName: "Anime" },
          { optionName: "Game" },
          { optionName: "Profile" }
        ],
        selectableOptionsCount: 1
      }
    }, { quoted: m });

    await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
  } catch (error) {
    console.error("[TestPoll] Error:", error);
    m.reply("Error al crear el menú de encuesta.");
  }
}

export { pluginConfig as config, handler };
