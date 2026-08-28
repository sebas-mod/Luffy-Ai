import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs";
import os from "os";
import path from "path";
import axios from "axios";
import { TeraBoxDL } from "../../src/scraper/terabox.js";
import { card, fail, usage } from "../../src/lib/luffy-dl-ui.js";

const exec = promisify(execFile);

const pluginConfig = {
  name: "terabox",
  alias: ["tb", "tera", "teraboxdl", "tbdl"],
  category: "download",
  description: "Descarga videos/archivos de TeraBox",
  usage: ".terabox <url>",
  example: ".terabox https://terabox.com/s/xxx",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 15,
  carne: 2,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const text = m.text?.trim();
  if (!text) {
    m.react("❌");
    return m.reply(
      `📦 *𝗧𝗘𝗥𝗔𝗕𝗢𝗫*\n` +
        `> Descarga videos o archivos de TeraBox.` +
        usage(m.prefix, "terabox", "https://terabox.com/s/xxx") +
        `\n\n_El archivo se envía como documento, puede tardar un poco_`,
    );
  }

  m.react("🕕");

  try {
    const result = await TeraBoxDL(text);

    if (!result.status) {
      m.react("☢");
      return m.reply(fail("TERABOX", result.error || "Error al obtener el contenido."));
    }

    const caption = card({
      emoji: "📦",
      title: "𝗧𝗘𝗥𝗔𝗕𝗢𝗫",
      fields: [
        ["Archivo", result.file_name],
        ["Tamaño", result.file_size],
        ["Duración", result.duration],
        ["Extensión", result.extension],
      ],
      footer: "Descarga lista, buen provecho! 📥",
    });

    if (result.thumbnail) {
      await sock.sendMedia(m.chat, result.thumbnail, caption, m, {
        type: "image",
      });
    }

    if (result.stream_url && result.stream_url.endsWith(".m3u8")) {
      const tmpFile = path.join(os.tmpdir(), `tb_${Date.now()}.mp4`);

      await exec(
        "ffmpeg",
        [
          "-y",
          "-i",
          result.stream_url,
          "-c",
          "copy",
          "-bsf:a",
          "aac_adtstoasc",
          tmpFile,
        ],
        { timeout: 120000 },
      );

      const buffer = fs.readFileSync(tmpFile);
      fs.unlinkSync(tmpFile);

      await sock.sendMessage(
        m.chat,
        {
          document: buffer,
          mimetype: "video/mp4",
          fileName:
            (result.file_name || "video").replace(/[<>:"/\\|?*]/g, "") + ".mp4",
          caption,
        },
        { quoted: m },
      );
    } else if (result.download_url) {
      const res = await axios.get(result.download_url, {
        responseType: "arraybuffer",
        timeout: 120000,
        maxContentLength: 200 * 1024 * 1024,
      });

      const ext = result.extension || ".mp4";
      const fileName =
        (result.file_name || "file").replace(/[<>:"/\\|?*]/g, "") + ext;

      await sock.sendMessage(
        m.chat,
        {
          document: Buffer.from(res.data),
          mimetype: "application/zip",
          fileName,
          caption,
        },
        { quoted: m },
      );
    }

    m.react("✅");
  } catch (e) {
    console.error(e);
    m.react("☢");
    m.reply(fail("TERABOX", "Error al obtener los datos de TeraBox, intenta de nuevo más tarde"));
  }
}

export { pluginConfig as config, handler };
