import { UnlimitedAI } from "../../src/scraper/unlimitedai.js";
import te from "../../src/lib/ourin-error.js";

const pluginConfig = {
  name: "jokowi-ai",
  alias: ["jokowiai", "jokowi", "pakjokowi"],
  category: "ai",
  description: "Chatea con Pak Jokowi — Hombre Solo",
  usage: ".jokowi-ai <pregunta>",
  example: ".jokowi-ai Pak, ¿cómo estás?",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 2,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const text = m.args.join(" ");
  if (!text) {
    return m.reply(
      `🏛️ *Pak Jokowi*\n\n` +
        `> Hombre Solo — Expresidente de RI\n> Sencillo, sabio y le gusta ir a zonas rurales\n\n` +
        `*USO:*\n` +
        `> *${m.prefix}jokowi-ai <pregunta>*\n\n` +
        `*EJEMPLO:*\n` +
        `> *${m.prefix}jokowi-ai Pak, ¿cómo estás?*`
    );
  }

  await m.react("🕕");

  try {
    const result = await UnlimitedAI(text, "jokowi-ai");

    if (!result.status) {
      await m.react("☢");
      return m.reply(`❌ *Error de Jokowi AI*\n\n> ${result.error || "Error al obtener respuesta"}`);
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
