import axios from "axios";
import config from "../../config.js";
import { card, fail, usage, progressChain } from "../../src/lib/luffy-dl-ui.js";
import { trackStats } from "../../src/lib/luffy-dl-core.js";

const pluginConfig = {
  name: "spotifysearch",
  alias: ["sps", "spsearch", "buscarspotify"],
  category: "download",
  description: "Busca canciones en Spotify y descárgalas en MP3 con un botón",
  usage: ".spotifysearch <nombre de la canción>",
  example: ".spotifysearch christina perri a thousand years",
  cooldown: 10,
  carne: 1,
  isEnabled: true,
};

function msToTime(ms) {
  const s = Math.floor((ms || 0) / 1000);
  const m = Math.floor(s / 60);
  const sec = String(s % 60).padStart(2, "0");
  return `${m}:${sec}`;
}

function pickTracks(data) {
  if (Array.isArray(data?.result?.tracks) && data.result.tracks.length) {
    return data.result.tracks.map((t) => ({
      name: t.name,
      artists: (t.artists || []).map((a) => a.name).join(", "),
      url: t.url,
      duration: msToTime(t.duration_ms),
      cover: t.album?.images?.[0]?.url || null,
      explicit: !!t.explicit,
    }));
  }
  if (Array.isArray(data?.result?.top_results)) {
    return data.result.top_results
      .filter((t) => t.type === "Track" && t.url)
      .map((t) => ({
        name: t.name,
        artists: "",
        url: t.url,
        duration: "",
        cover: null,
        explicit: false,
      }));
  }
  return [];
}

async function handler(m, { sock }) {
  const query = m.text?.trim();
  if (!query)
    return m.reply(
      `🎵 *𝗦𝗣𝗢𝗧𝗜𝗙𝗬 𝗦𝗘𝗔𝗥𝗖𝗛*\n──────────\n` +
        `> Busca canciones en Spotify y descárgalas en MP3 tocando un botón.\n\n` +
        usage(m.prefix, "spotifysearch", "a thousand years"),
    );

  await progressChain(sock, m, ["🕕", "🔍"]);

  try {
    const apiKey =
      config.downloader?.spotifySearchKey || config.downloader?.apiKey || "sebasapi2024";
    const searchUrl = `https://api-yosoyyo-api-ofc.onrender.com/api/spotifysearch?q=${encodeURIComponent(query)}&apiKey=${encodeURIComponent(apiKey)}`;

    const { data } = await axios.get(searchUrl, { timeout: 30000 });
    const tracks = pickTracks(data);

    if (!tracks.length) {
      await m.react("❌");
      return m.reply(fail("SPOTIFY SEARCH", "No se encontró ninguna canción con esa búsqueda."));
    }

    const top = tracks.slice(0, 5);
    const caption = card({
      emoji: "🎵",
      title: "𝗦𝗣𝗢𝗧𝗜𝗙𝗬 𝗦𝗘𝗔𝗥𝗖𝗛",
      fields: [
        ["Búsqueda", `"${query}"`],
        ["Resultados", `${tracks.length} encontrados · tocá un botón para descargar`],
      ],
      footer: config.downloader?.footer || "⚓ Luffy-Ai Downloader",
    });

    const buttons = top.map((t, i) => ({
      name: "quick_reply",
      buttonParamsJson: JSON.stringify({
        display_text: `🎵 ${i + 1}. ${t.name}${t.artists ? ` - ${t.artists}` : ""}`.slice(0, 35),
        id: `${m.prefix}spotifydl ${t.url}`,
      }),
    }));

    await sock.sendMessage(
      m.chat,
      { text: caption, interactiveButtons: buttons },
      { quoted: m },
    );

    trackStats("spotify_search");
    await m.react("✅");
  } catch (err) {
    console.error("[Spotify Search Error]", err.message);
    await m.react("❌");
    m.reply(fail("SPOTIFY SEARCH", "Error al buscar la canción. Intenta de nuevo más tarde."));
  }
}

export { pluginConfig as config, handler };