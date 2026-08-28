import { aiodl } from "../../src/scraper/aio.js";
import te from "../../src/lib/luffy-error.js";
import { saluranCtx } from "../../src/lib/luffy-context.js";
import { card, fail, usage } from "../../src/lib/luffy-dl-ui.js";

const pluginConfig = {
  name: "aio",
  alias: ["allinone", "download", "dl"],
  category: "downloader",
  description:
    "Descargador todo en uno (IG, TikTok, FB, Twitter, YouTube, Pinterest, CapCut, etc.)",
  usage: ".aio <url>",
  example: ".aio https://instagram.com/p/xxx",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  carne: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const url = m.text?.trim();

  if (!url) {
    return m.reply(
      `🌐 *𝗔𝗟𝗟 𝗜𝗡 𝗢𝗡𝗘*\n──────────\n` +
        `> ¡Descarga desde varias plataformas en un solo comando!\n\n` +
        `╭┈┈⬡「 🗂️ *PLATAFORMAS* 」\n` +
        `┃ • Instagram\n` +
        `┃ • TikTok\n` +
        `┃ • Facebook\n` +
        `┃ • Twitter/X\n` +
        `┃ • YouTube\n` +
        `┃ • Pinterest\n` +
        `┃ • CapCut\n` +
        `┃ • Threads / Reddit\n` +
        `╰┈┈┈┈┈┈┈┈⬡\n\n` +
        usage(m.prefix, "aio", "https://instagram.com/p/xxx"),
    );
  }

  if (!url.startsWith("http")) {
    m.react("❌");
    return m.reply(fail("ALL IN ONE", "URL no válida! Debe empezar con http/https"));
  }

  await m.react("🕕");

  try {
    const result = await aiodl(url);

    if (!result?.media?.length) {
      await m.react("❌");
      return m.reply(fail("ALL IN ONE", "Error al obtener el contenido. Asegúrate de que la URL sea válida."));
    }

    const ctxInfo = saluranCtx();
    const first = result.media[0];
    const caption = card({
      emoji: "🌐",
      title: "𝗔𝗟𝗟 𝗜𝗡 𝗢𝗡𝗘",
      fields: [
        ["Plataforma", result.platform],
        ["Título", result.title],
        ["Autor", result.author],
        ["Audios/Videos", String(result.media.length) + " archivo(s)"],
      ],
      footer: "Descarga completada, a disfrutar! 🚀",
    });

    for (const item of result.media) {
      if (item.type === "video") {
        await sock.sendMedia(m.chat, item.url, caption, m, {
          type: "video",
          contextInfo: ctxInfo,
        });
      } else if (item.type === "audio") {
        await sock.sendMessage(
          m.chat,
          {
            audio: { url: item.url },
            mimetype: "audio/mpeg",
            caption,
            contextInfo: ctxInfo,
          },
          { quoted: m },
        );
      } else {
        await sock.sendMedia(m.chat, item.url, caption, m, {
          type: "image",
          contextInfo: ctxInfo,
        });
      }
      break;
    }

    await m.react("✅");
  } catch (error) {
    await m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
