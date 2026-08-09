import axios from "axios";
import { f } from "../../src/lib/luffy-http.js";
import te from "../../src/lib/luffy-error.js";
import config from "../../config.js";
const pluginConfig = {
  name: "text2img",
  alias: [],
  category: "ai",
  description: "Crear imágenes a partir de texto",
  usage: ".text2img <texto>",
  example: ".text2img Crea una imagen a partir de texto",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  carne: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const text = m.args.join(" ");
  if (!text) {
    return m.reply(
      `📿 *ᴛᴇxᴛ ᴛᴏ ɪᴍᴀɢᴇ*\n\n> Escribe el texto\n\n\`Ejemplo: ${m.prefix}text2img Crea una imagen a partir de texto\``,
    );
  }

  m.react("🕕");

  try {
    const url = `https://firefly.maiku.my.id/api/deepai?apikey=${config.APIkey.firefly}&prompt=${encodeURIComponent(text)}`;
    const data = await axios.get(url);

    const content = data.data.data.output_url;

    m.react("✅");
    await sock.sendMedia(m.chat, content, text, m, {
      type: "image",
    });
  } catch (error) {
    console.error(error);
    m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
