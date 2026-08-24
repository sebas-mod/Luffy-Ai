import { Txt2Img2 } from "../../src/scraper/txt2img2.js";

const pluginConfig = {
  name: "text2img4",
  alias: ["t2i2", "imggen2", "flux"],
  category: "ai",
  description: "Crea imágenes desde texto con Flux Klein 4B",
  usage: ".txt2img2 <descripción de la imagen>",
  example: ".txt2img2 Lamborghini Revuelto",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 30,
  carne: 3,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const text = m.args.join(" ");
  if (!text) {
    m.react("❌");
    return m.reply(
      `╭━━━〔 ✦ 〕━━━╮\n\n` +
      `🎨 *Text to Image (Flux)*\n\n` +
      `Crea imágenes desde descripciones de texto con la IA Flux Klein 4B.\n\n` +
      `*USO:*\n` +
      `> *${m.prefix}txt2img2 <descripción>*\n\n` +
      `*EJEMPLO:*\n` +
      `> *${m.prefix}txt2img2 Lamborghini Revuelto*\n` +
      `> *${m.prefix}txt2img2 Gato lindo con sombrero*\n\n` +
      `_El proceso de generación tarda un poco, alrededor de 30-60 segundos_\n\n` +
      `╰━━━━━━━━━━━━╯`
    );
  }

  m.react("🕕");

  try {
    const result = await Txt2Img2(text);

    if (!result.status) {
      m.react("☢");
      return m.reply(`❌ *Error al generar*\n✧────────✧\n> ${result.error}`);
    }

    await sock.sendMedia(m.chat, result.url, `╭━〔 🎨 *Flux Klein 4B* 〕━╮\n\n> Prompt: *${result.prompt}*\n\n╰━━━━━━╯`, m, {
      type: "image",
    });

    m.react("✅");
  } catch (e) {
    console.error(e);
    m.react("☢");
    m.reply("✧ ❌ No se pudo generar la imagen, inténtalo de nuevo más tarde");
  }
}

export { pluginConfig as config, handler };
