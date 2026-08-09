import axios from "axios";
import FormData from "form-data";
import config from "../../config.js";
import te from "../../src/lib/luffy-error.js";
import _sharp from 'sharp';

const pluginConfig = {
  name: "hd2",
  alias: ["enhance2", "upscale2", "aienhancer"],
  category: "tools",
  description: "Mejora imágenes a HD con IA (V3)",
  usage: ".hd2 (responde una imagen)",
  example: ".hd2",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 30,
  carne: 2,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const isImage = m.isImage || (m.quoted && m.quoted.type === "imageMessage");

  if (!isImage) {
    let help = `✨ *FUNCIÓN MEJORA HD V2*\n\n`
    help += `¡Aumenta la resolución de tu imagen para que se vea mucho más HD y nítida usando IA!\n\n`
    help += `*Cómo Usar:*\n`
    help += `- Envía una imagen y agrega el mensaje *${m.prefix}hd2*\n`
    help += `- O responde a una imagen ya enviada con el comando *${m.prefix}hd2*\n\n`
    help += `_El proceso de renderizado puede tardar desde unos segundos hasta un minuto._`
    return m.reply(help);
  }

  await m.react("🕕");

  try {
    let buffer;
    if (m.quoted && m.quoted.isMedia) {
      buffer = await m.quoted.download();
    } else if (m.isMedia) {
      buffer = await m.download();
    }

    if (!buffer) {
      await m.react("❌");
      return m.reply(`Lo siento, el sistema no pudo descargar la imagen que enviaste. ¡Por favor, intenta volver a enviarla!`);
    }

    const form = new FormData();
    form.append("image", buffer, { filename: "image.jpg", contentType: "image/jpeg" });
    form.append("type", "upscale");
    form.append("scale", "2");

    const response = await axios.post("https://my.izuka-api.xyz/api/tools/imglarger", form, {
      headers: form.getHeaders(),
      timeout: 60000
    });

    const data = response.data;
    if (!data || !data.status || !data.result) {
      await m.react("❌");
      return m.reply(`Lo siento, la IA no pudo procesar tu imagen esta vez. ¡Inténtalo de nuevo en unos momentos!`);
    }

    await m.react("✅");

    const thumbBuffer = await _sharp(buffer).resize(50, 50).jpeg({ quality: 30 }).toBuffer();

    await sock.sendMessage(
      m.chat,
      {
        document: { url: data.result },
        mimetype: "image/jpeg",
        jpegThumbnail: thumbBuffer,
        fileName: `HD_BY_${config.bot.name}.jpg`,
      },
      { quoted: m },
    );

  } catch (error) {
    console.error("[HD2 Plugin Error]", error);
    await m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
