import axios from "axios";
import te from "../../src/lib/ourin-error.js";
import config from "../../config.js";

const pluginConfig = {
  name: "ttp",
  alias: ["texttopicture"],
  category: "maker",
  description: "Crear sticker genial a partir de texto",
  usage: ".ttp <texto>",
  example: ".ttp Hola Bonita",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const text = m.args.join(" ") || m.text?.trim();

  if (!text) {
    return m.reply("❌ *¡Vaya, ¿dónde está el texto?*\n\nDebes ingresar el texto que quieres convertir en sticker.\n\nEjemplo: `.ttp Hola Bonita`"); // ¡No seas tímido!
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
    m.reply("😔 *Ocurrió un problema en nuestro sistema.* \n\nEl sistema no pudo contactar al servidor de creación de stickers. Por favor, intenta de nuevo en unos momentos."); // ¡No te preocupes!
  }
}

export { pluginConfig as config, handler };
