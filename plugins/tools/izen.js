import fetch from "node-fetch";
import te from "../../src/lib/ourin-error.js";

const pluginConfig = {
  name: "izen",
  alias: ["skiplink", "izen"],
  category: "tools",
  description: "Bypass de shortlink / skiplink usando izen",
  usage: ".izen enlace",
  example: ".izen https://sfl.gl/xxxxx",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { args, sock }) {
  if (!args[0]) {
    let txt = `🔗 *SKIPLINK BYPASS* 🔗\n\n`;
    txt += `¡Hola! ¿Tienes un enlace con publicidad que no puedes pasar? ¡Aquí te ayudo a saltártelo para llegar directo al destino final!\n\n`;
    txt += `*Cómo Usar:*\n`;
    txt += `👉 \`${m.prefix}izen <enlace>\`\n\n`;
    txt += `*Ejemplo:*\n`;
    txt += `👉 \`${m.prefix}izen https://sfl.gl/xxxxx\``;
    return m.reply(txt);
  }

  await m.react("⏳");
  
  try {
    const res = await fetch(`https://anabot.my.id/api/tools/izenLOL?url=${encodeURIComponent(args[0])}&apikey=freeApikey`);
    const json = await res.json();
    
    if (!json.data?.result?.result) {
       return m.reply("❌ ¡Vaya, no se pudo pasar el enlace! Prueba con otro.");
    }
    
    let txt = `✅ *BERHASIL BYPASS LINK!* ✅\n\n`;
    txt += `*Link Asli:* \n`;
    txt += `🔗 ${args[0]}\n\n`;
    txt += `*Hasil Bypass:* \n`;
    txt += `🚀 ${json.data.result.result}\n\n`;
    txt += `Semoga ngebantu ya kak! ✨`;
    
    await m.reply(txt);
    await m.react("✅");
  } catch (e) {
    m.reply(`❌ Lo siento, ¡ocurrió un error del sistema! 😭\nError: ${e.message}`);
  }
}

export { pluginConfig as config, handler };
