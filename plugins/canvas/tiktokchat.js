import axios from "axios";
import FormData from "form-data";

const pluginConfig = {
  name: "tiktokchat",
  alias: ["tiktok-chat", "ttchat"],
  category: "canvas",
  description: "Crea un fake chat de TikTok con tu avatar",
  usage: ".tiktokchat usuario | mensaje (responde imagen)",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  carne: 2,
  isEnabled: true,
};

async function handler(m, { sock, text }) {
  const isImage = m.isImage || (m.quoted && m.quoted.type === "imageMessage");

  if (!isImage || !text || !text.includes("|")) {
    let help = `💬 *TIKTOK CHAT CANVAS*\n\n`
    help += `Esta función se usa para crear un diseño de chat falso estilo TikTok, ¡muy estético!\n\n`
    help += `*Cómo Usarlo:*\n`
    help += `- Envía una foto de perfil (avatar) con caption *${m.prefix}tiktokchat usuario | tu mensaje*\n`
    help += `- O responde a la foto de perfil con el mensaje *${m.prefix}tiktokchat usuario | tu mensaje*\n\n`
    help += `*Ejemplo:* ${m.prefix}tiktokchat Zann | Hola, hoy está soleado!`
    return m.reply(help);
  }

  await m.react("🕕");

  try {
    let [username, ...msgParts] = text.split("|");
    username = username.trim();
    const message = msgParts.join("|").trim();

    let buffer;
    if (m.quoted && m.quoted.isMedia) {
      buffer = await m.quoted.download();
    } else if (m.isMedia) {
      buffer = await m.download();
    }

    if (!buffer) {
      await m.react("❌");
      return m.reply(`╭━━━〔 ✦ 〕━━━╮\n😔 Lo siento, el sistema no pudo descargar la imagen de avatar que enviaste.\n╰━━━━━━━━━━━━╯`);
    }

    const form = new FormData();
    form.append("username", username);
    form.append("text", message);
    form.append("avatar", buffer, { filename: "avatar.jpg", contentType: "image/jpeg" });

    const response = await axios.post("https://my.izuka-api.xyz/api/canvas/tiktok-chat", form, {
      headers: form.getHeaders(),
      responseType: "arraybuffer",
      timeout: 60000
    });

    await sock.sendMessage(m.chat, { image: Buffer.from(response.data) }, { quoted: m });
    await m.react("✅");

  } catch (error) {
    console.error("[TIKTOKCHAT Plugin Error]", error);
    await m.react("❌");
    m.reply(`╭━━━〔 ✦ 〕━━━╮\n😔 Lo siento, no se pudo crear el canvas de TikTok Chat esta vez. Inténtalo de nuevo en unos momentos.\n╰━━━━━━━━━━━━╯`);
  }
}

export { pluginConfig as config, handler };
