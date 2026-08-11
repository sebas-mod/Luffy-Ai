import { getAssetBuffer } from "../../src/lib/luffy-asset-manager.js";
import axios from "axios";
import config from "../../config.js";
import fs from "fs";
import te from "../../src/lib/luffy-error.js";
const NEOXR_APIKEY = config.APIkey?.neoxr || "Milik-Bot-Luffy-Ai";

const pluginConfig = {
  name: "pelicula",
  alias: ["movie", "nonton", "lk21"],
  category: "search",
  description: "Buscar películas y verlas en línea",
  usage: ".film <judul>",
  example: ".film civil war",
  cooldown: 10,
  carne: 1,
  isEnabled: true,
};

const filmSessions = new Map();

async function handler(m, { sock }) {
  const args = m.args || [];
  const query = args.join(" ").trim();

  if (!query) {
    return m.reply(
      `🎬 *ʙᴜsǫᴜᴇᴅᴀ ᴅᴇ ᴘᴇʟɪᴄᴜʟᴀs*\n\n` +
        `> Busca y mira películas en línea\n\n` +
        `*Formato:*\n` +
        `> \`${m.prefix}pelicula <título>\`\n\n` +
        `*Ejemplo:*\n` +
        `> \`${m.prefix}pelicula civil war\``,
    );
  }

  m.react("🎬");

  try {
    const apiUrl = `https://api.neoxr.eu/api/film?q=${encodeURIComponent(query)}&apikey=${NEOXR_APIKEY}`;
    const { data } = await axios.get(apiUrl, { timeout: 30000 });

    if (!data?.status || !data?.data?.length) {
      m.react("❌");
      return m.reply(
        `❌ *ɴᴏ ᴇɴᴄᴏɴᴛʀᴀᴅᴏ*\n\n> Película "${query}" no encontrada`,
      );
    }

    const films = data.data.slice(0, 10);

    filmSessions.set(m.sender, {
      films,
      timestamp: Date.now(),
    });

    setTimeout(() => {
      filmSessions.delete(m.sender);
    }, 300000);

    let text = `🎬 *ʀᴇsᴜʟᴛᴀᴅᴏs*\n\n`;
    text += `> Se encontraron *${films.length}* películas para "${query}"\n\n`;

    films.forEach((f, i) => {
      text += `*${i + 1}. ${f.title}*\n`;
      text += `> ⭐ ${f.rating} | 📺 ${f.quality} | 📅 ${f.release}\n\n`;
    });

    text += `> _Elige una película de la lista de abajo_`;

    const listItems = films.map((f, i) => ({
      header: "",
      title: f.title,
      description: `⭐ ${f.rating} | ${f.quality} | ${f.release}`,
      id: `${m.prefix}obtener_pelicula ${f.url}`,
    }));

    await sock.sendButton(
      m.chat,
      getAssetBuffer("luffy"),
      text,
      m,
      {
        buttons: [
          {
            name: "single_select",
            buttonParamsJson: JSON.stringify({
              title: "🎬 Elegir Película",
              sections: [
                {
                  title: "Resultados de Búsqueda",
                  rows: listItems,
                },
              ],
            }),
          },
        ],
        footer: "🎬 Film Search",
      },
    );

    m.react("✅");
  } catch (error) {
    m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
