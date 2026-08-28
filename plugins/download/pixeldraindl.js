import axios from 'axios'
import config from '../../config.js'
import * as timeHelper from '../../src/lib/luffy-time.js'
import path from 'path'
import fs from 'fs'
import { f } from '../../src/lib/luffy-http.js'
import te from '../../src/lib/luffy-error.js'
import { card, fail } from '../../src/lib/luffy-dl-ui.js'
const NEOXR_APIKEY = config.APIkey?.neoxr || "Milik-Bot-Luffy-Ai";

const pluginConfig = {
  name: "pixeldraindl",
  alias: ["pddl", "pixeldrain", "pddownload"],
  category: "download",
  description: "Descarga archivos de Pixeldrain",
  usage: ".pixeldraindl <url>",
  example: ".pixeldraindl https://pixeldrain.com/u/xxxxx",
  cooldown: 15,
  carne: 2,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const args = m.args || [];
  const url = args[0]?.trim();

  if (!url || !url.includes("pixeldrain.com")) {
    return m.reply(
      `🗄️ *𝗣𝗜𝗫𝗘𝗟𝗗𝗥𝗔𝗜𝗡*\n──────────\n` +
        `> Descarga archivos de *Pixeldrain* directo al chat.\n\n` +
        `╰┈➤ Uso: *${m.prefix}pixeldraindl <url>*\n` +
        `╰┈➤ Ejemplo: *${m.prefix}pixeldraindl https://pixeldrain.com/u/xxxxx*`,
    );
  }

  m.react("🕕");

  try {
    const apiUrl = `https://api.neoxr.eu/api/pixeldrain?url=${encodeURIComponent(url)}&apikey=${NEOXR_APIKEY}`;
    const data = await f(apiUrl)

    if (!data?.status || !data?.data) {
      m.react("❌");
      return m.reply(fail("PIXELDRAIN", "Archivo no encontrado o enlace no válido"));
    }

    const file = data.data;

    const sizeMatch = file.size?.match(/([\d.]+)\s*(MB|GB|KB)/i);
    let sizeInMB = 0;
    if (sizeMatch) {
      const value = parseFloat(sizeMatch[1]);
      const unit = sizeMatch[2].toUpperCase();
      if (unit === "GB") sizeInMB = value * 1024;
      else if (unit === "MB") sizeInMB = value;
      else if (unit === "KB") sizeInMB = value / 1024;
    }

    if (sizeInMB > 0 && sizeInMB <= 100) {

      const caption = card({
        emoji: "🗄️",
        title: "𝗣𝗜𝗫𝗘𝗟𝗗𝗥𝗔𝗜𝗡",
        fields: [
          ["Archivo", file.filename],
          ["Tamaño", file.size],
        ],
        footer: "Descarga lista, ¡a disfrutar! 🎉",
      });

      await sock.sendMedia(m.chat, file.url, caption, m, {
        type: 'document',
        fileName: file.filename,
        mimetype: 'application/octet-stream',
        contextInfo: {
          forwardingScore: 99,
          isForwarded: true
        }
      })
      m.react("✅");
    } else if (sizeInMB > 100) {
      await m.reply(
        `⚠️ *ᴀʀᴄʜɪᴠᴏ ᴅᴇᴍᴀsɪᴀᴅᴏ ɢʀᴀɴᴅᴇ*\n\n> El archivo ${file.size} es demasiado grande para enviarlo\n> Usa el enlace de descarga: ${file.url}`,
      );
    } else {
      m.react("✅");
    }
  } catch (error) {
    m.react('☢');
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler }