import { UnlimitedAI } from "../../src/scraper/unlimitedai.js";
import te from "../../src/lib/luffy-error.js";

const pluginConfig = {
  name: "luffy-ai",
  alias: ["luffyai", "luffy"],
  category: "ai",
  description: "Chat con Luffy AI — Asistente inteligente del bot",
  usage: ".luffy-ai <pregunta>",
  example: ".luffy-ai ¿Qué es Node.js?",
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
      `╭━━━〔 ✦ 〕━━━╮\n\n` +
      `🤖 *Luffy AI*\n\n` +
        `> Asistente inteligente listo para ayudar\n\n` +
        `*USO:*\n` +
        `> *${m.prefix}luffy-ai <pregunta>*\n\n` +
        `*EJEMPLO:*\n` +
        `> *${m.prefix}luffy-ai ¿Qué es Node.js?*\n\n` +
      `╰━━━━━━━━━━━━╯`
    );
  }

  await m.react("🕕");

  try {
    const result = await UnlimitedAI(text, "luffy-ai");

    if (!result.status) {
      await m.react("☢");
      return m.reply(`❌ *Error de Luffy AI*\n✧────────✧\n> ${result.error || "No se pudo obtener una respuesta"}`);
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
