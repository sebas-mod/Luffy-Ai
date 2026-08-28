import instagramDownloader from "../../src/scraper/ig.js";
import { card, fail, usage } from "../../src/lib/luffy-dl-ui.js";
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

  await m.react("🕕");

  try {
    const result = await instagramDownloader(url);

    if (!result?.media?.length) {
      await m.react("❌");
      return m.reply(fail("INSTAGRAM", "Error al obtener el contenido. Prueba con otro enlace."));
    }

    const isStory = url.includes("/stories/");
    const totalMedia = result.media.length;
    let caption = card({
      emoji: "📸",
      title: isStory ? "𝗜𝗡𝗦𝗧𝗔𝗚𝗥𝗔𝗠 𝗦𝗧𝗢𝗥𝗬" : "𝗜𝗡𝗦𝗧𝗔𝗚𝗥𝗔𝗠",
      fields: [
        ["Autor", result.username && result.username !== "-" ? `@${result.username}` : undefined],
        ["Descripción", result.caption],
        ["Archivos", `${totalMedia} ${totalMedia === 1 ? "medio" : "medios"}`],
      ],
      footer: "Descarga lista, a disfrutar! 🚀",
    });

    for (const item of result.media) {
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

    await m.react("✅");
  } catch (err) {
    await m.react("❌");
    return m.reply(`✿ ❌ *ꜰᴀʟʟó ᴀʟ ᴅᴇsᴄᴀʀɢᴀʀ*\n\n> ${err.message}`);
  }
}

export { pluginConfig as config, handler };
