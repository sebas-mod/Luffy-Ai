import axios from "axios";
import te from "../../src/lib/luffy-error.js";

const pluginConfig = {
  name: "spotplay",
  alias: ["splay", "sp"],
  category: "search",
  description: "Reproduce música de Spotify",
  usage: ".spotplay <query>",
  example: ".spotplay neffex grateful",
  cooldown: 15,
  carne: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const query = m.text?.trim();
  if (!query)
    return m.reply(`⚠️ *ᴄᴏᴍᴏ ᴜsᴀʀ*\n\n> \`${m.prefix}spotplay <query>\``);

  await m.react("🕕");

  try {
    const searchUrl = `https://my.izuka-api.xyz/api/search/spotify-search?query=${encodeURIComponent(query)}`;
    const searchRes = await axios.get(searchUrl, { timeout: 30000 });
    const searchData = searchRes.data;

    if (!searchData?.status || !searchData?.result || searchData.result.length === 0) {
      await m.react("❌");
      return m.reply("❌ Canción de Spotify no encontrada.");
    }

    const firstTrack = searchData.result[0];
    const dlUrl = `https://my.izuka-api.xyz/api/downloader/spotify?url=${encodeURIComponent(firstTrack.url)}`;
    const dlRes = await axios.get(dlUrl, { timeout: 30000 });
    const dlData = dlRes.data;

    if (!dlData?.status || !dlData?.result?.download_url) {
      await m.react("❌");
      return m.reply("❌ Error al obtener el enlace de descarga de la canción de Spotify.");
    }

    const result = dlData.result;

    await sock.sendMedia(m.chat, result.download_url, null, m, {
      type: "audio",
      mimetype: "audio/mpeg",
      ptt: false,
      fileName: `${result.artist || "Spotify"} - ${result.title || "audio"}.mp3`,
    });

    await m.react("✅");
  } catch (e) {
    console.error("[Spotplay Error]", e);
    await m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
