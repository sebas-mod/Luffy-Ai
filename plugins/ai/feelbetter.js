import { FeelBetter } from "../../src/scraper/feeb.js";
import { saluranCtx } from "../../src/lib/luffy-context.js";
import te from "../../src/lib/luffy-error.js";

const pluginConfig = {
  name: "feelbetter",
  alias: ["feelbetterbot", "healing"],
  category: "ai",
  description: "Chatea con FeelBetterBot — una IA lista para escucharte sin juzgarte",
  usage: ".feelbetter <desahogo/pregunta>",
  example: ".feelbetter estoy triste ahora",
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
        `💚 *FeelBetterBot*\n\n` +
        `Una IA lista para escuchar tu desahogo — sin juzgar, con calidez y empatía.\n\n` +
        `*USO:*\n` +
        `> *${m.prefix}feelbetter <desahogo>*\n\n` +
        `*EJEMPLO:*\n` +
        `> *${m.prefix}feelbetter estoy triste ahora*\n` +
        `> *${m.prefix}feelbetter estoy muy agotado últimamente*\n\n` +
        `_Este bot no reemplaza a un profesional, pero puede ser un lugar seguro para desahogarse_\n\n` +
        `╰━━━━━━━━━━━━╯`
    );
  }

  await m.react("🕕");

  try {
    const result = await FeelBetter(text);

    if (!result.status) {
      await m.react("☢");
      return m.reply(
        `❌ *FeelBetter falló*\n✧────────✧\n> ${result.error || "Error al obtener la respuesta"}`
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
