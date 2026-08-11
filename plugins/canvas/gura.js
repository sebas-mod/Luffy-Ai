import FormData from "form-data";
import fetch from "node-fetch";
import mime from "mime-types";
import { downloadMediaMessage, getContentType } from "ourin";
import te from "../../src/lib/luffy-error.js";

const pluginConfig = {
  name: "gura",
  alias: ["guracanvas"],
  category: "canvas",
  description: "Crea un efecto canvas Gura a partir de tu foto",
  usage: ".gura (reply/kirim foto)",
  example: ".gura",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  carne: 1,
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

  if (!res.ok) throw new Error("Error en Catbox");
  const url = await res.text();
  if (!url.startsWith("http")) throw new Error("Invalid response");
  return url;
}

async function handler(m, { sock }) {
  let media = null;

  if (m.quoted?.message) {
    const type = getContentType(m.quoted.message);
    if (!type || type !== "imageMessage") {
      return m.reply("⚠️ ¡Oye, responde a un mensaje de imagen por favor!");
    }
    media = await downloadMediaMessage(m.quoted, "buffer", {});
  } else if (m.message) {
    const type = getContentType(m.message);
    if (!type || type !== "imageMessage") {
      return m.reply(`🦈 *GURA CANVAS*\n\nEnvía o responde una foto con el comando \`${m.prefix}gura\` para darle el efecto Gura!`);
    }
    media = await downloadMediaMessage(m, "buffer", {});
  }

  if (!media) return m.reply("❌ No se pudo leer el medio, ¡inténtalo de nuevo!");

  await m.react("🕕");

  try {
    const imgUrl = await uploadToCatbox(media);

    const apiUrl = `https://api.nexray.eu.cc/canvas/gura?url=${encodeURIComponent(imgUrl)}`;
    const res = await fetch(apiUrl);
    
    if (!res.ok) throw new Error("API Nexray error");
    
    const buffer = Buffer.from(await res.arrayBuffer());

    await sock.sendMessage(m.chat, { image: buffer, caption: "🦈 *RAWWRR! Gura is here!*" }, { quoted: m });
    await m.react("✅");

  } catch (err) {
    await m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
