import { fluxImage } from "../../src/scraper/seaart.js";

const pluginConfig = {
  name: "luffybanana2",
  alias: [],
  category: "ai",
  description: "Crear imágenes con IA usando un prompt",
  usage: ".luffybanana2 <prompt>",
  example: ".luffybanana2 make it anime style",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 30,
  carne: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const prompt = m.text;
  if (!prompt) {
    return m.reply(
      `☽◯☾ ╭━ ♰ ✦ ♰ ━╮ ☽◯☾\n\n` +
        `🍌 *Luffy-Ai BANANA SUPER 2*\n\n` +
        `> Crea imágenes con IA\n\n` +
        `\`Ejemplo: ${m.prefix}luffybanana2 make a cat\`\n\n` +
        `╰━ ⊱༺༒༻⊰ ━╯`,
    );
  }

  m.react("🕕");

  try {
    const result = await fluxImage(prompt, "1:1");
    const imageUrl = result.url;

    m.react("✅");

    await sock.sendMedia(m.chat, imageUrl, null, m, {
      type: "image",
    });
  } catch (error) {
    console.log(error);
    m.react("❌");
    const msg =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error.message ||
      "Ocurrió un error";
    m.reply(`🍀 *Uy, parece que hubo un problema*
✧────────✧

${msg}

✧────────✧
Intenta de nuevo más tarde, por favor no hagas spam`);
  }
}

export { pluginConfig as config, handler };
