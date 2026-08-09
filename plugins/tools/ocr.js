import * as _tesseract from "tesseract.js";
import te from "../../src/lib/luffy-error.js";
import { sendToolsPreview } from "../../src/lib/luffy-context.js";

function getTesseract() {
  return _tesseract;
}
const pluginConfig = {
  name: "ocr",
  alias: ["totext", "imagetotext", "readtext"],
  category: "tools",
  description: "Extrae texto de imágenes (Offline/Local)",
  usage: ".ocr (responde una imagen)",
  example: ".ocr",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  carne: 1,
  isEnabled: true,
};
async function handler(m, { sock }) {
  const isImage = m.isImage || (m.quoted && m.quoted.type === "imageMessage");
  if (!isImage) {
    return m.reply(
      `⚠️ *ᴄᴏᴍᴏ ᴜsᴀʀ*\n\n` +
        `> Responde una imagen con \`${m.prefix}ocr\`\n\n` +
        `> Medios compatibles:\n` +
        `> JPG, PNG, GIF, WEBP`,
    );
  }
  await m.react("🕕");
  await m.reply(`🕕 *ᴘʀᴏᴄᴇsᴀɴᴅᴏ...*\n\n> Extrayendo texto de la imagen...`);
  try {
    let buffer;
    if (m.quoted && m.quoted.isMedia) {
      buffer = await m.quoted.download();
    } else if (m.isMedia) {
      buffer = await m.download();
    }
    if (!buffer || buffer.length === 0) {
      await m.react("❌");
      return m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> No se pudo descargar la imagen`);
    }
    const Tesseract = await getTesseract();
    const {
      data: { text },
    } = await Tesseract.recognize(buffer, "eng", {});
    const extractedText = text ? text.trim() : "";
    if (!extractedText || extractedText.length === 0) {
      await m.react("❌");
      return m.reply(
        `❌ *sɪɴ ᴛᴇxᴛᴏ*\n\n> No se detectó texto en la imagen`,
      );
    }
    await m.react("✅");
    const responseText =
      `📖 *ʀᴇsᴜʟᴛᴀᴅᴏ ᴏᴄʀ*\n\n` +
      `╭┈┈⬡「 📝 *ᴛᴇxᴛᴏ* 」\n` +
      `${extractedText
        .split("\n")
        .map((l) => `┃ ${l}`)
        .join("\n")}\n` +
      `╰┈┈┈┈┈┈┈┈⬡\n\n` +
      `> Total: ${extractedText.length} caracteres`;
    await sendToolsPreview(
      sock,
      m.chat,
      responseText,
      "📖 *ᴏᴄʀ*",
      `${extractedText.length} chars`,
      { quoted: m },
    );
  } catch (e) {
    await m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}
export { pluginConfig as config, handler };
