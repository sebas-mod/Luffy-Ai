import { UnlimitedAI } from "../../src/scraper/unlimitedai.js";
import te from "../../src/lib/luffy-error.js";

const pluginConfig = {
  name: "prabowo-ai",
  alias: ["prabowoi", "prabowo", "pakprabowo"],
  category: "ai",
  description: "Chat con el Sr. Prabowo — El hombre de la palma",
  usage: ".prabowo-ai <pregunta>",
  example: ".prabowo-ai Hermano, ¡debemos ser soberanos!",
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
      `☽◯☾ ╭━ ♰ ✦ ♰ ━╮ ☽◯☾\n\n` +
      `🇮🇩 *Pak Prabowo*\n\n` +
        `> El hombre de la palma — Presidente de Indonesia\n> Firme, patriótico y carismático\n\n` +
        `*USO:*\n` +
        `> *${m.prefix}prabowo-ai <pregunta>*\n\n` +
        `*EJEMPLO:*\n` +
        `> *${m.prefix}prabowo-ai Hermano, ¡debemos ser soberanos!*\n\n` +
      `╰━ ⊱༺༒༻⊰ ━╯`
    );
  }

  await m.react("🕕");

  try {
    const result = await UnlimitedAI(text, "prabowo-ai");

    if (!result.status) {
      await m.react("☢");
      return m.reply(`❌ *Error de Prabowo AI*\n✧────────✧\n> ${result.error || "No se pudo obtener una respuesta"}`);
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
