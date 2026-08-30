import { downloadMediaMessage, getContentType } from "ourin";
import { ImageUploadService } from "node-upload-images";
import axios from "axios";

const pluginConfig = {
  name: "musiccard",
  alias: ["mcard", "spotifycard"],
  category: "maker",
  description: "Crea una tarjeta de música (music card) genial a partir de la imagen enviada.",
  usage: ".musiccard <título>|<nombre del artista>",
  example: ".musiccard Rewrite The Stars|James Arthur",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  carne: 2,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const text = m.text?.trim();

  let mediaBuffer = null;
  let mimetype = null;

  if (m.quoted?.message) {
    const type = getContentType(m.quoted.message);
    if (type !== "imageMessage") {
      return m.reply("♰ ┄ ── ☽◯☾ ── ┄ ♰\n❌ *¡Vaya, eso no es una imagen!*\n\nDebes responder (responder) un mensaje que sea *imagen* con el formato `.musiccard <título>|<artista>`.\n──────────\n☽◯☾ ♰ Ejemplo:\nResponde a la imagen de tu amigo y luego escribe: `.musiccard Perfect|Ed Sheeran`");
    }
    try {
      mediaBuffer = await downloadMediaMessage(
        { key: m.quoted.key, message: m.quoted.message },
        "buffer",
        {}
      );
      mimetype = m.quoted.message[type]?.mimetype;
    } catch (e) {
      return m.reply("♰ ┄ ── ☽◯☾ ── ┄ ♰\n😔 *No se pudo descargar la imagen.* Intenta enviar la imagen de nuevo.");
    }
  } else if (m.message) {
    const type = getContentType(m.message);
    if (type !== "imageMessage") {
      return m.reply("♰ ┄ ── ☽◯☾ ── ┄ ♰\n❌ *¡Vaya, ¿dónde está la imagen?*\n\nDebes enviar una imagen con caption (texto complementario) `.musiccard <título>|<artista>` o responder a una imagen existente.\n──────────\n☽◯☾ ♰ Ejemplo:\nEnvía una imagen con caption: `.musiccard Perfect|Ed Sheeran`");
    }
    try {
      mediaBuffer = await downloadMediaMessage(
        { key: m.key, message: m.message },
        "buffer",
        {}
      );
      mimetype = m.message[type]?.mimetype;
    } catch (e) {
      return m.reply("♰ ┄ ── ☽◯☾ ── ┄ ♰\n😔 *No se pudo descargar la imagen.* Intenta enviar la imagen de nuevo.");
    }
  }

  if (!mediaBuffer) {
    return m.reply("♰ ┄ ── ☽◯☾ ── ┄ ♰\n❌ *¡Imagen no detectada!* Asegúrate de enviar la imagen correctamente.");
  }

  if (!text) {
    return m.reply("♰ ┄ ── ☽◯☾ ── ┄ ♰\n❌ *¡Faltan el título y el artista!*\n\nEl formato correcto es: `.musiccard <título>|<artista>`\nSepara el título y el nombre del artista con el símbolo ( | ).\n──────────");
  }

  let judul = text;
  let nama = "Unknown Artist";

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
      return m.reply("♰ ┄ ── ☽◯☾ ── ┄ ♰\n⚠️ *¡No se pudo subir la imagen!* Asegúrate de que la imagen no sea demasiado grande e inténtalo de nuevo.");
    }

    const apiUrl = `https://api.nexray.eu.cc/canvas/musiccard?judul=${encodeURIComponent(judul)}&nama=${encodeURIComponent(nama)}&image_url=${encodeURIComponent(uploadResult.directLink)}`;

    const res = await axios.get(apiUrl, {
      responseType: "arraybuffer",
      timeout: 30000
    });

    if (res.headers["content-type"] && !res.headers["content-type"].includes("image")) {
      await m.react("❌");
      return m.reply("♰ ┄ ── ☽◯☾ ── ┄ ♰\n⚠️ *No se pudo crear la Music Card.* El servidor respondió con un formato incorrecto.");
    }

    const cardBuffer = Buffer.from(res.data);

    await sock.sendMessage(m.chat, {
      image: cardBuffer,
      caption: `♰ ┄ ── ☽◯☾ ── ┄ ♰\n✨ *MUSIC CARD CREADA CON ÉXITO!* ✨\n🎧 *Título*: ${judul}\n🎤 *Artista*: ${nama}\n──────────\n☽◯☾ ♰ El resultado es genial, ¡presúmelo con tus amigos! 🚀`
    }, { quoted: m });

    await m.react("✅");

  } catch (err) {
    console.error("[Music Card]", err.message);
    await m.react("☢");
    m.reply("♰ ┄ ── ☽◯☾ ── ┄ ♰\n😔 *Hubo un problema en nuestro sistema.* \n\nEl sistema no pudo conectar con el servidor creador de tarjetas. Por favor, inténtalo de nuevo en unos momentos.\n──────────");
  }
}

export { pluginConfig as config, handler };
