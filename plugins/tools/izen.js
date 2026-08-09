import fetch from "node-fetch";
import te from "../../src/lib/luffy-error.js";

const pluginConfig = {
  name: "izen",
  alias: ["skiplink", "izen"],
  category: "tools",
  description: "Omite enlaces cortos / skiplink usando izen",
  usage: ".izen link",
  example: ".izen https://sfl.gl/xxxxx",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  carne: 1,
  isEnabled: true,
};

async function handler(m, { args, sock }) {
  if (!args[0]) {
    let txt = `🔗 *OMISIÓN DE ENLACE CORTO* 🔗\n\n`;
    txt += `¡Hola! ¿Tienes un enlace complicado con publicidad? Déjame ayudarte a omitirla para ir directo al destino final!\n\n`;
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
       return m.reply("❌ ¡Vaya, no se pudo omitir el enlace! Intenta con otro enlace.");
    }
    
    let txt = `✅ *¡ENLACE OMITIDO CON ÉXITO!* ✅\n\n`;
    txt += `*Enlace Original:* \n`;
    txt += `🔗 ${args[0]}\n\n`;
    txt += `*Resultado de la Omisión:* \n`;
    txt += `🚀 ${json.data.result.result}\n\n`;
    txt += `¡Espero que te ayude! ✨`;
    
    await m.reply(txt);
    await m.react("✅");
  } catch (e) {
    m.reply(`❌ Lo siento, ocurrió un error del sistema! 😭\nError: ${e.message}`);
  }
}

export { pluginConfig as config, handler };
