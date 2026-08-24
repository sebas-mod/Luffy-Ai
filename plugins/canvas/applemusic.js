import axios from "axios";
import FormData from "form-data";

const pluginConfig = {
  name: "applemusic-canvas",
  alias: ["applemusic", "applecanvas"],
  category: "canvas",
  description: "Crea una imagen de reproductor Apple Music desde una foto",
  usage: ".applemusic-canvas título | artista (responde imagen)",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  carne: 2,
  isEnabled: true,
};

async function uploadImage(buffer) {
  const form = new FormData();
  form.append('file', buffer, { filename: 'image.jpg', contentType: 'image/jpeg' });
  
  const response = await axios.post('https://c.termai.cc/api/upload?key=AIzaBj7z2z3xBjsk', form, {
      headers: form.getHeaders(),
      timeout: 30000
  });
  
  if (response.data?.path) {
      return response.data.path;
  } else if (response.data?.files && response.data.files[0]?.url) {
      return response.data.files[0].url;
  }
  
  throw new Error('Error al subir la imagen');
}

async function handler(m, { sock, text }) {
  const isImage = m.isImage || (m.quoted && m.quoted.type === "imageMessage");
  
  if (!isImage || !text || !text.includes("|")) {
    let help = `🎵 *APPLE MUSIC CANVAS*\n\n`
    help += `Esta función se usa para crear un diseño genial de reproductor de canciones de Apple Music con tu imagen!\n\n`
    help += `*Cómo Usarlo:*\n`
    help += `- Envía una imagen con caption *${m.prefix}applemusic-canvas Título de la Canción | Nombre del Artista*\n`
    help += `- O responde una imagen con el mensaje *${m.prefix}applemusic-canvas Título de la Canción | Nombre del Artista*\n\n`
    help += `*Ejemplo:* ${m.prefix}applemusic-canvas Glimpse of Us | Joji`
    return m.reply(help);
  }
  
  await m.react("🕕");
  
  try {
    let [title, artist] = text.split("|").map(s => s.trim());
    
    let buffer;
    if (m.quoted && m.quoted.isMedia) {
      buffer = await m.quoted.download();
    } else if (m.isMedia) {
      buffer = await m.download();
    }
    
    if (!buffer) {
      await m.react("❌");
      return m.reply(`╭━━━〔 ✦ 〕━━━╮\n😔 Lo siento, el sistema no pudo descargar la imagen de portada que enviaste.\n╰━━━━━━━━━━━━╯`);
    }

    const coverUrl = await uploadImage(buffer);
    
    const apiUrl = `https://my.izuka-api.xyz/api/canvas/apple-music?title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}&coverUrl=${encodeURIComponent(coverUrl)}`;
    
    const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
    
    await sock.sendMessage(m.chat, { image: Buffer.from(response.data) }, { quoted: m });
    await m.react("✅");

  } catch (error) {
    console.error("[APPLEMUSIC Plugin Error]", error);
    await m.react("❌");
    m.reply(`╭━━━〔 ✦ 〕━━━╮\n😔 Lo siento, no se pudo crear el canvas de Apple Music. Inténtalo de nuevo en unos momentos.\n╰━━━━━━━━━━━━╯`);
  }
}

export { pluginConfig as config, handler };
