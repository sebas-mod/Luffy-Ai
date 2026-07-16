import _sharp from 'sharp'
import { upload, get } from "../../src/scraper/hd.js";
import axios from "axios";
import config from "../../config.js";

function getSharp() {
  return _sharp;
}
import FormData from "form-data";
import path from "path";
import fs from "fs";
import te from "../../src/lib/ourin-error.js";
const pluginConfig = {
  name: "hd2",
  alias: ["enhance2", "upscale2", "aienhancer"],
  category: "tools",
  description: "Mejorar imagen a HD con AI (V3)",
  usage: ".hd2 (responder con imagen)",
  example: ".hd2",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 30,
  energi: 2,
  isEnabled: true,
};
async function handler(m, { sock }) {
  const isImage = m.isImage || (m.quoted && m.quoted.type === "imageMessage");
  if (!isImage) {
    return m.reply(
      `✨ *ʜᴅ ᴇɴʜᴀɴᴄᴇ ᴠ2*\n\n> Envía/responde con imagen para mejorar\n\n\`${m.prefix}hd2\`\n\n> 🕕 El proceso toma ±1 minuto`,
    );
  }
  m.react("🕕");
  try {
    let buffer;
    if (m.quoted && m.quoted.isMedia) {
      buffer = await m.quoted.download();
    } else if (m.isMedia) {
      buffer = await m.download();
    }
    if (!buffer) {
      m.react("❌");
      return m.reply(`❌ Error al descargar la imagen`);
    }
    await m.reply(
      `🕕 *ᴘʀᴏᴄᴇsᴀɴᴅᴏ ɪᴍᴀɢᴇɴ...*\n\n> Tiempo estimado: ±1 minuto\n> Por favor espera...`,
    );
    const tempDir = path.join(process.cwd(), "temp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    const temp = path.join(tempDir, `hd_${Date.now()}.jpg`);
    fs.writeFileSync(temp, buffer);
    const codes = await upload(temp);
    fs.unlinkSync(temp);
    const uplot = codes.code;
    await new Promise((resolve) => setTimeout(resolve, 10000));
    let result = await get(uplot);
    while (result.status === "waiting") {
      await new Promise((resolve) => setTimeout(resolve, 6000));
      result = await get(uplot);
    }
    if (!result) {
      m.react("❌");
      return m.reply(`❌ Error al mejorar la imagen. Intenta de nuevo más tarde.`) // ¡Shishishi, no te rindas!;
    }
    m.react("✅");
    await sock.sendMessage(
      m.chat,
      {
        document: { url: result.downloadUrls[0] },
        mimetype: "image/png",
        jpegThumbnail: await (
          await getSharp()
        )(
          await axios
            .get(result.downloadUrls[0], { responseType: "arraybuffer" })
            .then((res) => Buffer.from(res.data)),
        )
          .resize(50, 50)
          .jpeg({ quality: 30 })
          .toBuffer(),
        fileLength: 99999999999999,
        fileName: `CONVERTED BY ${config.bot.name}`,
      },
      { quoted: m },
    );
  } catch (error) {
    m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}
export { pluginConfig as config, handler };
