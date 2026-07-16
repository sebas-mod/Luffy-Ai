import { downloadMediaMessage, getContentType } from "ourin";
import { ImageUploadService } from "node-upload-images";
import axios from "axios";

const pluginConfig = {
  name: "musiccard",
  alias: ["mcard", "spotifycard"],
  category: "canvas",
  description: "Crea una genial tarjeta musical a partir de una imagen.",
  usage: ".musiccard <título>|<artista>",
  example: ".musiccard Binks no Sake|Luffy",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 2,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const text = m.text?.trim();

  let mediaBuffer = null;
  let mimetype = null;

  if (m.quoted?.message) {
    const type = getContentType(m.quoted.message);
    if (type !== "imageMessage") {
      return m.reply("❌ *¡Eso no es una imagen!*\n\nResponde a un mensaje con *imagen* usando el formato `.musiccard <título>|<artista>`.\n\nEjemplo:\nResponde a una imagen y escribe: `.musiccard Binks no Sake|Luffy`");
    }
    try {
      mediaBuffer = await downloadMediaMessage(
        { key: m.quoted.key, message: m.quoted.message },
        "buffer",
        {}
      );
      mimetype = m.quoted.message[type]?.mimetype;
    } catch (e) {
      return m.reply("😔 *No se pudo descargar la imagen.* ¡Vuelve a enviarla, nakama!");
    }
  } else if (m.message) {
    const type = getContentType(m.message);
    if (type !== "imageMessage") {
      return m.reply("❌ *¡Falta la imagen!*\n\nEnvía una imagen con el texto `.musiccard <título>|<artista>` o responde a una imagen existente.\n\nEjemplo:\nEnvía una imagen con: `.musiccard Binks no Sake|Luffy`");
    }
    try {
      mediaBuffer = await downloadMediaMessage(
        { key: m.key, message: m.message },
        "buffer",
        {}
      );
      mimetype = m.message[type]?.mimetype;
    } catch (e) {
      return m.reply("😔 *No se pudo descargar la imagen.* ¡Vuelve a enviarla, nakama!");
    }
  }

  if (!mediaBuffer) {
    return m.reply("❌ *¡No se detectó ninguna imagen!* Asegúrate de enviarla correctamente.");
  }

  if (!text) {
    return m.reply("❌ *¡Falta el título o el artista!*\n\nEl formato correcto es: `.musiccard <título>|<artista>`\nSepara el título y el artista con una barra vertical ( | ).");
  }

  let judul = text;
  let nama = "Artista desconocido";

  if (text.includes("|")) {
    const parts = text.split("|");
    judul = parts[0].trim();
    nama = parts[1].trim() || m.pushName;
  }

  await m.react("🕕");

  try {

    const service = new ImageUploadService("pixhost.to");
    const uploadResult = await service.uploadFromBinary(mediaBuffer, "img.jpg");

    if (!uploadResult || !uploadResult.directLink) {
      await m.react("❌");
      return m.reply("⚠️ *¡No se pudo subir la imagen!* Verifica que no sea demasiado grande e inténtalo otra vez.");
    }

    const apiUrl = `https://api.nexray.eu.cc/canvas/musiccard?judul=${encodeURIComponent(judul)}&nama=${encodeURIComponent(nama)}&image_url=${encodeURIComponent(uploadResult.directLink)}`;

    const res = await axios.get(apiUrl, {
      responseType: "arraybuffer",
      timeout: 30000
    });

    if (res.headers["content-type"] && !res.headers["content-type"].includes("image")) {
      await m.react("❌");
      return m.reply("⚠️ *No se pudo crear la tarjeta musical.* El servidor respondió con un formato incorrecto.");
    }

    const cardBuffer = Buffer.from(res.data);

    await sock.sendMessage(m.chat, {
      image: cardBuffer,
      caption: `✨ *¡TARJETA MUSICAL CREADA!* ✨\n\n🎧 *Título*: ${judul}\n🎤 *Artista*: ${nama}\n\n¡Quedó genial! Compártela con tu tripulación. 🚀`
    }, { quoted: m });

    await m.react("✅");

  } catch (err) {
    console.error("[Music Card]", err.message);
    await m.react("☢");
    m.reply("😔 *Ocurrió un problema en el sistema.*\n\nNo se pudo contactar al servidor que crea la tarjeta. ¡Inténtalo de nuevo en un momento!");
  }
}

export { pluginConfig as config, handler };
