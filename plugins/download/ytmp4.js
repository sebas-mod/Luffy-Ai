import axios from "axios";
import ytdl from "../../src/scraper/ytdl.js";
import config from "../../config.js";
import { card, fail, usage } from "../../src/lib/luffy-dl-ui.js";
const pluginConfig = {
  name: "ytmp4",
  alias: ["youtubemp4", "ytvideo"],
  category: "download",
  description: "Descarga videos de YouTube",
  usage: ".ytmp4 <url>",
  example: ".ytmp4 https://youtube.com/watch?v=xxx",
  cooldown: 20,
  carne: 2,
  isEnabled: true,
};


async function getVideoDownloadUrl(url) {
  const videoId = url.match(/(?:[?&]v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([\w-]{11})/)?.[1] || url;
  try {
    const { data } = await axios.get(
      `https://apiyosoyyo-ofc.onrender.com/api/youtube?q=${encodeURIComponent(videoId)}&apiKey=Sebas-api2026`,
      { timeout: 60000 }
    );
    if (data?.status && data?.result?.length && data.result[0]?.download?.mp4) {
      return data.result[0].download.mp4;
    }
  } catch (e) {
    console.error("[YTMP4 API Error]", e.message);
  }

  const fallback = await ytdl(url, "mp4");
  if (fallback?.status && fallback?.dl) {
    return fallback.dl;
  }

  throw new Error(fallback?.mess || "Error al obtener la URL de descarga del video");
}

async function handler(m, { sock }) {
  const url = m.text?.trim();
  if (!url)
    return m.reply(
      `🎬 *𝗬𝗧𝗠𝗣𝟰*\n` +
        `> Descarga videos de YouTube en calidad MP4.\n\n` +
        usage(m.prefix, "ytmp4", "https://youtube.com/watch?v=xxx"),
    );
  if (!url.includes("youtube.com") && !url.includes("youtu.be")) {
    await m.react("❌");
    return m.reply(fail("YTMP4", "La URL debe ser de YouTube."));
  }

  m.react("🕕");

  try {
    const downloadUrl = await getVideoDownloadUrl(url);

    const caption = card({
      emoji: "🎬",
      title: "𝗬𝗧𝗠𝗣𝟰",
      fields: [
        ["Fuente", "YouTube"],
        ["Formato", "Video (.mp4)"],
      ],
      footer: "Descarga lista, a disfrutar! 🚀",
    });

    await sock.sendMedia(m.chat, downloadUrl, caption, m, {
      type: "video",
    });
    m.react("✅");
  } catch (err) {
    console.error("[YTMP4]", err);
    m.react("❌");
    m.reply(fail("YTMP4", "Error al descargar el video. Intenta de nuevo más tarde."));
  }
}

export { pluginConfig as config, handler };
