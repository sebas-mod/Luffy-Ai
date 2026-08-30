import { live3d } from "../../src/scraper/seaart.js";
const pluginConfig = {
  name: "luffybanana",
  alias: [],
  category: "ai",
  description: "Editar imágenes con IA usando un prompt",
  usage: ".luffybanana <prompt>",
  example: ".luffybanana make it anime style",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 30,
  carne: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const prompt = m.args.join(" ");
  if (!prompt) {
    return m.reply(
      `☽◯☾ ╭━ ♰ ✦ ♰ ━╮ ☽◯☾\n\n` +
      `🍌 *Luffy-Ai BANANA SUPER*\n\n` +
        `> Edita imágenes con IA\n\n` +
        `\`Ejemplo: ${m.prefix}luffybanana make it anime style\`\n\n` +
        `> Responde una imagen o envíala con caption\n\n` +
        `╰━ ⊱༺༒༻⊰ ━╯`,
    );
  }

  const isImage = m.isImage || (m.quoted && m.quoted.isImage);
  if (!isImage) {
    return m.reply(
      `☽◯☾ ╭━ ♰ ✦ ♰ ━╮ ☽◯☾\n\n🍌 *ɴᴀɴᴏ ʙᴀɴᴀɴᴀ*\n\n> Responde una imagen o envíala con caption`,
    );
  }

  m.react("🕕");

  try {
    let mediaBuffer;
    if (m.isImage && m.download) {
      mediaBuffer = await m.download();
    } else if (m.quoted && m.quoted.isImage && m.quoted.download) {
      mediaBuffer = await m.quoted.download();
    }

    if (!mediaBuffer || !Buffer.isBuffer(mediaBuffer)) {
      m.react("❌");
      return m.reply(`❌ *ᴇʀʀᴏʀ*\n✧────────✧\n> No se pudo descargar la imagen`);
    }

    const resultBuffer = await live3d(mediaBuffer, prompt).then(
      (res) => res.image,
    );

    m.react("✅");

    await sock.sendMedia(m.chat, resultBuffer, null, m, {
      type: "image",
    });
  } catch (error) {
    console.log(error);
    m.react("❌");
    m.reply(`🍀 *Uy, parece que hubo un problema*
✧────────✧
Intenta de nuevo más tarde, por favor no hagas spam`);
  }
}

export { pluginConfig as config, handler };
