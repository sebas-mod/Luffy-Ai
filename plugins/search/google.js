import { GoogleSearch } from "../../src/scraper/google.js";

const pluginConfig = {
  name: "google",
  alias: ["gsearch", "googlenews"],
  category: "search",
  description: "Buscar noticias en Google News",
  usage: ".google <query>",
  example: ".google terremoto de hoy",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  carne: 0,
  isEnabled: true,
};

async function handler(m) {
  const query = m.text?.trim();

  if (!query) {
    m.react("❌");
    return m.reply(
        `╭━━━〔 🔍 Google News 〕━━━╮\n\n` +
        `Busca las noticias más recientes de Google News.\n\n` +
        `*USO:*\n` +
        `> *${m.prefix}google <tema>*\n\n` +
        `*EJEMPLO:*\n` +
        `> *${m.prefix}google terremoto de hoy*\n` +
        `> *${m.prefix}google teknologi terbaru*\n\n╰━━━━━━━━━━━━╯`,
    );
  }

  m.react("🕕");

  try {
    const result = await GoogleSearch(query);

    if (!result.status) {
      m.react("☢");
      return m.reply(`╰┈➤ ❌ *Google Falló*\n\n> ${result.error}`);
    }

    const items = result.results.slice(0, 10);

    if (items.length === 0) {
      m.react("☢");
      return m.reply(`╰┈➤ ❌ No se encontraron resultados para: *${query}*`);
    }

    let txt = `╭━━━〔 🔍 GOOGLE NEWS 〕━━━╮\n──────────\n`;
    txt += `> Búsqueda: *${query}*\n\n`;

    items.forEach((item) => {
      txt += `*${item.index_node}.* ${item.resource_title}\n`;
      txt += `› 📰 ${item.origin_node}\n`;
      txt += `› 🕐 ${item.temporal_stamp}\n`;
      txt += `   └ 🔗 ${item.resolved_endpoint}\n\n`;
    });

    m.reply(txt.trim());
    m.react("✅");
  } catch (e) {
    console.error(e);
    m.react("☢");
    m.reply("╰┈➤ ❌ Error al buscar en Google, inténtalo de nuevo más tarde");
  }
}

export { pluginConfig as config, handler };
