import axios from "axios";
import ytdl from "../../src/scraper/ytdl.js";
import config from "../../config.js";
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
    return m.reply(`Ejemplo: ${m.prefix}ytmp4 https://youtube.com/watch?v=xxx`);
  if (!url.includes("youtube.com") && !url.includes("youtu.be"))
    return m.reply("❌ La URL debe ser de YouTube");

  m.react("🕕");

  try {
    const downloadUrl = await getVideoDownloadUrl(url);

    await sock.sendMedia(m.chat, downloadUrl, null, m, {
      type: "video",
    });
    m.react("✅");
  } catch (err) {
    console.error("[YTMP4]", err);
    m.react("❌");
    m.reply("Error al descargar el video.");
  }
}

export { pluginConfig as config, handler };
