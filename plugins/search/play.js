import axios from "axios";
import yts from "yt-search";
import config from "../../config.js";

const pluginConfig = {
  name: "play",
  alias: ["playaudio"],
  category: "search",
  description: "Reproduce música de YouTube",
  usage: ".play <query>",
  example: ".play komang",
  cooldown: 15,
  carne: 1,
  isEnabled: true,
};

function formatViews(n) {
  if (!n) return "0";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toString();
}

async function handler(m, { sock, text }) {
  const query = m.text?.trim();
  if (!query)
    return m.reply(`🎵 *ᴘʟᴀʏ*\n\n> Ejemplo:\n\`${m.prefix}play komang\``);

  m.react("🕐");

  try {
    const search = await yts(query);
    if (!search.videos.length) throw new Error("Video no encontrado");
    const video = search.videos[0];

    const res = await axios.get(`https://api.azbry.com/api/download/ytmp3?url=${encodeURIComponent(video.url)}`, { timeout: 60000 });
    const data = res.data;
    
    if (!data.status || !data.result || !data.result.download) {
       throw new Error("Error al obtener el audio de la API");
    }

    let info = `🎵 *SONANDO AHORA*\n\n`;
    info += `📌 *Título:* ${video.title}\n\n`;
    info += `*DETALLE*\n`;
    info += `👤 Canal: *${video.author.name}*\n`;
    info += `⏱️ Duración: *${video.duration.timestamp}*\n`;
    info += `👀 Vistas: *${formatViews(video.views)}*\n`;
    info += `📅 Subido: *${video.ago}*\n`;
    info += `🆔 ID: \`${video.videoId}\`\n\n`;
    if (video.description) {
      const desc = video.description.substring(0, 150).replace(/\n/g, " ");
      info += `*Descripción:*\n_${desc}${video.description.length > 150 ? "..." : ""}_\n\n`;
    }
    info += `🔗 ${video.url}\n\n`;
    info += `_⏳ enviando audio, por favor espera..._`;

    await sock.sendPreview(
      m.chat,
      {
        caption: `${info}`,
        url: video.url,
        title: video.title,
        description: "Video de YouTube",
        image: video.thumbnail,
        previewType: 1,
      },
      {
        quoted: m,
      },
    );

    const audioRes = await axios.get(data.result.download, { responseType: "arraybuffer", timeout: 60000 });
    const audioBuffer = Buffer.from(audioRes.data);

    await sock.sendMessage(
      m.chat,
      {
        audio: audioBuffer,
        mimetype: "audio/mpeg",
        ptt: false,
        fileName: `${video.title}.mp3`,
      },
      { quoted: m },
    );

    m.react("✅");
  } catch (err) {
    console.error("[Play]", err);
    m.react("😭");
    m.reply(
      `Uy, la función de reproducir música tiene un problema, intenta de nuevo más tarde, no hagas spam`,
    );
  }
}

export { pluginConfig as config, handler };
