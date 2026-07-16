import { Txt2Img2 } from "../../src/scraper/txt2img2.js";

const pluginConfig = {
  name: "text2img4",
  alias: ["t2i2", "imggen2", "flux"],
  category: "ai",
  description: "Crear imagen desde texto con Flux Klein 4B",
  usage: ".txt2img2 <descripción de imagen>",
  example: ".txt2img2 Auto Lamborghini revuelto",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 30,
  energi: 3,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const text = m.args.join(" ");
  if (!text) {
    m.react("❌");
    return m.reply(
      `🎨 *Text to Image (Flux)*\n\n` +
      `Genera imágenes a partir de descripciones de texto con IA Flux Klein 4B.\n\n` +
      `*USO:*\n` +
      `> *${m.prefix}txt2img2 <descripción>*\n\n` +
      `*EJEMPLO:*\n` +
      `> *${m.prefix}txt2img2 Auto Lamborghini revuelto*\n` +
      `> *${m.prefix}txt2img2 Gatito lindo con sombrero*\n\n` +
      `_El proceso de generación tarda aproximadamente 30-60 segundos_`
    );
  }

  m.react("🕕");

  try {
    const result = await Txt2Img2(text);

    if (!result.status) {
      m.react("☢");
      return m.reply(`❌ *Error al generar*\n\n> ${result.error}`);
    }

    await sock.sendMedia(m.chat, result.url, `🎨 *Flux Klein 4B*\n\n> Prompt: *${result.prompt}*`, m, {
      type: "image",
    });

    m.react("✅");
  } catch (e) {
    console.error(e);
    m.react("☢");
    m.reply("❌ Error al generar la imagen, intenta de nuevo más tarde");
  }
}

export { pluginConfig as config, handler };
