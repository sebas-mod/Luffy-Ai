import { getPlugin } from "../../src/lib/luffy-plugins.js";
import { getDatabase } from "../../src/lib/luffy-database.js";

const config = {
  name: "limite_premium",
  alias: ["cappremium", "setprem"],
  category: "owner",
  description: "Marcar varias funciones a la vez como premium",
  usage: ".capprem <nombre_funcion1> <nombre_funcion2> ...",
  example: ".capprem hd jpm warn",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 0,
  carne: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  if (m.args.length === 0) {
    return m.reply(
      `💎 *SISTEMA CAP PREMIUM*\n\n` +
      `Sistema exclusivo para cambiar el estado de acceso de varias funciones a la vez a Premium.\n\n` +
      `*USO:*\n` +
      `- *${m.prefix}limite_premium <nombre_función1> <nombre_función2> ...* — Pueden ser varias a la vez\n\n` +
      `*EJEMPLO DE USO:*\n` +
      `- *${m.prefix}limite_premium hd jpm warn*\n\n` +
      `*EXPLICACIÓN:*\n` +
      `Introduce uno o más nombres de funciones que quieras volver Premium. Sepáralos con espacios.`
    );
  }

  await m.react("🕕");
  
  const db = getDatabase();
  const overrides = db.setting("capprem") || {};
  
  let successList = [];
  let failedList = [];
  
  for (const cmd of m.args) {
    const targetCommand = cmd.toLowerCase();
    const plugin = getPlugin(targetCommand);
    if (!plugin) {
      failedList.push(targetCommand);
    } else {
      overrides[plugin.config.name] = true;
      successList.push(plugin.config.name);
    }
  }
  
  db.setting("capprem", overrides);
  await db.save();

  await m.react("✅");
  
  let msg = `✅ *ESTADO CAMBIADO CON ÉXITO*\n\n`;
  if (successList.length > 0) {
    msg += `*Exitosos (PREMIUM 💎):*\n${successList.map(f => `- ${f}`).join("\n")}\n\n`;
  }
  if (failedList.length > 0) {
    msg += `*Fallidos (No encontrados):*\n${failedList.map(f => `- ${f}`).join("\n")}\n\n`;
  }
  
  msg += `_Las funciones de arriba (las exitosas) ahora solo pueden ser usadas por miembros Premium._`;
  
  return m.reply(msg.trim());
}

export { config, handler };
