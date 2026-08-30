import axios from "axios";
import { card, fail, usage } from "../../src/lib/luffy-dl-ui.js";

const pluginConfig = {
  name: "spotifydl",
  alias: ["spdl", "spotify-dl", "spotdl"],
  category: "download",
  description: "Descarga tus canciones favoritas directamente desde Spotify sin complicaciones!",
  usage: ".spdl <link>",
  example: ".spdl https://open.spotify.com/track/...",
  cooldown: 15,
  carne: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const text = m.text?.trim();

  if (!text) {
    return m.reply(
      `🎵 *𝗦𝗣𝗢𝗧𝗜𝗙𝗬*\n──────────\n` +
        `> Descarga tus canciones favoritas de Spotify en MP3\n\n` +
        usage(m.prefix, "spdl", "https://open.spotify.com/track/...")
    );
  }

  if (!/open\.spotify\.com\/track/i.test(text)) {
    m.react("❌");
    return m.reply(
      fail("SPOTIFY", "URL no válida. Debe ser un enlace a un track/canción de Spotify.")
    );
  }

  await m.react("🕕");

  try {
    const apiUrl = `https://api.nexray.eu.cc/downloader/spotify?url=${encodeURIComponent(text)}`;
    const res = await axios.get(apiUrl);
    const data = res.data;

    if (!data.status || !data.result || !data.result.url) {
      await m.react("❌");
      return m.reply(fail("SPOTIFY", "El servidor no respondió con un enlace de descarga válido."));
    }

    const { title, artist, url } = data.result;
    const filename = `${artist || "Spotify"} - ${title || "Audio"}.mp3`;

    const caption = card({
      emoji: "🎵",
      title: "𝗦𝗣𝗢𝗧𝗜𝗙𝗬",
      fields: [
        ["Canción", title],
        ["Artista", artist],
        ["Formato", "MP3 (.mp3)"],
      ],
      footer: "¡Que disfrutes de tu música! 🎧",
    });

    await sock.sendMessage(m.chat, {
      audio: { url: url },
      mimetype: "audio/mpeg",
      fileName: filename,
      ptt: false,
      caption,
    }, { quoted: m });

    await m.react("✅");

  } catch (error) {
    console.error("[Spotify DL Error]", error);
    await m.react("❌");
    m.reply("♰ ┄ ── ☽◯☾ ── ┄ ♰\n😔 *Ocurrió un error del sistema al procesar ese enlace de Spotify.* ¡Intenta de nuevo más tarde!");
  }
}

export { pluginConfig as config, handler };
