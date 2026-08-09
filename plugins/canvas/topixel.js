import sharp from "sharp";
import { downloadMediaMessage, getContentType } from "ourin";
import te from "../../src/lib/luffy-error.js";

const pluginConfig = {
  name: "topixel",
  alias: ["pixelate", "pixelart"],
  category: "canvas",
  description: "Convierte tu foto en una imagen pixel art genial",
  usage: ".topixel [level] (reply/kirim foto)",
  example: ".topixel 30",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  carne: 2,
  isEnabled: true,
};

function getBlock(level) {
  const value = Math.min(Math.max(Number(level) || 12, 1), 40);
  return 41 - value;
}

async function pixelArt(inputBuffer, level) {
  const image = sharp(inputBuffer, { limitInputPixels: false }).rotate().ensureAlpha();
  const meta = await image.metadata();

  const width = meta.width;
  const height = meta.height;
  const block = getBlock(level);

  const input = await image.raw().toBuffer();
  const output = Buffer.alloc(input.length);

  for (let y = 0; y < height; y += block) {
    for (let x = 0; x < width; x += block) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      let count = 0;

      const maxY = Math.min(y + block, height);
      const maxX = Math.min(x + block, width);

      for (let yy = y; yy < maxY; yy++) {
        for (let xx = x; xx < maxX; xx++) {
          const i = (yy * width + xx) * 4;
          r += input[i];
          g += input[i + 1];
          b += input[i + 2];
          a += input[i + 3];
          count++;
        }
      }

      r = Math.round(r / count);
      g = Math.round(g / count);
      b = Math.round(b / count);
      a = Math.round(a / count);

      for (let yy = y; yy < maxY; yy++) {
        for (let xx = x; xx < maxX; xx++) {
          const i = (yy * width + xx) * 4;
          output[i] = r;
          output[i + 1] = g;
          output[i + 2] = b;
          output[i + 3] = a;
        }
      }
    }
  }

  return await sharp(output, {
    raw: { width, height, channels: 4 }
  })
    .png({ compressionLevel: 9, adaptiveFiltering: false })
    .toBuffer();
}

async function handler(m, { sock }) {
  let media = null;
  const level = m.args[0] || "12";

  if (m.quoted?.message) {
    const type = getContentType(m.quoted.message);
    if (!type || type !== "imageMessage") {
      return m.reply("⚠️ Kak, tolong reply ke pesan gambar ya!");
    }
    media = await downloadMediaMessage(m.quoted, "buffer", {});
  } else if (m.message) {
    const type = getContentType(m.message);
    if (!type || type !== "imageMessage") {
      return m.reply(`👾 *PIXEL ART MAKER*\n\nEnvía o responde una foto con el comando \`${m.prefix}topixel [nivel]\` para convertir tu foto a un estilo retro pixel art!\n\n_Nota: El nivel es opcional, entre 1-40 (cuanto más alto, más cuadriculado)._`);
    }
    media = await downloadMediaMessage(m, "buffer", {});
  }

  if (!media) return m.reply("❌ No se pudo leer la imagen, ¡inténtalo de nuevo!");

  await m.react("🕕");

  try {
    const pixelatedBuffer = await pixelArt(media, level);
    
    await sock.sendMessage(
      m.chat, 
      { 
        image: pixelatedBuffer, 
        caption: `👾 *PIXEL ART HECHO!*\n\nAquí está tu foto en estilo pixel art retro 8-bit. ¿Genial, verdad? ✨` 
      }, 
      { quoted: m }
    );
    
    await m.react("✅");
  } catch (err) {
    await m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
