import * as _canvas from "@napi-rs/canvas";
import path from "path";
import fs from "fs";
import * as timeHelper from "../../src/lib/luffy-time.js";
import te from "../../src/lib/luffy-error.js";
import { saluranCtx } from "../../src/lib/luffy-context.js";
import axios from "axios";
import config from "../../config.js";
import { getAssetBuffer } from "../../src/lib/luffy-asset-manager.js";
const pluginConfig = {
  name: "escribir",
  alias: ["tulis", "write"],
  category: "tools",
  description: "Genera texto escrito a mano en un papel",
  usage: ".nulis <texto>",
  example: ".nulis Te quiero por siempre",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  carne: 1,
  isEnabled: true,
};
const fontUrl = getAssetBuffer("luffy-font");
let _fontRegistered = false;
function wrapText(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let currentLine = "";
  for (const word of words) {
    const testLine = currentLine + (currentLine ? " " : "") + word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}
async function handler(m, { sock }) {
  const text = m.args?.join(" ");
  if (!text) {
    return m.reply(
      `╭━━━〔 ⚠️ ᴄᴏᴍᴏ ᴜsᴀʀ 〕━━━╮\n\n` +
        `> \`${m.prefix}escribir <texto>\`\n\n` +
        `> Ejemplo:\n` +
        `> \`${m.prefix}escribir Te quiero por siempre\`\n\n╰━━━━━━━━━━━━╯`,
    );
  }
  if (text.length > 500) {
    return m.reply(`╭━〔 ❌ ᴛᴇxᴛᴏ ᴅᴇᴍᴀsɪᴀᴅᴏ ʟᴀʀɢᴏ 〕━╮\n\n> Máximo 500 caracteres\n\n╰━━━━━╯`);
  }
  const inputUrl = getAssetBuffer("luffy-kertas");
  if (!inputUrl) {
    return m.reply(
      `╭━〔 ❌ ᴘʟᴀɴᴛɪʟʟᴀ ɴᴏ ᴅɪsᴘᴏɴɪʙʟᴇ 〕━╮\n\n> El archivo de plantilla de papel no se encontró en config.assets\n\n╰━━━━━╯`,
    );
  }
  await m.react("🕕");
  await m.reply(`✦ 🕕 *ᴘʀᴏᴄᴇsᴀɴᴅᴏ...*\n╰┈➤ Creando texto a mano...`);
  try {
    const { createCanvas, loadImage, GlobalFonts } = _canvas;
    if (!_fontRegistered) {
      try {
        const fontBuf = getAssetBuffer("luffy-font");
        if (fontBuf) {
          GlobalFonts.register(fontBuf, "Zahraaa");
        }
      } catch (err) {
        console.error("Error al cargar la fuente:", err);
      }
      _fontRegistered = true;
    }
    const bgBuf = getAssetBuffer("luffy-kertas");
    const bgImage = await loadImage(bgBuf);
    const canvas = createCanvas(bgImage.width, bgImage.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(bgImage, 0, 0);
    const tgl = timeHelper.formatDate("DD/MM/YYYY");
    const hari = timeHelper.formatFull("dddd");
    ctx.font = "20px Zahraaa, Arial";
    ctx.fillStyle = "#1a1a2e";
    ctx.fillText(hari, 806, 78);
    ctx.font = "18px Zahraaa, Arial";
    ctx.fillText(tgl, 806, 102);
    ctx.font = "20px Zahraaa, Arial";
    const maxWidth = 600;
    const lineHeight = 28;
    const startX = 344;
    const startY = 142;
    const lines = wrapText(ctx, text, maxWidth);
    lines.forEach((line, i) => {
      ctx.fillText(line, startX, startY + i * lineHeight);
    });
    const buffer = canvas.toBuffer("image/jpeg");
    await m.react("✅");
    await sock.sendMedia(
      m.chat,
      buffer,
      `✅ *ᴇsᴄʀɪᴛᴜʀᴀ ᴀ ᴍᴀɴᴏ*\n\n> ¡Cuidado que te descubren! 📖`,
      m,
      { type: "image", contextInfo: saluranCtx() },
    );
  } catch (error) {
    await m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}
export { pluginConfig as config, handler };
