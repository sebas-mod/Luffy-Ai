import axios from "axios";

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

  if (!text || !/open\.spotify\.com\/track/i.test(text)) {
    return m.reply("❌ *Vaya, ¿dónde está el enlace de Spotify o no es correcto?!*\n\nDebes ingresar un enlace válido de una canción de Spotify. Asegúrate de que sea un enlace a un track/canción! \n\nEjemplo: `.spdl https://open.spotify.com/track/3RY0NyQQXxuAiyk5eAS4fC`");
  }

  await m.react("🕕");

  try {
    const apiUrl = `https://api.nexray.eu.cc/downloader/spotify?url=${encodeURIComponent(text)}`;
    const res = await axios.get(apiUrl);
    const data = res.data;

    if (!data.status || !data.result || !data.result.url) {
      await m.react("❌");
      return m.reply("⚠️ *¡Error al obtener la canción!* \n\nEl servidor no respondió con un enlace de descarga válido.");
    }

    const { title, artist, url } = data.result;
    const filename = `${artist || "Spotify"} - ${title || "Audio"}.mp3`;

    await sock.sendMessage(m.chat, {
      audio: { url: url },
      mimetype: "audio/mpeg",
      fileName: filename,
      ptt: false
    }, { quoted: m });

    await m.react("✅");

  } catch (error) {
    console.error("[Spotify DL Error]", error);
    await m.react("❌");
    m.reply("😔 *Ocurrió un error del sistema al procesar ese enlace de Spotify.* ¡Intenta de nuevo más tarde!");
  }
}

export { pluginConfig as config, handler };
