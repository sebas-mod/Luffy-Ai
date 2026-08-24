import { getPlugin } from "../../src/lib/luffy-plugins.js";
import { getDatabase } from "../../src/lib/luffy-database.js";

const config = {
  name: "cuantacarne",
  alias: ["checkcarne"],
  category: "info",
  description: "Revisa el uso de carne de muchas funciones a la vez",
  usage: ".cuantacarne <función1> <función2> ...",
  example: ".cuantacarne hd jpm",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  carne: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  if (m.args.length === 0) {
    return m.reply(
      `🔍 *REVISIÓN DE CARNE DE FUNCIONES*\n\n` +
      `Sistema para saber cuánta carne se descuenta al usar una o varias funciones a la vez.\n\n` +
      `*USO:*\n` +
      `- *${m.prefix}cuantacarne <función1> <función2> ...*\n\n` +
      `*EJEMPLO DE USO:*\n` +
      `- *${m.prefix}cuantacarne hd jpm*\n\n` +
      `*EXPLICACIÓN:*\n` +
      `Escribe el comando junto con uno o varios nombres de funciones que quieras revisar. Sepáralos con espacios.`
    );
  }

  await m.react("🕕");
  
  const db = getDatabase();
  const overrides = db.setting("capcarne") || {};
  
  let responseText = `╭━━━〔 🔋 CARNE 〕━━━╮\n\n🔋 *DETALLES DE CARNE DE FUNCIONES*\n\n`;
  
  for (const cmd of m.args) {
    const targetCommand = cmd.toLowerCase();
    const plugin = getPlugin(targetCommand);
    
    if (!plugin) {
      responseText += `╰┈➤ ❌ *${targetCommand}* : ¡No encontrado!\n\n`;
      continue;
    }
    
    const carneCost = overrides[plugin.config.name] !== undefined 
      ? overrides[plugin.config.name] 
      : (plugin.config.carne || 0);
      
    responseText += `╰┈➤ ✅ *${plugin.config.name}* : ${carneCost} Carne\n`;
  }

  responseText += `\n╰━━━━━━━━━━━━╯`;

  await m.react("✅");
  return m.reply(responseText.trim());
}

export { config, handler };
