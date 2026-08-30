import te from "../../src/lib/luffy-error.js";
import config from "../../config.js";
import axios from "axios";
import { uploadImage } from "../../src/lib/luffy-uploader.js";

const pluginConfig = {
  name: "starboy",
  alias: ["canvasstarboy", "efekstarboy"],
  category: "canvas",
  description: "Crea una imagen con efecto Starboy desde una foto",
  usage: ".starboy <responde/envía foto>",
  example: ".starboy",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  carne: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg || q).mimetype || "";

  if (!mime.startsWith("image/")) {
    return m.reply(
      `🌟 *S T A R B O Y*\n\n> Envía una imagen con caption *${m.prefix + m.command}* o responde a una imagen ya enviada.`,
    );
  }

  m.react("🕕");

  try {
    const media = await q.download();
    if (!media) throw new Error("Error al descargar el medio");

    const imageUrl = await uploadImage(media);
    if (!imageUrl) throw new Error("Error al subir la imagen");

    const url = `https://api.cuki.biz.id/api/canvas/starboy?apikey=${config.APIkey.cuki}&image=${encodeURIComponent(imageUrl)}`;
    
    const { data } = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 30000
    });

    const imageBuffer = Buffer.from(data, 'binary');

    m.react("✅");
    await sock.sendMessage(m.chat, { 
      image: imageBuffer, 
      caption: `♰ ┄ ── ☽◯☾ ── ┄ ♰\n🌟 *S T A R B O Y*\n♰ ┄ ── ☽◯☾ ── ┄ ♰` 
    }, { quoted: m });
  } catch (error) {
    console.log(error);
    m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
