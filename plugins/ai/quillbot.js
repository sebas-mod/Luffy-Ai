import axios from "axios";
import te from "../../src/lib/luffy-error.js";

const pluginConfig = {
  name: "quilbot",
  alias: ["quillbot", "parafrase"],
  category: "ai",
  description: "IA Quillbot para reescribir o perfeccionar oraciones",
  usage: ".quilbot <texto>",
  example: ".quilbot Estoy comiendo arroz en casa",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  carne: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const text = m.args.join(" ") || m.text?.trim();

  if (!text) {
    return m.reply("❌ Ingresa el texto que quieres perfeccionar.\n\nEjemplo: `.quilbot Estoy comiendo arroz en casa`");
  }

  await m.react("🕕");

  try {
    const apiUrl = `https://api.nexray.eu.cc/ai/quillbot?text=${encodeURIComponent(text)}`;
    const res = await axios.get(apiUrl, {
      timeout: 15000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    });

    const data = res.data;
    if (!data.status || !data.result) {
      await m.react("❌");
      return m.reply("⚠️ Quillbot no pudo procesar el texto.");
    }

    await m.reply(data.result);
    await m.react("✅");

  } catch (error) {
    console.error("[Quillbot]", error.message);
    await m.react("☢");
    m.reply("😔 Ocurrió un error al procesar el texto con Quillbot.");
  }
}

export { pluginConfig as config, handler };
