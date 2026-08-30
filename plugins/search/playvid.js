import axios from "axios";
import yts from "yt-search";
import ytdl from "../../src/scraper/ytdl.js";

const pluginConfig = {
  name: "playvid",
  alias: ["playvideo", "playmp4"],
  category: "search",
  description: "Busca y reproduce videos de YouTube",
  usage: ".playvid <query>",
  example: ".playvid windah basudara",
  cooldown: 15,
  carne: 2,
  isEnabled: true,
};

function formatViews(n) {
  if (!n) return "0";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toString();
}

async function getVideoDownloadUrl(url) {
  try {
    const { data } = await axios.get(
      `https://my.izuka-api.xyz/api/downloader/ytmp4?url=${encodeURIComponent(url)}`
    );

    if (data?.status && data?.result?.video_normal) {
      const videos = data.result.video_normal.filter(v => v.ext === "mp4");
      if (videos.length > 0) {
        videos.sort((a, b) => parseInt(b.quality) - parseInt(a.quality));
        if (videos[0] && videos[0].url) {
          return videos[0].url;
        }
      }
    }
  } catch (e) {
    console.error("[YTMP4 Izuka API Error]", e.message);
  }

  const fallback = await ytdl(url, "mp4");
  if (fallback?.status && fallback?.dl) {
    return fallback.dl;
  }

  throw new Error(fallback?.mess || "Error al obtener la URL de descarga del video");
}

async function handler(m, { sock, text }) {
  const query = m.text?.trim();
  if (!query) {
    return m.reply(`☽◯☾ ♰ Hola *${m.pushName}* 👋\n\nPara buscar y reproducir videos de YouTube, por favor usa el formato:\n- \`${m.prefix}playvid <título del video>\`\n\nEjemplo:\n- \`${m.prefix}playvid windah basudara\``);
  }

  m.react("🕕");

  try {
    const search = await yts(query);
    if (!search.videos.length) throw new Error("Video no encontrado");
    const video = search.videos[0];

    let info = `☽◯☾ ╭ ♰ 🎬 ♰ ━╮ ☽◯☾\n☽◯☾ ♰ Hola *${m.pushName}*, este es el video que buscas:\n──────────\n`;
    info += `📌 *Título:* ${video.title}\n`;
    info += `👤 *Canal:* ${video.author.name}\n`;
    info += `⏱️ *Duración:* ${video.duration.timestamp}\n`;
    info += `👀 *Vistas:* ${formatViews(video.views)}\n`;
    info += `📅 *Subido:* ${video.ago}\n\n`;
    info += `_⏳ Descargando el video, por favor espera un momento..._`;

    await sock.sendPreview(
      m.chat,
      {
        caption: video.url + "\n" + info,
        url: video.url,
        title: video.title,
        description: "Video de YouTube",
        image: video.thumbnail,
        previewType: 1,
      },
      {
        quoted: m,
      },
    );

    const downloadUrl = await getVideoDownloadUrl(video.url);

    await sock.sendMedia(m.chat, downloadUrl, null, m, {
      type: "video",
    });

    m.react("✅");
  } catch (err) {
    console.error("[PlayVid]", err);
    m.react("❌");
    m.reply(
      `☽◯☾ ♰ 😔 Lo siento *${m.pushName}*, la función de reproducir video está teniendo problemas o el video es demasiado grande. ¡Intenta de nuevo más tarde!`,
    );
  }
}

export { pluginConfig as config, handler };
