import { getPlugin } from "../../src/lib/ourin-plugins.js";
import { getDatabase } from "../../src/lib/ourin-database.js";

const pluginConfig = {
  name: "howmuchenergy",
  alias: ["cekenergi"],
  category: "info",
  description: "Verificar el consumo de energía de múltiples funciones a la vez",
  usage: ".howmuchenergy <nama_fitur1> <nama_fitur2> ...",
  example: ".howmuchenergy hd jpm",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  if (m.args.length === 0) {
    return m.reply(
      `🔍 *VERIFICACIÓN DE ENERGÍA DE FUNCIONES*\n\n` +
      `Sistema para saber cuánta energía se necesita para usar una o varias funciones a la vez.\n\n` +
      `*USO:*\n` +
      `- *${m.prefix}howmuchenergy <nombre_funcion1> <nombre_funcion2> ...*\n\n` +
      `*EJEMPLO DE USO:*\n` +
      `- *${m.prefix}howmuchenergy hd jpm*\n\n` +
      `*EXPLICACIÓN:*\n` +
      `Ingresa el comando junto con uno o varios nombres de funciones que quieras verificar. Sepáralos con espacios.`
    );
  }

  await m.react("🕕");
  
  const db = getDatabase();
  const overrides = db.setting("capenergi") || {};
  
  let responseText = `🔋 *DETALLE DE ENERGÍA DE FUNCIONES*\n\n`;
  
  for (const cmd of m.args) {
    const targetCommand = cmd.toLowerCase();
    const plugin = getPlugin(targetCommand);
    
    if (!plugin) {
      responseText += `❌ *${targetCommand}* : ¡No encontrado!\n\n`;
      continue;
    }
    
    const energiCost = overrides[plugin.config.name] !== undefined 
      ? overrides[plugin.config.name] 
      : (plugin.config.energi || 0);
      
    responseText += `✅ *${plugin.config.name}* : ${energiCost} Energi\n`;
  }

  await m.react("✅");
  return m.reply(responseText.trim());
}

export { pluginConfig as config, handler };
