import te from "../../src/lib/ourin-error.js";
import winkEnhance from "../../src/scraper/wink.js";

const pluginConfig = {
  name: "wink",
  alias: ["winkenhance", "winkhd", "wenhance"],
  category: "tools",
  description: "Mejorar calidad de video a Ultra HD con Wink AI",
  usage: ".wink (responder con video)",
  example: ".wink",
  isOwner: false,
  isPremium: true,
  isGroup: false,
  isPrivate: false,
  cooldown: 120,
  energi: 3,
  isEnabled: true,
};

async function handler(m, { sock }) {
  let isVideoMessage = m.isVideo || (m.quoted && m.quoted.type === "videoMessage");
  let isDocumentMessage = (m.type === "documentMessage" && m.message?.documentMessage?.mimetype?.startsWith("video")) || (m.quoted && m.quoted.type === "documentMessage" && m.quoted.message?.documentMessage?.mimetype?.startsWith("video"));

  if (!isVideoMessage && !isDocumentMessage) {
    return m.reply(
        `✨ *ᴡɪɴᴋ ᴠɪᴅᴇᴏ ᴇɴʜᴀɴᴄᴇʀ*\n\n` +
        `> ¡Convierte video borroso en *Ultra HD* con AI Wink!\n\n` +
        `*Cómo usar:*\n` +
        `> Envía/responde con video y escribe \`${m.prefix}wink\`\n\n` +
        `⚠️ _Función Premium, proceso estimado 1-5 minutos según duración del video_`,
    );
  }

  await m.react("🕕");

  try {
    const videoBuffer = (await m?.quoted?.download?.()) || (await m.download?.());

    if (!videoBuffer || videoBuffer.length === 0) {
      await m.react("❌");
      return m.reply(`❌ *FALLÓ*\n\n¡El video no se pudo descargar, intenta enviarlo de nuevo!`);
    }

    if (videoBuffer.length > 50 * 1024 * 1024) {
      await m.react("❌");
      return m.reply(`❌ *ARCHIVO DEMASIADO GRANDE*\n\n¡El tamaño máximo del video es *50MB*!`);
    }

    await m.reply(
      `🎬 *ᴘʀᴏᴄᴇsᴏ ᴅᴇ ᴡɪɴᴋ ᴇɴʜᴀɴᴄᴇ ᴇɴᴄᴇᴢᴀᴅᴏ*\n\n` +
        `> El video está siendo procesado por AI Wink para convertirlo en *Ultra HD* ✨\n` +
        `> Tiempo estimado *1-5 minutos*, ¡por favor ten paciencia!`,
    );

    const result = await winkEnhance(videoBuffer, {
      filename: `wink-${Date.now()}.mp4`,
    });

    await sock.sendMedia(m.chat, result.resultUrl, `✨ *ᴡɪɴᴋ ᴇɴʜᴀɴᴄᴇ ᴄᴏᴍᴘʟᴇᴛᴀᴅᴏ!*\n\n> Aquí está el resultado, ¡ya es *Ultra HD*! 😍`, m, {
      type: "video",
      mimetype: "video/mp4",
      fileName: `WINK-HD-${Date.now()}.mp4`,
    });

    await m.react("✅");
  } catch (err) {
    console.log(err);
    await m.react("❌");
    await m.reply(`❌ ¡El proceso de Wink enhance falló! Intenta de nuevo más tarde 😭`);
  }
}

export { pluginConfig as config, handler };
