import axios from "axios";
import config from "../../config.js";
import te from "../../src/lib/ourin-error.js";

const pluginConfig = {
  name: "caribug",
  alias: ["debug", "findbug"],
  category: "tools",
  description: "Buscar bugs en código de programación",
  usage: ".caribug [código] o responder con código",
  example: ".caribug function test() {}",
  cooldown: 20,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { args }) {
  let code = m.quoted?.text || args.join(" ");

  if (!code) {
    return m.reply(
      `*🐛 CARI BUG*\n\nEnvía código o responde a un mensaje con código para buscar bugs.\n\nEjemplo:\n\`${m.prefix}caribug function test() {}\``
    );
  }

  m.react("🕕");

  try {
    const apiUrl = `https://api.cuki.biz.id/api/aicode/caribug`;
    const res = await axios.get(apiUrl, {
      params: {
        apikey: config.APIkey.cuki,
        code: code,
        language: "auto"
      },
      timeout: 60000
    });

    const data = res.data;

    if (!data.success || !data.data) {
      throw new Error("Error al analizar el código desde el servidor");
    }

    const info = data.data;
    const meta = info.metadata;
    const bugInfo = info.bugsFound;
    
    let text = `*🐛 RESULTADO DEL ANÁLISIS DE BUGS*\n\n`;
    text += `*Lenguaje:* ${meta.detectedLanguage}\n`;
    text += `*Nivel:* ${meta.severityInfo.level} ${meta.severityInfo.icon}\n`;
    text += `*Bugs Encontrados:* ${bugInfo.total}\n\n`;
    
    if (bugInfo.summary) {
      text += `*📝 Resumen:*\n${bugInfo.summary}\n\n`;
    }
    
    if (info.codeAnalysis?.fixed?.code) {
      text += `*✨ Código Corregido:*\n\`\`\`${meta.detectedLanguage}\n${info.codeAnalysis.fixed.code}\n\`\`\`\n\n`;
    }
    
    if (bugInfo.details && bugInfo.details.length > 0) {
      text += `*📌 Detalle:* \n`;
      bugInfo.details.forEach((d, i) => {
        text += `- ${d.type || d.description}\n`;
      });
    }

    m.react("✅");
    await m.reply(text.trim());
  } catch (err) {
    console.error("[CariBug]", err.message);
    m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
