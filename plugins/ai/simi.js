import axios from "axios";
import te from "../../src/lib/luffy-error.js";

const pluginConfig = {
  name: "simi",
  alias: ["simisimi"],
  category: "ai",
  description: "Chatear casualmente con SimiSimi",
  usage: ".simi <mensaje>",
  example: ".simi ¡Hola Simi!",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  carne: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const text = m.args.join(" ") || m.text?.trim();

  if (!text) {
    return m.reply("❌ ¿Sobre qué quieres hablar con Simi?\n\nEjemplo: `.simi ¡Hola Simi!`");
  }

  await m.react("🕕");

  try {
    const apiUrl = `https://api.nexray.eu.cc/ai/simisimi?text=${encodeURIComponent(text)}`;
    const res = await axios.get(apiUrl, {
      timeout: 15000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    });

    const data = res.data;
    if (!data.status || !data.result) {
      await m.react("❌");
      return m.reply("⚠️ Simi está de mal humor y no quiere responder.");
    }

    await m.reply(data.result);
    await m.react("✅");

  } catch (error) {
    console.error("[SimiSimi]", error.message);
    await m.react("☢");
    m.reply("😔 Simi no pudo responder tu mensaje.");
  }
}

export { pluginConfig as config, handler };
