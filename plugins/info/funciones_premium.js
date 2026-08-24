import { getAllPlugins } from "../../src/lib/luffy-plugins.js";
import { getDatabase } from "../../src/lib/luffy-database.js";

const config = {
  name: "funciones_premium",
  alias: ["listprem", "listpremium", "funcionesprem"],
  category: "info",
  description: "Ver la lista de todas las funciones premium del bot",
  usage: ".funciones_premium",
  example: ".funciones_premium",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  carne: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  await m.react("🕕");

  const db = getDatabase();
  const overrides = db.setting("capprem") || {};
  const allPlugins = getAllPlugins();
  
  let premiumFeatures = [];
  
  for (const plugin of allPlugins) {
    if (plugin && plugin.config && plugin.config.name) {
      const isPremium = overrides[plugin.config.name] !== undefined 
        ? overrides[plugin.config.name] 
        : plugin.config.isPremium;
        
      if (isPremium) {
        premiumFeatures.push(plugin.config.name);
      }
    }
  }
  
  if (premiumFeatures.length === 0) {
    await m.react("✅");
    return m.reply(
      `╭━━━〔 📝 PREMIUM 〕━━━╮\n\n` +
      `📝 Actualmente no hay funciones registradas como premium exclusivas.\n\n` +
      `╰━━━━━━━━━━━━╯`
    );
  }
  
  premiumFeatures.sort(); // Urutkan sesuai abjad
  
  let listText = premiumFeatures.map((f) => `╰┈➤ ${f}`).join("\n");

  await m.react("✅");
  return m.reply(
    `╭━━━〔 💎 PREMIUM 〕━━━╮\n\n` +
    `💎 *LISTA DE FUNCIONES PREMIUM*\n\n` +
    `Funciones exclusivas a las que solo pueden acceder los miembros con estado Premium:\n\n` +
    `${listText}\n\n` +
    `╰━━━━━━━━━━━━╯\n\n` +
    `_Para suscribirte a premium, por favor contacta al capitán._`
  );
}

export { config, handler };
