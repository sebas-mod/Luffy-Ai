import axios from "axios";
import config from "../../config.js";
import te from "../../src/lib/luffy-error.js";
import { saluranCtx } from "../../src/lib/luffy-context.js";
const NEOXR_APIKEY = config.APIkey?.neoxr || "Milik-Bot-Luffy-Ai";

const pluginConfig = {
  name: "emoji_a_animacion",
  alias: ["emoji2sticker", "emojisticker", "e2s"],
  category: "tools",
  description: "Convierte emojis a stickers animados",
  usage: ".emojitoanimasi <emoji>",
  example: ".emojitoanimasi 😳",
  cooldown: 5,
  carne: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const emoji = m.text?.trim();

  if (!emoji) {
    return m.reply(
      `╭━━━〔 🎭 ᴇᴍᴏᴊɪ ᴀ ᴀɴɪᴍᴀᴄɪᴏɴ 〕━━━╮\n\n` +
        `> Convierte emojis a stickers animados\n\n` +
        `*Ejemplo:*\n` +
        `> \`${m.prefix}emoji_a_animacion 😳\`\n\n╰━━━━━━━━━━━━╯`,
    );
  }

  m.react("🎭");

  try {
    const apiUrl = `https://api.neoxr.eu/api/emojito?q=${encodeURIComponent(emoji)}&apikey=${NEOXR_APIKEY}`;
    const { data } = await axios.get(apiUrl, { timeout: 15000 });

    if (!data?.status || !data?.data?.url) {
      m.react("❌");
      return m.reply("╭━〔 ❌ ᴇʀʀᴏʀ 〕━╮\n\n> Emoji no encontrado o error de API\n\n╰━━━━━╯");
    }

    const webpUrl = data.data.url;

    const webpRes = await axios.get(webpUrl, {
      responseType: "arraybuffer",
      timeout: 15000,
    });
    const webpBuffer = Buffer.from(webpRes.data);

    await sock.sendMessage(
      m.chat,
      {
        sticker: webpBuffer,
        contextInfo: saluranCtx(),
      },
      { quoted: m },
    );

    m.react("✅");
  } catch (error) {
    m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
