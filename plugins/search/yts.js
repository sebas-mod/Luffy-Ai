import yts from "yt-search";
import { generateWAMessageFromContent, proto } from "ourin";
import axios from "axios";
import sharp from "sharp";
import config from "../../config.js";

const pluginConfig = {
  name: "yts",
  alias: ["ytsearch", "youtubesearch"],
  category: "search",
  description: "Busca videos en YouTube por palabra clave y muestra los detalles completos con miniatura.",
  usage: ".yts <query>",
  example: ".yts lagu pop terbaru",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  carne: 2,
  isEnabled: true,
};

async function handler(m, { sock, text }) {
  if (!text) {
    return m.reply("❌ *Vaya, la palabra clave está vacía!*\n\nDebes ingresar la palabra clave del título del video que quieres buscar. \n\nEjemplo de uso: `.yts lagu galau indonesia`");
  }

  await m.react("🕕");

  try {
    const searchResults = await yts(text);
    const videos = searchResults.videos;

    if (!videos || videos.length === 0) {
      await m.react("❌");
      return m.reply("⚠️ *Lo siento mucho, la búsqueda no encontró ningún resultado.* \n\nQuizás la palabra clave es demasiado específica. ¡Intenta con otra palabra clave más general!");
    }

    const firstVideo = videos[0];

    const imageResponse = await axios.get(firstVideo.thumbnail, { responseType: "arraybuffer" });
    const thumbnailBuffer = await sharp(imageResponse.data).resize(300, 170).jpeg().toBuffer();

    const contentText = `✨ *RESULTADOS DE BÚSQUEDA EN YOUTUBE* ✨

¡Hola! Este es el resultado principal que encontré con la palabra clave que diste. 

🔎 *Palabra Clave de Búsqueda*: ${text}
🎬 *Título del Video*: ${firstVideo.title}
📺 *Nombre del Canal*: ${firstVideo.author.name}
⏱️ *Duración del Video*: ${firstVideo.timestamp}
👁️ *Número de Vistas*: ${firstVideo.views} vistas
📅 *Fecha de Publicación*: ${firstVideo.ago}
🔗 *Enlace del Video*: ${firstVideo.url}

*Nota Adicional*: La miniatura de este video ya está incrustada en la parte superior del mensaje (mapa de ubicación) según tu solicitud. ¿Genial, verdad? 😎

¡Elige uno de los botones de abajo para descargar directamente el video o su audio!`;

    const content = {
      buttonsMessage: {
        buttons: [
          {
            buttonId: `.ytmp4 ${firstVideo.url}`,
            buttonText: { displayText: '🎥 Descargar Video' },
            type: 1,
          },
          {
            buttonId: `.ytmp3 ${firstVideo.url}`,
            buttonText: { displayText: '🎵 Descargar Audio' },
            type: 1,
          },
        ],
        locationMessage: {
          jpegThumbnail: thumbnailBuffer,
          name: firstVideo.title,
          address: `📺 Canal: ${firstVideo.author.name} | ⏱️ Duración: ${firstVideo.timestamp}`
        },
        contentText: contentText,
        footerText: config.bot.name,
        headerType: 6,
      },
    };

    const msg = generateWAMessageFromContent(m.chat, content, {
      quoted: m,
    });

    await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
    await m.react("✅");

  } catch (error) {
    console.error(error);
    await m.react("❌");
    m.reply("😔 *Vaya, parece que hay un problema en mi sistema.* \n\nOcurrió un error al intentar buscar ese video en YouTube. Espera un momento e intenta de nuevo más tarde!");
  }
}

export { pluginConfig as config, handler };