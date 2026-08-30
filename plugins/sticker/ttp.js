import axios from "axios";
import te from "../../src/lib/luffy-error.js";
import config from "../../config.js";

const pluginConfig = {
  name: "ttp",
  alias: ["texttopicture"],
  category: "maker",
  description: "Crea stickers geniales a partir de texto",
  usage: ".ttp <texto>",
  example: ".ttp Hola Guapa",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  carne: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const text = m.args.join(" ") || m.text?.trim();

  if (!text) {
    return m.reply("❌ *¡Vaya, ¿dónde está el texto?*\n\nDebes ingresar el texto que quieras convertir en sticker.\n\nEjemplo: `.ttp Hola Guapa`");
  }

  await m.react("🕕");

  try {
    const apiUrl = `https://api.nexray.eu.cc/maker/ttp?text=${encodeURIComponent(text)}`;

    const res = await axios.get(apiUrl, {
      responseType: "arraybuffer",
      timeout: 30000
    });

    const imageBuffer = Buffer.from(res.data);

    await sock.sendImageAsSticker(m.chat, imageBuffer, m, {
      packname: config.sticker.packname,
      author: config.sticker.author,
    });

    await m.react("✅");

  } catch (err) {
    console.error("[TTP Maker]", err.message);
    await m.react("☢");
    m.reply("♰ ┄ ── ☽◯☾ ── ┄ ♰\n😔 *Hubo un problema en nuestro sistema.* \n\nEl sistema no pudo conectar con el servidor creador de stickers. Inténtalo de nuevo en unos momentos.\n──────────");
  }
}

export { pluginConfig as config, handler };
