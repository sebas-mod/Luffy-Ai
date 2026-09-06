import axios from "axios";
import { ytdl } from "../../src/scraper/ytdl.js";
import config from "../../config.js";
import { card, fail, usage, progressChain } from "../../src/lib/luffy-dl-ui.js";
import {
  trySources,
  trackStats,
  sendWithLinkButton,
} from "../../src/lib/luffy-dl-core.js";

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

function extractVideoId(url) {
  return (
    url.match(
      /(?:[?&]v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|shorts\/)([\w-]{11})/,
    )?.[1] || url
  );
}

function thumbnailUrl(videoId) {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

async function getVideoDownloadUrl(url, quality) {
  const videoId = extractVideoId(url);
  const dlConfig = config.downloader?.youtube || {};

  const viaApi = await trySources(
    dlConfig.sources || [],
    { query: videoId, url },
    (data) => {
      const first = Array.isArray(data?.result) ? data.result[0] : null;
      if (!first) return null;
      const q = String(quality || "360");
      const chosen = first.download?.[q] || first.download?.[q + "p"] || first.download?.mp4;
      return chosen || null;
    },
    { timeout: 60000 },
  ).catch((e) => {
    console.error("[YTMP4 API Error]", e.message);
    return null;
  });

  if (viaApi?.picked) return viaApi.picked;

  const fallback = await ytdl(url, "mp4");
  if (fallback?.status && fallback?.dl) return fallback.dl;
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

  await progressChain(sock, m, ["🕕", "📥"]);
  const videoId = extractVideoId(url);

  try {
    const downloadUrl = await getVideoDownloadUrl(url, "360");

    const caption = card({
      emoji: "🎬",
      title: "𝗬𝗧𝗠𝗣𝟰",
      fields: [
        ["Fuente", "YouTube"],
        ["Formato", "Video (.mp4)"],
        ["Calidad", "360p (usa el botón para elegir otra)"],
      ],
      footer: config.downloader?.footer || "⚓ Luffy-Ai Downloader",
    });

    try {
      await sock.sendMessage(
        m.chat,
        {
          image: { url: thumbnailUrl(videoId) },
          caption,
        },
        { quoted: m },
      );
    } catch {}

    await sendWithLinkButton(sock, m.chat, m, {
      caption,
      url: downloadUrl,
      buttonText: "🎬 Descargar en 360p",
    });

    trackStats("youtube");
    m.react("✅");
  } catch (err) {
    console.error("[YTMP4]", err);
    m.react("❌");
    m.reply(fail("YTMP4", "Error al descargar el video. Intenta de nuevo más tarde."));
  }
}

export { pluginConfig as config, handler };