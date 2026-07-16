import { getAllPlugins } from "../../src/lib/ourin-plugins.js";
import { getDatabase } from "../../src/lib/ourin-database.js";

const pluginConfig = {
  name: "fiturpremium",
  alias: ["listprem", "listpremium", "fiturprem"],
  category: "info",
  description: "Ver la lista de todas las funciones premium del bot",
  usage: ".fiturpremium",
  example: ".fiturpremium",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
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
      `📝 *LISTA DE FUNCIONES PREMIUM*\n\n` +
      `Actualmente no hay funciones registradas como premium exclusivas.`
    );
  }
  
  premiumFeatures.sort(); // Urutkan sesuai abjad
  
  let listText = premiumFeatures.map((f) => `- ${f}`).join("\n");
  
  await m.react("✅");
  return m.reply(
    `💎 *LISTA DE FUNCIONES PREMIUM*\n\n` +
    `Estas son todas las funciones exclusivas a las que solo pueden acceder los miembros con estatus Premium:\n\n` +
    `${listText}\n\n` +
    `_Para suscribirte a premium, contacta al owner._`
  );
}

export { pluginConfig as config, handler };
