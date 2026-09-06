import instagramDownloader from "../../src/scraper/ig.js";
import config from "../../config.js";
import { card, fail, usage, progressChain } from "../../src/lib/luffy-dl-ui.js";
import { trackStats, getDlConfig, trySources } from "../../src/lib/luffy-dl-core.js";

const pluginConfig = {
  name: "instagramdl",
  alias: ["igdl", "ig", "instagram"],
  category: "download",
  description: "Descarga videos/fotos de Instagram",
  usage: ".instagramdl <url>",
  example: ".instagramdl https://www.instagram.com/reel/xxx",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  carne: 1,
  isEnabled: true,
};

const IG_REGEX = /instagram\.com\/(p|reel|reels|stories|tv)\//i;

function normalizeYosoyyo(result) {
  const data = result?.data || {};
  const media = [];
  const type = data.type === "image" ? "image" : "video";

  if (Array.isArray(data.mediaUrls) && data.mediaUrls.length) {
    for (const m of data.mediaUrls) {
      const u = m?.url || m?.download || (typeof m === "string" ? m : null);
      if (u) media.push({ type, url: u, quality: m?.quality });
    }
  }

  if (!media.length && data.downloadUrl) {
    media.push({ type, url: data.downloadUrl });
  }

  return {
    status: media.length > 0,
    media,
    username: data.author || result?.username || "-",
    caption: data.caption_full || data.title || result?.caption || result?.title || "",
    thumbnail: data.thumbnail || data.thumbnailUrl || result?.thumbnail || null,
    likes: data.likes || result?.likes || null,
    comments: data.comments || result?.comments || null,
  };
}

async function getInstagramMedia(url) {
  const sources =
    getDlConfig()?.instagram?.sources || [
      "https://api-yosoyyo-api-ofc.onrender.com/api/instagram?url={url}&apiKey={key}",
    ];

  try {
    const { picked } = await trySources(
      sources,
      {
        url,
        key: config.downloader?.spotifySearchKey || "sebasapi2024",
      },
      (d) => {
        if (!d?.status || !d?.result) return false;
        const normalized = normalizeYosoyyo(d.result);
        return normalized.status ? normalized : false;
      },
      { timeout: 45000 },
    );
    if (picked?.status) return picked;
  } catch (e) {
    console.error("[InstagramDL] yosoyyo falló:", e.message);
  }

  const fallback = await instagramDownloader(url);
  if (fallback?.media?.length) {
    return {
      status: true,
      media: fallback.media,
      username: fallback.username || "-",
      caption: fallback.caption || "",
      thumbnail: null,
      likes: null,
      comments: null,
      fromFallback: true,
    };
  }
  return null;
}

async function handler(m, { sock }) {
  const url = m.text?.trim();

  if (!url) {
    return m.reply(
      `📸 *𝗜𝗡𝗦𝗧𝗔𝗚𝗥𝗔𝗠*\n` +
        `> Descarga videos, reels y fotos de Instagram.\n\n` +
        usage(m.prefix, "igdl", "https://www.instagram.com/reel/xxx") +
        `\n> https://www.instagram.com/p/xxx`,
    );
  }

  if (!IG_REGEX.test(url)) {
    await m.react("❌");
    return m.reply(
      fail("INSTAGRAM", "URL no válida. Usa un enlace de Instagram (reel/post/story)."),
    );
  }

  await progressChain(sock, m, ["🕕", "📸"]);

  try {
    const result = await getInstagramMedia(url);

    if (!result?.media?.length) {
      await m.react("❌");
      return m.reply(fail("INSTAGRAM", "Error al obtener el contenido. Prueba con otro enlace."));
    }

    const isStory = url.includes("/stories/");
    const maxItems = getDlConfig()?.maxMediaItems || 5;
    const items = result.media.slice(0, maxItems);
    const totalMedia = result.media.length;
    const shownMedia = items.length;

    const fields = [["Autor", result.username && result.username !== "-" ? `@${result.username}` : undefined]];

    if (result.likes) fields.push(["Likes", `❤️ ${result.likes.toLocaleString?.() || result.likes}`]);
    if (result.comments) fields.push(["Comentarios", `💬 ${result.comments.toLocaleString?.() || result.comments}`]);
    fields.push(["Archivos", `${shownMedia} de ${totalMedia} ${totalMedia === 1 ? "medio" : "medios"}`]);

    let caption = card({
      emoji: "📸",
      title: isStory ? "𝗜𝗡𝗦𝗧𝗔𝗚𝗥𝗔𝗠 𝗦𝗧𝗢𝗥𝗬" : "𝗜𝗡𝗦𝗧𝗔𝗚𝗥𝗔𝗠",
      fields,
      footer: config.downloader?.footer || "⚓ Luffy-Ai Downloader",
    });

    for (const item of items) {
      if (item.type === "video" || item.type === "mp4") {
        await sock.sendMessage(
          m.chat,
          { video: { url: item.url }, caption },
          { quoted: m },
        );
      } else {
        await sock.sendMessage(
          m.chat,
          { image: { url: item.url }, caption },
          { quoted: m },
        );
      }
      caption = "";
    }

    trackStats("instagram");
    await m.react("✅");
  } catch (err) {
    await m.react("❌");
    return m.reply(`✿ ❌ *ꜰᴀʟʟó ᴀʟ ᴅᴇsᴄᴀʀɢᴀʀ*\n\n> ${err.message}`);
  }
}

export { pluginConfig as config, handler };