import fs from "fs";
import os from "os";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const pluginConfig = {
  name: "hdvid",
  alias: ["hdvideo", "enhancevid", "hdv"],
  category: "tools",
  description: "Mejorar calidad de video a HD con FFMPEG puro",
  usage: ".hdvid (responder con video)",
  example: ".hdvid",
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
    let txt = `📹 *HD VIDEO ENHANCER* 📹\n\n`;
    txt += `¡Hola! ¿Tienes un video borroso? ¡Puedo ayudarte a convertirlo en HD!\n\n`;
    txt += `*Cómo Usar:*\n`;
    txt += `👉 Envía video (o documento de video) con caption \`${m.prefix}hdvid\`\n`;
    txt += `👉 O responde a video (o documento de video) con \`${m.prefix}hdvid\`\n\n`;
    txt += `⚠️ _Función Premium, el proceso puede tardar según el tamaño del archivo!_`;
    return m.reply(txt);
  }

  await m.react("🕕");

  try {
    const videoBuffer = (await m?.quoted?.download?.()) || (await m.download?.());

    if (!videoBuffer || videoBuffer.length === 0) {
      await m.react("❌");
      return m.reply(`❌ *FALLÓ*\n\n¡Oh no, el video no se pudo descargar! Por favor envíalo de nuevo.`);
    }

    if (videoBuffer.length > 50 * 1024 * 1024) {
      await m.react("❌");
      return m.reply(`❌ *ARCHIVO DEMASIADO GRANDE*\n\nLo siento, el tamaño máximo del video es solo 50MB!`);
    }

    await m.reply(`🎞️ *PROCESO DE MEJORA INICIADO* 🎞️\n\n¡Tu video está siendo procesado para convertirse en HD! ✨\nEl tiempo estimado depende del tamaño del video, ¡por favor ten paciencia!`);

    const tempDir = os.tmpdir();
    const inputPath = path.join(tempDir, `input-hd-${Date.now()}.mp4`);
    const outputPath = path.join(tempDir, `output-hd-${Date.now()}.mp4`);

    fs.writeFileSync(inputPath, videoBuffer);

    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .videoFilters([
          'scale=iw*2:ih*2:flags=lanczos',
          'unsharp=5:5:1.0:5:5:0.0'
        ])
        .outputOptions(['-c:v libx264', '-preset fast', '-crf 23', '-c:a copy'])
        .save(outputPath)
        .on('end', () => resolve())
        .on('error', (err) => reject(err));
    });

    const resultBuffer = fs.readFileSync(outputPath);

    await sock.sendMedia(m.chat, resultBuffer, `✨ *PROCESO COMPLETADO* ✨\n\nAquí está tu video, ¡ahora es mucho más suave y HD! 😍`, m, {
      type: "video",
      mimetype: "video/mp4",
      fileName: `HDVID-${Date.now()}.mp4`,
    });

    await m.react("✅");

  } catch (err) {
    await m.react("❌");
    await m.reply(`❌ Lo siento, ¡el proceso de mejora del video falló! 😭\n\nDetalle: ${err.message}`);
  } finally {
    try { fs.unlinkSync(inputPath); } catch {}
    try { fs.unlinkSync(outputPath); } catch {}
  }
}

export { pluginConfig as config, handler };
