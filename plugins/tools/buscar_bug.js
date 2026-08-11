import axios from "axios";
import config from "../../config.js";
import te from "../../src/lib/luffy-error.js";

const pluginConfig = {
  name: "buscar_bug",
  alias: ["debug", "findbug"],
  category: "tools",
  description: "Busca errores en código de programación",
  usage: ".caribug [código] o responde un código",
  example: ".caribug function test() {}",
  cooldown: 20,
  carne: 1,
  isEnabled: true,
};

async function handler(m, { args }) {
  let code = m.quoted?.text || args.join(" ");

  if (!code) {
    return m.reply(
      `*🐛 BUSCAR ERRORES*\n\nEnvía código o responde a un mensaje con código para buscar errores.\n\nEjemplo:\n\`${m.prefix}buscar_bug function test() {}\``
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
    
    let text = `🐛 *RESULTADO DE ANÁLISIS DE ERRORES*\n\n`;
    text += `*Lenguaje:* ${meta.detectedLanguage}\n`;
    text += `*Nivel:* ${meta.severityInfo.level} ${meta.severityInfo.icon}\n`;
    text += `*Errores Encontrados:* ${bugInfo.total}\n\n`;
    
    if (bugInfo.summary) {
      text += `*📝 Resumen:*\n${bugInfo.summary}\n\n`;
    }
    
    if (info.codeAnalysis?.fixed?.code) {
      text += `*✨ Código Corregido:*\n\`\`\`${meta.detectedLanguage}\n${info.codeAnalysis.fixed.code}\n\`\`\`\n\n`;
    }
    
    if (bugInfo.details && bugInfo.details.length > 0) {
      text += `*📌 Detalles:* \n`;
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
