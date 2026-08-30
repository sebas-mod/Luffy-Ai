import axios from "axios";
import config from "../../config.js";
import te from "../../src/lib/luffy-error.js";
import { saluranCtx } from "../../src/lib/luffy-context.js";
const NEOXR_APIKEY = config.APIkey?.neoxr || "Milik-Bot-Luffy-Ai";

const pluginConfig = {
  name: "emoji_a_imagen",
  alias: ["emoji2img", "emojiimg", "e2i"],
  category: "tools",
  description: "Convierte emojis a imágenes HD (estilo Apple)",
  usage: ".emoji_a_imagen <emoji> [estilo]",
  example: ".emoji_a_imagen 😳 apple",
  cooldown: 5,
  carne: 1,
  isEnabled: true,
};

const STYLES = [
  "apple",
  "google",
  "microsoft",
  "samsung",
  "whatsapp",
  "twitter",
  "facebook",
];

async function handler(m, { sock }) {
  const args = m.args || [];
  const emoji = args[0]?.trim();
  const style = args[1]?.toLowerCase() || "apple";

  if (!emoji) {
    return m.reply(
      `☽◯☾ ╭━ ♰ 🖼️ ᴇᴍᴏᴊɪ ᴀ ɪᴍᴀɢᴇɴ ♰ ━╮ ☽◯☾\n\n` +
        `> Convierte emojis a imágenes HD\n\n` +
        `*Formato:*\n` +
        `> \`${m.prefix}emoji_a_imagen <emoji> [estilo]\`\n\n` +
        `*Ejemplo:*\n` +
        `> \`${m.prefix}emoji_a_imagen 😳 apple\`\n\n` +
        `*Estilos disponibles:*\n` +
        `> ${STYLES.join(", ")}\n\n╰━ ⊱༺༒༻⊰ ━╯`,
    );
  }

  const validStyle = STYLES.includes(style) ? style : "apple";

  m.react("🖼️");

  try {
    const apiUrl = `https://api.neoxr.eu/api/emoimg?q=${encodeURIComponent(emoji)}&style=${validStyle}&apikey=${NEOXR_APIKEY}`;
    const { data } = await axios.get(apiUrl, { timeout: 15000 });

    if (!data?.status || !data?.data?.url) {
      m.react("❌");
      return m.reply("☽◯☾ ╭ ♰ ❌ ᴇʀʀᴏʀ ♰ ━╮ ☽◯☾\n\n> Emoji no encontrado o error de API\n\n╰━━━━━╯");
    }

    const imgUrl = data.data.url;

    await sock.sendMedia(
      m.chat,
      imgUrl,
      `🖼️ *ᴇᴍᴏᴊɪ ᴀ ɪᴍᴀɢᴇɴ*\n\n> Emoji: ${emoji}\n> Estilo: ${validStyle}\n> Código: ${data.data.code || "-"}`,
      m,
      { type: "image", contextInfo: saluranCtx() },
    );

    m.react("✅");
  } catch (error) {
    m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
