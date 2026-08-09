import { Qwen3 } from "../../src/scraper/qwen3.js";
import { saluranCtx } from "../../src/lib/luffy-context.js";
import te from "../../src/lib/luffy-error.js";

const pluginConfig = {
  name: "qwen3",
  alias: ["qwen", "qw3"],
  category: "ai",
  description: "Chat con Qwen3 80B vía OverChat",
  usage: ".qwen3 <pregunta>",
  example: ".qwen3 ¿Qué es machine learning?",
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
      `🔵 *Qwen3 80B*\n\n` +
        `Pregúntale lo que sea al AI Qwen3 — modelo grande de Alibaba que domina cualquier idioma.\n\n` +
        `*USO:*\n` +
        `> *${m.prefix}qwen3 <pregunta>*\n\n` +
        `*EJEMPLO:*\n` +
        `> *${m.prefix}qwen3 ¿Qué es machine learning?*\n` +
        `> *${m.prefix}qwen3 Crea una receta de cocina indonesia*\n\n` +
        `_Modelo 80B, tarda un poco pero sus respuestas son excelentes_`
    );
  }

  await m.react("🕕");

  try {
    const result = await Qwen3(text);

    if (!result.status) {
      await m.react("☢");
      return m.reply(
        `❌ *Error de Qwen3*\n\n> ${result.error || "No se pudo obtener una respuesta"}`
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
