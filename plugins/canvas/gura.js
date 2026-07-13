import FormData from "form-data";
import fetch from "node-fetch";
import mime from "mime-types";
import { downloadMediaMessage, getContentType } from "ourin";
import te from "../../src/lib/ourin-error.js";

const pluginConfig = {
  name: "gura",
  alias: ["guracanvas"],
  category: "canvas",
  description: "Aplica el efecto Gura a tu foto.",
  usage: ".gura (responde/envía una foto)",
  example: ".gura",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 1,
  isEnabled: true,
};

async function uploadToCatbox(buffer, filename = "file.jpg") {
  const form = new FormData();
  form.append("reqtype", "fileupload");
  form.append("fileToUpload", buffer, {
    filename,
    contentType: mime.lookup(filename) || "image/jpeg",
  });

  const res = await fetch("https://catbox.moe/user/api.php", {
    method: "POST",
    body: form,
    headers: form.getHeaders(),
    timeout: 30000,
  });

  if (!res.ok) throw new Error("Error de Catbox");
  const url = await res.text();
  if (!url.startsWith("http")) throw new Error("Invalid response");
  return url;
}

async function handler(m, { sock }) {
  let media = null;

  if (m.quoted?.message) {
    const type = getContentType(m.quoted.message);
    if (!type || type !== "imageMessage") {
      return m.reply("⚠️ ¡Responde a un mensaje con imagen, nakama!");
    }
    media = await downloadMediaMessage(m.quoted, "buffer", {});
  } else if (m.message) {
    const type = getContentType(m.message);
    if (!type || type !== "imageMessage") {
      return m.reply(`🦈 *GURA CANVAS*\n\nEnvía o responde a una foto con \`${m.prefix}gura\` para aplicarle el efecto Gura.`);
    }
    media = await downloadMediaMessage(m, "buffer", {});
  }

  if (!media) return m.reply("❌ No pude leer la imagen. ¡Inténtalo otra vez!");

  await m.react("🕕");

  try {
    const imgUrl = await uploadToCatbox(media);

    const apiUrl = `https://api.nexray.eu.cc/canvas/gura?url=${encodeURIComponent(imgUrl)}`;
    const res = await fetch(apiUrl);
    
    if (!res.ok) throw new Error("API Nexray error");
    
    const buffer = Buffer.from(await res.arrayBuffer());

    await sock.sendMessage(m.chat, { image: buffer, caption: "🦈 *¡RAWWRR! Gura ya está aquí!*" }, { quoted: m });
    await m.react("✅");

  } catch (err) {
    await m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
