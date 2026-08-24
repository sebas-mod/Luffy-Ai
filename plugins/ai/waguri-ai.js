import { UnlimitedAI } from "../../src/scraper/unlimitedai.js";
import te from "../../src/lib/luffy-error.js";

const pluginConfig = {
  name: "waguri-ai",
  alias: ["waguriai", "waguri"],
  category: "ai",
  description: "Chat con Waguri-san — La chica tímida que olvidó sus gafas",
  usage: ".waguri-ai <pregunta>",
  example: ".waguri-ai ¡Waguri-san, hola!",
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
      `👓 *Waguri-san*\n\n` +
        `> La chica tímida de "The Girl I Like Forgot Her Glasses"\n> Dulce, atenta y a menudo se pone nerviosa~\n\n` +
        `*USO:*\n` +
        `> *${m.prefix}waguri-ai <pregunta>*\n\n` +
        `*EJEMPLO:*\n` +
        `> *${m.prefix}waguri-ai ¡Waguri-san, hola!*\n\n` +
      `╰━━━━━━━━━━━━╯`
    );
  }

  await m.react("🕕");

  try {
    const result = await UnlimitedAI(text, "waguri-ai");

    if (!result.status) {
      await m.react("☢");
      return m.reply(`❌ *Error de Waguri AI*\n✧────────✧\n> ${result.error || "No se pudo obtener una respuesta"}`);
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
