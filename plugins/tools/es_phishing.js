import axios from "axios";

const pluginConfig = {
  name: "es_phishing",
  alias: ["ver_phishing", "checkphishing", "webphishing"],
  category: "tools",
  description: "Comprueba si una URL es un sitio de phising/peligroso o seguro.",
  usage: ".es_phishing <url>",
  example: ".es_phishing https://google.com",
  cooldown: 10,
  carne: 2,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const url = m.text?.trim();

  if (!url) {
    return m.reply(
      `☽◯☾ ╭ ♰ 🛡️ ♰ ━╮ ☽◯☾\n☽◯☾ ♰ Hola *${m.pushName}* 👋\n──────────\n☽◯☾ ♰ Ingresa el enlace URL que quieres comprobar su seguridad.\n\n✧ Ejemplo:\n☽◯☾ ♰ \`${m.prefix}es_phishing https://google.com\`\n╰━━━━━╯`
    );
  }

  m.react("🕕");

  try {
    const apiUrl = `https://api.nexray.eu.cc/tools/webphishing?url=${encodeURIComponent(url)}`;
    const res = await axios.get(apiUrl);
    const data = res.data;

    if (!data.status || !data.result) {
      await m.react("❌");
      return m.reply(`☽◯☾ ♰ ⚠️ No se pudo comprobar la URL.\n──────────\n☽◯☾ ♰ Asegúrate de que el enlace sea válido o inténtalo de nuevo más tarde.`);
    }

    const { result } = data;
    
    let info = `☽◯☾ ╭━ ♰ 🛡️ ᴀɴÁʟɪsɪs ᴅᴇ ʟᴀ ᴜʀʟ ♰ ━╮ ☽◯☾\n\n`;
    info += `☽◯☾ ♰ 🔗 *URL:* ${result.scanned_url}\n`;
    info += `☽◯☾ ♰ 📊 *Estado:* ${result.status_description}\n\n`;
    info += `♰ ──────── ♱\n*DETALLE DEL ANÁLISIS:*\n`;
    info += `☽◯☾ ♰ Phishing: ${result.is_phishing ? "🚨 Sí" : "✅ No"}\n`;
    info += `☽◯☾ ♰ Contiene malware: ${result.contains_malware ? "🚨 Sí" : "✅ No"}\n`;
    info += `☽◯☾ ♰ Redirige a sitios peligrosos: ${result.sends_to_harmful_sites ? "🚨 Sí" : "✅ No"}\n`;
    info += `☽◯☾ ♰ Instala software malicioso: ${result.installs_malicious_software ? "🚨 Sí" : "✅ No"}\n`;
    info += `☽◯☾ ♰ Descargas no habituales: ${result.uncommon_downloads ? "🚨 Sí" : "✅ No"}\n\n`;
    info += `──────────\n_Última comprobación: ${new Date(result.last_modified).toLocaleString("id-ID")}_\n\n╰━ ⊱༺༒༻⊰ ━╯`;

    await m.reply(info);
    m.react("✅");

  } catch (error) {
    console.error("[Phishing Check Error]", error);
    await m.react("❌");
    m.reply(`☽◯☾ ♰ 😔 Se produjo un error del sistema al comprobar la URL. Inténtalo de nuevo más tarde.`);
  }
}

export { pluginConfig as config, handler };
