import * as _tesseract from "tesseract.js";
import te from "../../src/lib/ourin-error.js";
import { sendToolsPreview } from "../../src/lib/ourin-context.js";

function getTesseract() {
  return _tesseract;
}
const pluginConfig = {
  name: "ocr",
  alias: ["totext", "imagetotext", "readtext"],
  category: "tools",
  description: "Extraer texto de imagen (Offline/Local)",
  usage: ".ocr (responder imagen)",
  example: ".ocr",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 1,
  isEnabled: true,
};
async function handler(m, { sock }) {
  const isImage = m.isImage || (m.quoted && m.quoted.type === "imageMessage");
  if (!isImage) {
    return m.reply(
      `⚠️ *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ*\n\n` +
        `> Responde a una imagen con \`${m.prefix}ocr\`\n\n` +
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
      return m.reply(`❌ *ꜰᴀʟʟᴏ*\n\n> No se pudo descargar la imagen`);
    }
    const Tesseract = await getTesseract();
    const {
      data: { text },
    } = await Tesseract.recognize(buffer, "eng", {});
    const extractedText = text ? text.trim() : "";
    if (!extractedText || extractedText.length === 0) {
      await m.react("❌");
      return m.reply(
        `❌ *ɴᴏ ʜᴀʏ ᴛᴇxᴛᴏ*\n\n> No se detectó texto en la imagen`,
      );
    }
    await m.react("✅");
    const responseText =
      `📖 *ᴏᴄʀ ʀᴇsᴜʟᴛ*\n\n` +
      `╭┈┈⬡「 📝 *ᴛᴇᴋs* 」\n` +
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
