import te from "../../src/lib/luffy-error.js";
import config from "../../config.js";
import axios from "axios";

const pluginConfig = {
  name: "watercolortext",
  alias: ["watercolor", "wctext"],
  category: "canvas",
  description: "Crea una imagen de texto con efecto acuarela",
  usage: ".watercolortext <texto>",
  example: ".watercolortext Luffy-Ai",
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
      `🎨 *ᴡᴀᴛᴇʀᴄᴏʟᴏʀ ᴛᴇxᴛ*\n\n> Ingresa el texto que quieres convertir en imagen\n\n\`Ejemplo: ${m.prefix}watercolortext Luffy-Ai\``,
    );
  }

  m.react("🕕");

  try {
    const url = `https://api.cuki.biz.id/api/ephoto/watercolortext?apikey=${config.APIkey.cuki}&query=${encodeURIComponent(text)}`;
    
    // Mengunduh gambar langsung (response type image)
    const { data } = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 30000
    });

    const imageBuffer = Buffer.from(data, 'binary');

    m.react("✅");
    await sock.sendMessage(m.chat, { 
      image: imageBuffer, 
      caption: `🎨 *Water Color Text*\n\nTexto: ${text}` 
    }, { quoted: m });
  } catch (error) {
    console.log(error);
    m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
