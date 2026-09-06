import axios from "axios";
import config from "../../config.js";
import { card, fail, usage, progressChain } from "../../src/lib/luffy-dl-ui.js";
import {
  trySources,
  trackStats,
  sendWithLinkButton,
} from "../../src/lib/luffy-dl-core.js";

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

  await progressChain(sock, m, ["🕕", "🎵"]);

  try {
    const dlConfig = config.downloader?.spotify || {};
    const viaApi = await trySources(
      dlConfig.sources || [
        `https://api.nexray.eu.cc/downloader/spotify?url={url}`,
      ],
      { url: text },
      (data) => (data?.status && data?.result?.url ? data.result : null),
      { timeout: 60000 },
    );

    if (!viaApi?.picked) {
      await m.react("❌");
      return m.reply(fail("SPOTIFY", "El servidor no respondió con un enlace de descarga válido."));
    }

    const { title, artist, url, cover, thumbnail, image, duration } = viaApi.picked;
    const filename = `${artist || "Spotify"} - ${title || "Audio"}.mp3`;
    const coverUrl = cover || thumbnail || image || "";

    const caption = card({
      emoji: "🎵",
      title: "𝗦𝗣𝗢𝗧𝗜𝗙𝗬",
      fields: [
        ["Canción", title],
        ["Artista", artist],
        ["Formato", "MP3 (.mp3)"],
        ...(duration ? [["Duración", String(duration)]] : []),
      ],
      footer: config.downloader?.footer || "⚓ Luffy-Ai Downloader",
    });

    if (coverUrl) {
      try {
        await sock.sendMessage(
          m.chat,
          { image: { url: coverUrl }, caption },
          { quoted: m },
        );
      } catch {}
    }

    await sendWithLinkButton(sock, m.chat, m, {
      caption,
      url,
      buttonText: "🎵 Descargar MP3",
    });

    await sock.sendMessage(m.chat, {
      audio: { url },
      mimetype: "audio/mpeg",
      fileName: filename,
      ptt: false,
      caption,
    }, { quoted: m });

    trackStats("spotify");
    await m.react("✅");
  } catch (error) {
    console.error("[Spotify DL Error]", error);
    await m.react("❌");
    m.reply("♰ ┄ ── ☽◯☾ ── ┄ ♰\n😔 *Ocurrió un error del sistema al procesar ese enlace de Spotify.* ¡Intenta de nuevo más tarde!");
  }
}

export { pluginConfig as config, handler };