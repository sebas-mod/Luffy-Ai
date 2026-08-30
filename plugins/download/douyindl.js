import axios from "axios";
import { card, usage } from "../../src/lib/luffy-dl-ui.js";

const pluginConfig = {
  name: "douyindl",
  alias: ["douyin", "dydl"],
  category: "download",
  description: "Descarga videos/audio de Douyin (TikTok chino)",
  usage: ".douyindl <url>",
  example: ".douyindl https://v.douyin.com/xxx",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  carne: 1,
  isEnabled: true,
};

async function douyinFetch(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await axios.get(`https://api.azbry.com/api/downloader/douyin?url=${encodeURIComponent(url)}`, { timeout: 30000 });
      if (res.data?.status && res.data?.result) {
        return res.data;
      }
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  throw new Error("Error al obtener los datos del servidor");
}

async function handler(m, { sock }) {
  const text = m.text?.trim();
  if (!text) {
    m.react("❌");
    return m.reply(
      `🎵 *𝗗𝗢𝗨𝗬𝗜𝗡*\n──────────\n` +
        `> Descarga videos o audio de Douyin (TikTok chino).\n\n` +
        usage(m.prefix, "douyindl", "https://v.douyin.com/xxx"),
    );
  }

  m.react("🕕");

  try {
    const data = await douyinFetch(text);
    const result = data.result;

    let caption = card({
      emoji: "🎵",
      title: result.platform || "𝗗𝗢𝗨𝗬𝗜𝗡",
      fields: [
        ["Título", result.title],
        ["Formato", result.video ? "Video (.mp4)" : "Audio (.mp3)"],
      ],
      footer: "Descarga completada, a disfrutar! 🚀",
    });

    if (result.video) {
      await sock.sendMedia(m.chat, result.video, caption, m, {
        type: "video",
      });
    }

    if (result.audio) {
      await sock.sendMedia(m.chat, result.audio, null, m, {
        type: "audio",
      });
    }

    m.react("✅");
  } catch (e) {
    console.error(e);
    m.react("☢");
    m.reply("♰ ┄ ── ☽◯☾ ── ┄ ♰\n❌ Error al obtener los datos de Douyin, intenta de nuevo más tarde");
  }
}

export { pluginConfig as config, handler };
