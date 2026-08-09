import axios from "axios";
import FormData from "form-data";
import config from "../../config.js";
import te from "../../src/lib/luffy-error.js";
import _sharp from 'sharp';

const pluginConfig = {
  name: "hd3",
  alias: ["enhance3", "upscale3", "unblur"],
  category: "tools",
  description: "Aclara imágenes borrosas y las hace nítidas con IA (Unblur)",
  usage: ".hd3 (responde una imagen)",
  example: ".hd3",
  cooldown: 20,
  carne: 2,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const isImage = m.isImage || (m.quoted && m.quoted.type === "imageMessage");

  if (!isImage) {
    let help = `✨ *MEJORA HD V3 (UNBLUR)*\n\n`
    help += `Función avanzada para arreglar imágenes borrosas y devolverles nitidez usando inteligencia artificial!\n\n`
    help += `*Cómo Usar:*\n`
    help += `- Envía una imagen y agrega el mensaje *${m.prefix}hd3*\n`
    help += `- O responde a una imagen ya enviada con el comando *${m.prefix}hd3*\n\n`
    help += `_El proceso de renderizado puede tardar unos momentos._`
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

    const response = await axios.post("https://my.izuka-api.xyz/api/tools/unblur", form, {
      headers: form.getHeaders(),
      timeout: 60000
    });

    const data = response.data;
    if (!data || !data.status || !data.result || !data.result.output_url || !data.result.output_url[0]) {
      await m.react("❌");
      return m.reply(`Lo siento, la IA no pudo procesar tu imagen esta vez. ¡Inténtalo de nuevo en unos momentos!`);
    }

    await m.react("✅");

    const resultUrl = data.result.output_url[0];
    const thumbBuffer = await _sharp(buffer).resize(50, 50).jpeg({ quality: 30 }).toBuffer();

    await sock.sendMessage(
      m.chat,
      {
        document: { url: resultUrl },
        mimetype: "image/jpeg",
        jpegThumbnail: thumbBuffer,
        fileName: `UNBLUR_BY_${config.bot.name}.jpg`,
      },
      { quoted: m },
    );

  } catch (error) {
    console.error("[HD3 Plugin Error]", error);
    await m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
