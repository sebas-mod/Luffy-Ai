import axios from "axios";
import ytdl, { fallbackToMp3Buffer } from "../../src/scraper/ytdl.js";
import config from "../../config.js";
import { card, fail, usage, progressChain } from "../../src/lib/luffy-dl-ui.js";
import { trackStats } from "../../src/lib/luffy-dl-core.js";
const pluginConfig = {
  name: "ytmp3",
  alias: ["youtubemp3", "ytaudio"],
  category: "download",
  description: "Descarga audio de YouTube",
  usage: ".ytmp3 <url>",
  example: ".ytmp3 https://youtube.com/watch?v=xxx",
  cooldown: 20,
  carne: 2,
  isEnabled: true,
};

async function getAudioDownload(url) {
  try {
    const { data } = await axios.get(
      `https://my.izuka-api.xyz/api/downloader/ytmp3?url=${encodeURIComponent(url)}`, { timeout: 60000 }
    );
    const download = data?.result?.download_url;
    const title = data?.result?.title;
    if (download) {
      return { download, title };
    }
  } catch {}

  const fallback = await ytdl(url, "mp3");
  if (fallback?.status && fallback?.dl) {
    return { download: fallback.dl, title: fallback.title, isFallback: true };
  }

  throw new Error(fallback?.mess || "Error al obtener la URL de descarga del audio");
}

async function handler(m, { sock }) {
  const url = m.text?.trim();
  if (!url)
    return m.reply(
      `🎵 *𝗬𝗧𝗠𝗣𝟯*\n` +
        `> Descarga el audio de cualquier video de YouTube.\n\n` +
        usage(m.prefix, "ytmp3", "https://youtube.com/watch?v=xxx"),
    );
  if (!url.includes("youtube.com") && !url.includes("youtu.be")) {
    await m.react("❌");
    return m.reply(fail("YTMP3", "La URL debe ser de YouTube."));
  }

  await progressChain(sock, m, ["🕕", "🎵"]);

  try {
    const result = await getAudioDownload(url);

    const caption = card({
      emoji: "🎵",
      title: "𝗬𝗧𝗠𝗣𝟯",
      fields: [
        ["Título", result.title],
        ["Formato", "Audio (.mp3)"],
      ],
      footer: config.downloader?.footer || "⚓ Luffy-Ai Downloader",
    });

    if (result.isFallback) {
      const mp3Buffer = await fallbackToMp3Buffer(result.download);
      await sock.sendMessage(
        m.chat,
        {
          audio: mp3Buffer,
          mimetype: "audio/mpeg",
          ptt: false,
          fileName: `${result.title || "audio"}.mp3`,
          caption,
        },
        { quoted: m },
      );
    } else {
      await sock.sendMedia(m.chat, result.download, caption, m, {
        type: "audio",
        mimetype: "audio/mpeg",
        ptt: false,
        fileName: result.title || "audio.mp3",
      });
    }
    trackStats("youtube_audio");
    m.react("✅");
  } catch (err) {
    console.error("[YTMP3]", err);
    m.react("❌");
    m.reply(fail("YTMP3", "Error al descargar el audio. Intenta de nuevo más tarde."));
  }
}

export { pluginConfig as config, handler };
