import { getPlugin } from "../../src/lib/ourin-plugins.js";
import { getDatabase } from "../../src/lib/ourin-database.js";

const pluginConfig = {
  name: "whatrolethis",
  alias: ["whatrole", "cekrole", "cekakses"],
  category: "info",
  description: "Verificar requisitos de acceso de múltiples funciones a la vez",
  usage: ".whatrolethis <nama_fitur1> <nama_fitur2> ...",
  example: ".whatrolethis hd jpm",
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
      `🔍 *VERIFICACIÓN DE ACCESO A FUNCIONES*\n\n` +
      `Sistema para conocer los detalles de los requisitos de acceso de una o varias funciones a la vez.\n\n` +
      `*USO:*\n` +
      `- *${m.prefix}whatrolethis <nombre_funcion1> <nombre_funcion2> ...*\n\n` +
      `*EJEMPLO DE USO:*\n` +
      `- *${m.prefix}whatrolethis hd jpm warn*\n\n` +
      `*EXPLICACIÓN:*\n` +
      `Ingresa el comando junto con uno o varios nombres de funciones que quieras verificar. Sepáralos con espacios.`
    );
  }

  await m.react("🕕");
  
  const db = getDatabase();
  const overrides = db.setting("capprem") || {};
  
  let responseText = `🔍 *DETALLE DE ACCESO A FUNCIONES*\n\n`;
  
  for (const cmd of m.args) {
    const targetCommand = cmd.toLowerCase();
    const plugin = getPlugin(targetCommand);
    
    if (!plugin) {
      responseText += `❌ *${targetCommand}* : ¡No encontrado!\n\n`;
      continue;
    }
    
    const isPremium = overrides[plugin.config.name] !== undefined 
      ? overrides[plugin.config.name] 
      : plugin.config.isPremium;
    
    let roles = [];
    
    if (plugin.config.isOwner)       roles.push("Solo Owner 👑");
    if (plugin.config.isAdmin) roles.push("Admin del Grupo 👮");
    if (plugin.config.isBotAdmin) roles.push("Bot Admin 🤖");
    if (plugin.config.isGroup) roles.push("Solo Grupo 👥");
    if (plugin.config.isPrivate) roles.push("Chat Privado 📱");
    if (isPremium) roles.push("Premium 💎");
    
    if (roles.length === 0) {
      roles.push("Gratis / Todos 🆓");
    }
    
    let listRoles = roles.map(r => `  - ${r}`).join("\n");
    responseText += `✅ *${plugin.config.name}*\n${listRoles}\n\n`;
  }

  await m.react("✅");
  return m.reply(responseText.trim());
}

export { pluginConfig as config, handler };
