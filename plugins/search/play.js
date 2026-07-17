/**
 * Nama Plugin: Play
 * Pembuat Code: Zann
 * Saluran: https://whatsapp.com/channel/0029Vb7g5Qt90x2yn7bOlM2U
 */

import yts from "yt-search";
import axios from "axios";
import ytdl, { fallbackToMp3Buffer } from "../../src/scraper/ytdl.js";
import config from "../../config.js";
const pluginConfig = {
  name: "play",
  alias: ["playaudio"],
  category: "search",
  description: "Reproducir música de YouTube (API Siputzx)",
  usage: ".play <query>",
  example: ".play komang",
  cooldown: 15,
  energi: 1,
  isEnabled: true,
};

function formatViews(n) {
  if (!n) return "0";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toString();
}

async function getPlayAudioDownload(url) {
  try {
    const apiUrl = `https://api.cuki.biz.id/api/downloader/ytmp3?apikey=${config.APIkey.cuki}&url=${encodeURIComponent(url)}&quality=128`;
    const res = await axios.get(apiUrl, { timeout: 30000 });
    const data = res.data;

    if (data.success && data.data?.audio?.download?.downloadUrl) {
      return { 
        download: data.data.audio.download.downloadUrl, 
        title: data.data.metadata?.title || "Audio"
      };
    }
  } catch (err) {
    console.error("[Play API error]", err.message);
  }

  const fallback = await ytdl(url, "mp3");
  if (fallback?.status && fallback?.dl) {
    return { download: fallback.dl, title: fallback.title, isFallback: true };
  }

  throw new Error(fallback?.mess || "Error al obtener la URL de audio");
}

async function handler(m, { sock, text }) {
  const query = m.text?.trim();
  if (!query)
    return m.reply(`🎵 *ᴘʟᴀʏ*\n\n> Ejemplo:\n\`${m.prefix}play komang\``);

  m.react("🕐");

  try {
    const search = await yts(query);
    if (!search.videos.length) throw "Video no encontrado";

    const video = search.videos[0];

    let info = `🎵 *NOW PLAYING*\n\n`;
    info += `📌 *Título:* ${video.title}\n\n`;
    info += `*DETALLE*\n`;
    info += `👤 Canal: *${video.author.name}*\n`;
    info += `⏱️ Duración: *${video.duration.timestamp}*\n`;
    info += `👀 Vistas: *${formatViews(video.views)}*\n`;
    info += `📅 Subido: *${video.ago}*\n`;
    info += `🆔 ID: \`${video.videoId}\`\n\n`;
    if (video.description) {
      const desc = video.description.substring(0, 150).replace(/\n/g, " ");
      info += `*Descripción:*\n_${desc}${video.description.length > 150 ? "..." : ""}_\n\n`;
    }
    info += `🔗 ${video.url}\n\n`;
    info += `_⏳ enviando audio, por favor espera..._`;

    await sock.sendPreview(
      m.chat,
      {
        caption: `${info}`,
        url: video.url,
        title: video.title,
        description: "YouTube Video",
        image: video.thumbnail,
        previewType: 1,
      },
      {
        quoted: m,
      },
    );

    const audio = await getPlayAudioDownload(video.url);

    if (audio.isFallback) {
      const mp3Buffer = await fallbackToMp3Buffer(audio.download);
      await sock.sendMessage(
        m.chat,
        {
          audio: mp3Buffer,
          mimetype: "audio/mpeg",
          ptt: false,
          fileName: `${audio.title || video.title || "audio"}.mp3`,
        },
        { quoted: m },
      );
    } else {
      await sock.sendMedia(m.chat, audio.download, video.title, m, {
        type: "audio",
      });
    }

    m.react("✅");
  } catch (err) {
    console.error("[Play]", err);
    m.react("😭");
    m.reply(
      `¡Vaya, la función de reproducción de música está teniendo problemas, intenta de nuevo más tarde, por favor no hagas spam!`,
    );
  }
}

export { pluginConfig as config, handler };
