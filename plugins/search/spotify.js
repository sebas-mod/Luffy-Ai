import axios from "axios";
import te from "../../src/lib/luffy-error.js";
import { generateWAMessageFromContent } from "ourin";
import sharp from "sharp";

const pluginConfig = {
  name: "spotify",
  alias: ["spotifysearch", "spsearch"],
  category: "search",
  description: "Busca canciones en Spotify por título o artista",
  usage: ".spotify <query>",
  example: ".spotify neffex grateful",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  carne: 1,
  isEnabled: true,
};

async function handler(m, { sock, text }) {
  if (!text) {
    return m.reply("╰┈➤ ❌ *Vaya, ¿dónde está la palabra clave?*\n\nDebes ingresar el título de la canción o el nombre del artista que quieres buscar en Spotify. \n\nEjemplo de uso: `.spotify bruno mars`");
  }

  await m.react("🕕");

  try {
    const res = await axios.get(`https://api.nexray.eu.cc/search/spotify?q=${encodeURIComponent(text)}`);
    const data = res.data;

    if (!data.status || !data.result || data.result.length === 0) {
      await m.react("❌");
      return m.reply(`╰┈➤ ⚠️ *Lo siento, no se encontró la canción!* \n\nBusqué con la palabra clave *${text}* pero no hay resultados en Spotify. Intenta usar un título más específico.`);
    }

    const results = data.result.slice(0, 5);
    const firstResult = results[0];

    let contentText = `╭━━━〔 ✨ BÚSQUEDA EN SPOTIFY 〕━━━╮\n\n╰┈➤ ¡Hola! Encontré varias canciones con la palabra clave *${text}*. Esta es la lista de las principales:\n──────────\n`;

    results.forEach((t, i) => {
      contentText += `╰┈➤ *${i + 1}. ${t.title}*\n`;
      contentText += `›  🎤 Artista: ${t.artist}\n`;
      contentText += `›  ⏱️ Duración: ${t.duration}\n`;
      contentText += `›  🔗 Enlace: ${t.url}\n\n`;
    });

    contentText += `──────────\n*Nota*: Puedes copiar el enlace de la canción de arriba y usar el comando \`.spdl <link>\` para descargarla directamente! O pulsa el botón de abajo para la primera canción. 🚀\n\n╰━━━━━━━━━━━━╯`;

    let thumbnailBuffer = null;
    try {
      const imageResponse = await axios.get(firstResult.thumbnail, { responseType: "arraybuffer" });
      thumbnailBuffer = await sharp(imageResponse.data).resize(300, 170).jpeg().toBuffer();
    } catch (e) {
    }

    if (thumbnailBuffer) {
      const content = {
        buttonsMessage: {
          buttons: [
            {
              buttonId: `.spdl ${firstResult.url}`,
              buttonText: { displayText: '🎵 Descargar Primera Canción' },
              type: 1,
            }
          ],
          locationMessage: {
            jpegThumbnail: thumbnailBuffer,
            name: firstResult.title,
            address: `🎤 ${firstResult.artist} | ⏱️ ${firstResult.duration}`
          },
          contentText: contentText,
          footerText: '🚀 Luffy-Ai MD - Búsqueda en Spotify',
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
    m.reply("╰┈➤ 😔 *Vaya, parece que la API está fallando.* \n\nOcurrió un error fatal al intentar procesar la búsqueda de Spotify. ¡Intenta de nuevo más tarde!");
  }
}

export { pluginConfig as config, handler };
