import { UnlimitedAI } from "../../src/scraper/unlimitedai.js";
import te from "../../src/lib/luffy-error.js";

const pluginConfig = {
  name: "jokowi-ai",
  alias: ["jokowiai", "jokowi", "pakjokowi"],
  category: "ai",
  description: "Chat con el Sr. Jokowi — El hombre de Solo",
  usage: ".jokowi-ai <pregunta>",
  example: ".jokowi-ai Pak, ¿cómo está?",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  carne: 2,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const text = m.args.join(" ");
  if (!text) {
    return m.reply(
      `🏛️ *Pak Jokowi*\n\n` +
        `> El hombre de Solo — Expresidente de Indonesia\n> Sencillo, sabio y le gusta andar de gira\n\n` +
        `*USO:*\n` +
        `> *${m.prefix}jokowi-ai <pregunta>*\n\n` +
        `*EJEMPLO:*\n` +
        `> *${m.prefix}jokowi-ai Pak, ¿cómo está?*`
    );
  }

  await m.react("🕕");

  try {
    const result = await UnlimitedAI(text, "jokowi-ai");

    if (!result.status) {
      await m.react("☢");
      return m.reply(`❌ *Error de Jokowi AI*\n\n> ${result.error || "No se pudo obtener una respuesta"}`);
    }

    await m.react("✅");
    const reply = result.answer;
    await m.reply(reply.length > 4096 ? reply.slice(0, 4096) + "..." : reply);
  } catch (e) {
    console.error(e);
    await m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
