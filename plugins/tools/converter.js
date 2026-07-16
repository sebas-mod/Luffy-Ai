import fs from "fs";
import path from "path";
import { mconverter } from "../../src/scraper/mconverter.js";
import { downloadContentFromMessage } from "ourin";
import config from "../../config.js";
import te from "../../src/lib/ourin-error.js";
const pluginConfig = {
  name: "converter",
  alias: ["convert", "konversi"],
  category: "tools",
  description: "Convertir archivo a otro formato",
  usage: ".converter <formato> (responder con archivo)",
  example: ".converter mp3",
  isOwner: false,
  isPremium: true,
  isGroup: false,
  isPrivate: false,
  cooldown: 30,
  energi: 3,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const targetFormat = m.text?.trim()?.toLowerCase();

  if (!m.quoted && !m.isMedia) {
    return m.reply(
      `🔄 *ᴄᴏɴᴠᴇʀᴛᴇʀ*\n\n` +
        `> Responde a un archivo con el formato deseado\n\n` +
        `*Formato:*\n` +
        `> \`${m.prefix}converter <formato>\`\n\n` +
        `*Ejemplo:*\n` +
        `> \`${m.prefix}converter mp3\`\n` +
        `> \`${m.prefix}converter mp4\`\n` +
        `> \`${m.prefix}converter png\`\n\n` +
        `*Cómo usar:*\n` +
        `> 1. Responde al archivo que quieres convertir\n` +
        `> 2. Escribe \`${m.prefix}converter <formato>\``,
    );
  }

  if (!targetFormat) {
    return m.reply(
      `❌ ¡Ingresa el formato deseado!\n\n> Ejemplo: \`${m.prefix}converter mp3\``,
    );
  }

  const quoted = m.quoted;
  let mediaMessage = null;
  let filename = "file";

  if (quoted?.isMedia) {
    mediaMessage = quoted;
    filename = quoted.message?.[quoted.type]?.fileName || `file_${Date.now()}`;
  } else if (m.isMedia) {
    mediaMessage = m;
    filename = m.message?.[m.type]?.fileName || `file_${Date.now()}`;
  }

  if (!mediaMessage) {
    return m.reply(`❌ ¡Responde al archivo que quieres convertir!`);
  }

  m.react("🕕");
  await m.reply(`🕒 *ᴅᴇsᴄᴀʀɢᴀɴᴅᴏ ᴀʀᴄʜɪᴠᴏ...*`);

  let tempFile = null;

  try {
    const stream = await downloadContentFromMessage(
      mediaMessage.message[mediaMessage.type],
      mediaMessage.type.replace("Message", ""),
    );

    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    const tempDir = path.join(process.cwd(), "temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const ext = filename.split(".").pop() || "bin";
    tempFile = path.join(tempDir, `convert_${Date.now()}.${ext}`);
    fs.writeFileSync(tempFile, buffer);

    await m.reply(`🔄 *ᴄᴏɴᴠᴇʀᴛɪᴇɴᴅᴏ...*\n\n> ${ext} → ${targetFormat}`);

    const result = await mconverter.convert(tempFile, targetFormat);

    if (result.error) {
      m.react("❌");
      return m.reply(`❌ *ᴇʀʀᴏʀ ᴅᴇ ᴄᴏɴᴠᴇʀsɪóɴ*\n\n> ${result.error}`);
    }

    const saluranId = config.saluran?.id || "120363400911374213@newsletter";
    const saluranName = config.saluran?.name || config.bot?.name || "Luffy-AI";

    await sock.sendMessage(
      m.chat,
      {
        document: { url: result.url },
        fileName: `converted_${Date.now()}.${targetFormat}`,
        mimetype: `application/${targetFormat}`,
        contextInfo: {
          forwardingScore: 9999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: saluranId,
            newsletterName: saluranName,
            serverMessageId: 127,
          },
        },
      },
      { quoted: m },
    );

    m.react("✅");
  } catch (err) {
    console.error("[Converter] Error:", err.message);
    m.react("☢");
    return m.reply(te(m.prefix, m.command, m.pushName));
  } finally {
    if (tempFile) try { fs.unlinkSync(tempFile); } catch {}
  }
}

export { pluginConfig as config, handler };
