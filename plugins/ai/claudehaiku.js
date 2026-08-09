import { ClaudeHaiku } from "../../src/scraper/claudehaiku.js";
import { saluranCtx } from "../../src/lib/luffy-context.js";
import te from "../../src/lib/luffy-error.js";

const pluginConfig = {
  name: "claudehaiku",
  alias: ["claude", "haiku", "chiku"],
  category: "ai",
  description: "Chat con Claude Haiku 4.5 vía OverChat",
  usage: ".claudehaiku <pregunta>",
  example: ".claudehaiku Explica la teoría de la relatividad",
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
      `🤍 *Claude Haiku 4.5*\n\n` +
        `Pregúntale lo que sea al AI Claude Haiku — rápido y ligero, ideal para preguntas cotidianas.\n\n` +
        `*USO:*\n` +
        `> *${m.prefix}claudehaiku <pregunta>*\n\n` +
        `*EJEMPLO:*\n` +
        `> *${m.prefix}claudehaiku Explica la teoría de la relatividad*\n` +
        `> *${m.prefix}claudehaiku Tips para ser productivo*\n\n` +
        `_Respuestas rápidas, pero inteligentes_`
    );
  }

  await m.react("🕕");

  try {
    const result = await ClaudeHaiku(text);

    if (!result.status) {
      await m.react("☢");
      return m.reply(
        `❌ *Error de Claude Haiku*\n\n> ${result.error || "No se pudo obtener una respuesta"}`
      );
    }

    await m.react("✅");

    const reply = `${result.answer}`;
    await m.reply(reply.length > 4096 ? reply.slice(0, 4096) + "..." : reply, {
      contextInfo: saluranCtx(),
    });
  } catch (e) {
    console.error(e);
    await m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
