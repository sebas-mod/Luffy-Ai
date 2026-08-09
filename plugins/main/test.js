import config from "../../config.js";
import { generateWAMessageFromContent } from "ourin";

const pluginConfig = {
  name: "test",
  alias: ["poll"],
  category: "test",
  description: "Test Poll Menu Interaktif",
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
        name: "🔥 PILIH MENU INTERAKTIF 🔥",
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
    console.error("[TestPoll] Gagal:", error);
    m.reply("Error al crear el menú de encuesta.");
  }
}

export { pluginConfig as config, handler };
