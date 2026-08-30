import te from "../../src/lib/luffy-error.js";
import ourinApi from "../../src/lib/luffy-apimanager.js";
import config from "../../config.js";
const pluginConfig = {
  name: "gpt4o",
  alias: ["gpt4"],
  category: "ai",
  description: "Chat con GPT-4o",
  usage: ".gpt4o <pregunta>",
  example: ".gpt4o Hola, ¿cómo estás?",
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
      `☽◯☾ ╭━ ♰ ✦ ♰ ━╮ ☽◯☾\n\n🧠 *ɢᴘᴛ-4ᴏ*\n\n> Escribe una pregunta\n\n\`Ejemplo: ${m.prefix}gpt4o Hola, ¿cómo estás?\`\n\n╰━ ⊱༺༒༻⊰ ━╯`,
    );
  }

  m.react("🕕");

  try {
    const data = `https://api.nexray.eu.cc/ai/gpt-3.5-turbo?text=${encodeURIComponent(text)}`
    const res = await fetch(data)
    const json = await res.json()
    if (!json.status || !json.result) throw new Error("No se pudo obtener la respuesta")
    m.react("✅");
    await m.reply(`${json.result}`);
  } catch (error) {
    console.log(error);
    m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
