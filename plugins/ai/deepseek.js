import { DeepSeekThinking } from "../../src/scraper/deepseek.js";
import { saluranCtx } from "../../src/lib/luffy-context.js";
import te from "../../src/lib/luffy-error.js";

const pluginConfig = {
  name: "deepseek",
  alias: ["ds", "dsv4", "deepthink"],
  category: "ai",
  description: "Chat con DeepSeek V4 (thinking/reasoning)",
  usage: ".deepseek <pregunta>",
  example: ".deepseek Explica el agujero negro",
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
      `🧠 *DeepSeek V4*\n\n` +
        `AI que piensa antes de responder — ideal para preguntas que requieren razonamiento.\n\n` +
        `*USO:*\n` +
        `> *${m.prefix}deepseek <pregunta>*\n\n` +
        `*EJEMPLO:*\n` +
        `> *${m.prefix}deepseek Explica el agujero negro*\n` +
        `> *${m.prefix}deepseek Crea código de algoritmo de ordenamiento*\n\n` +
        `_El bot piensa primero y luego responde — así que tarda un poco más_`,
    );
  }

  await m.react("🕕");

  try {
    const result = await DeepSeekThinking(text);

    if (!result.success) {
      await m.react("☢");
      return m.reply(`❌ *Error de DeepSeek*\n\n> No se pudo obtener una respuesta`);
    }

    await m.react("✅");

    let reply = ``;

    if (result.reasoning) {
      const reasoningPreview =
        result.reasoning.length > 800
          ? result.reasoning.slice(0, 800) + "..."
          : result.reasoning;
      reply += `💭 *Proceso de Pensamiento:*\n${reasoningPreview.replace(/\n/g, "\n> ")}\n\n`;
    }

    if (result.answer) {
      reply += `${result.answer}`;
    }

    if (reply.length > 4096) {
      reply = reply.slice(0, 4096) + "\n\n... (recortado)";
    }

    await m.reply(reply);
  } catch (e) {
    console.error(e);
    await m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
