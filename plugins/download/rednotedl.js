import { RedNoteDL } from "../../src/scraper/rednote.js";
import { card, fail, usage } from "../../src/lib/luffy-dl-ui.js";

const pluginConfig = {
  name: "rednotedl",
  alias: ["rednote", "xhsdl", "xiaohongshu"],
  category: "download",
  description: "Descarga videos/fotos de RedNote (XiaoHongShu)",
  usage: ".rednotedl <url>",
  example: ".rednotedl https://www.xiaohongshu.com/xxx",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  carne: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const text = m.text?.trim();
  if (!text) {
    m.react("❌");
    return m.reply(
      `📕 *𝗥𝗘𝗗𝗡𝗢𝗧𝗘*\n` +
        `> Descarga videos o fotos de XiaoHongShu (RedNote).` +
        usage(m.prefix, "rednotedl", "https://www.xiaohongshu.com/xxx"),
    );
  }

  m.react("🕕");

  try {
    const result = await RedNoteDL(text);

    if (!result.status) {
      m.react("☢");
      return m.reply(fail("REDNOTE", result.error || "Error al obtener el contenido."));
    }

    const caption = card({
      emoji: "📕",
      title: "𝗥𝗘𝗗𝗡𝗢𝗧𝗘",
      fields: [
        ["Título", result.title],
        ["Autor", result.author],
        ["Tipo", result.type === "video" ? "Video (.mp4)" : "Fotos"],
        ["Archivos", result.results?.length ? `${result.results.length}` : undefined],
      ],
      footer: "Descarga lista, a disfrutar! 🚀",
    });

    if (result.type === "video" && result.results?.[0]) {
      await sock.sendMedia(m.chat, result.results[0], caption, m, {
        type: "video",
      });
    } else if (result.results?.length > 0) {
      await sock.sendMedia(m.chat, result.results[0], caption, m, {
        type: "image",
      });
      for (let i = 1; i < Math.min(result.results.length, 5); i++) {
        await sock.sendMedia(m.chat, result.results[i], "", m, {
          type: "image",
        });
      }
      if (result.results.length > 5) {
        await m.reply(
          `⏳ _Aún quedan ${result.results.length - 5} fotos más, máximo 5_`,
        );
      }
    }

    m.react("✅");
  } catch (e) {
    console.error(e);
    m.react("☢");
    m.reply(fail("REDNOTE", "Error al obtener los datos de RedNote, intenta de nuevo más tarde"));
  }
}

export { pluginConfig as config, handler };
