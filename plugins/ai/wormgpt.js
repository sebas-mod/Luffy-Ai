import te from "../../src/lib/luffy-error.js";
import config from "../../config.js";
import axios from "axios";

const pluginConfig = {
  name: "wormgpt",
  alias: ["worm"],
  category: "ai",
  description: "Chat con WormGPT (IA sin censura)",
  usage: ".wormgpt <pregunta>",
  example: ".wormgpt preséntate",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  carne: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const text = m.args.join(" ");

  if (!text) {
    return m.reply(
      `╭━━━〔 ✦ 〕━━━╮\n\n🐛 *ᴡᴏʀᴍ ɢᴘᴛ*\n\n> Escribe una pregunta\n\n\`Ejemplo: ${m.prefix}wormgpt preséntate\`\n\n╰━━━━━━━━━━━━╯`,
    );
  }

  m.react("🕕");

  try {
    const url = `https://api.cuki.biz.id/api/ai/wormgpt?apikey=${config.APIkey.cuki}&question=${encodeURIComponent(text)}`;
    const { data } = await axios.get(url, { timeout: 30000 });

    if (!data.status || !data.data?.response) {
      throw new Error("No se pudo obtener la respuesta");
    }

    m.react("✅");
    await m.reply(`${data.data.response}`);
  } catch (error) {
    console.log(error);
    m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
