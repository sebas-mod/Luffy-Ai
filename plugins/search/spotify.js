import axios from "axios";
import te from "../../src/lib/ourin-error.js";
import { generateWAMessageFromContent } from "ourin";
import sharp from "sharp";

const pluginConfig = {
  name: "spotify",
  alias: ["spotifysearch", "spsearch"],
  category: "search",
  description: "Buscar lista de canciones en Spotify por título o artista",
  usage: ".spotify <query>",
  example: ".spotify neffex grateful",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock, text }) {
  if (!text) {
    return m.reply("❌ *¡Oye, la palabra clave está vacía!*\n\nDebes ingresar el título de la canción o nombre del artista que quieres buscar en Spotify. \n\nEjemplo de uso: `.spotify bruno mars`");
  }

  await m.react("🕕");

  try {
    const res = await axios.get(`https://api.cuki.biz.id/api/search/spotify?apikey=cuki-x&query=${encodeURIComponent(text)}&limit=5`);
    const data = res.data;

    if (!data.status || !data.data || !data.data.results || data.data.results.length === 0) {
      await m.react("❌");
      return m.reply(`⚠️ *Lo siento, ¡no se encontró la canción!* \n\nBusqué con la palabra clave *${text}* pero no hay resultados en Spotify. Intenta con un título más específico.`);
    }

    const results = data.data.results;
    const firstResult = results[0];

    let contentText = `✨ *RESULTADOS DE BÚSQUEDA SPOTIFY* ✨\n\n¡Hola! Encontré algunas canciones basadas en la palabra clave *${text}*. Aquí está el top:\n\n`;

    results.forEach((t, i) => {
      contentText += `*${i + 1}. ${t.title}*\n`;
      contentText += `   🎤 Artista: ${t.artist}\n`;
      contentText += `   ⏱️ Duración: ${t.duration}\n`;
      contentText += `   🔗 Link: ${t.url}\n\n`;
    });

    contentText += `*Nota*: ¡Puedes copiar el enlace de la canción de arriba y usar el comando \`.spdl <enlace>\` para descargarla directamente! O presiona el botón de abajo para la primera canción. 🚀`;

    let thumbnailBuffer = null;
    try {
      const imageResponse = await axios.get(firstResult.thumb, { responseType: "arraybuffer" });
      thumbnailBuffer = await sharp(imageResponse.data).resize(300, 170).jpeg().toBuffer();
    } catch (e) {
    }

    if (thumbnailBuffer) {
      const content = {
        buttonsMessage: {
          buttons: [
            {
              buttonId: `.spdl ${firstResult.url}`,
              buttonText: { displayText: '🎵 Unduh Lagu Pertama' },
              type: 1,
            }
          ],
          locationMessage: {
            jpegThumbnail: thumbnailBuffer,
            name: firstResult.title,
            address: `🎤 ${firstResult.artist} | ⏱️ ${firstResult.duration}`
          },
          contentText: contentText,
          footerText: '🚀 OURIN MD - Spotify Search',
          headerType: 6,
        },
      };

      const msg = generateWAMessageFromContent(m.chat, content, { quoted: m });
      await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
    } else {
      await m.reply(contentText);
    }

    await m.react("✅");

  } catch (err) {
    console.error("[Spotify Search]", err.message);
    await m.react("☢");
    m.reply("😔 *Vaya, parece que la API está fallando.* \n\nOcurrió un error al procesar la búsqueda de Spotify. ¡Por favor, intenta de nuevo más tarde!");
  }
}

export { pluginConfig as config, handler };
