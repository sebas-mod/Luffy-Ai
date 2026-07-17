import { getPlugin } from "../../src/lib/ourin-plugins.js";
import { getDatabase } from "../../src/lib/ourin-database.js";

const pluginConfig = {
  name: "capfree",
  alias: ["capgratis", "setfree"],
  category: "owner",
  description: "Marca varias funciones como gratuitas de una vez",
  usage: ".capfree <nombre_fesor1> <nombre_fesor2> ...",
  example: ".capfree hd jpm warn",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 0,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  if (m.args.length === 0) {
    return m.reply(
      `🆓 *SISTEM CAP FREE*\n\n` +
      `Sistema para devolver el estado de acceso de muchas funciones a la vez a gratuito de forma pública.\n\n` +
      `*USO:*\n` +
      `- *${m.prefix}capfree <nombre_fesor1> <nombre_fesor2> ...* — Puedes varios a la vez\n\n` +
      `*EJEMPLO DE USO:*\n` +
      `- *${m.prefix}capfree hd jpm warn*\n\n` +
      `*EXPLICACIÓN:*\n` +
      `Ingresa uno o más nombres de funciones que quieres hacer gratuitas. Sepáralos con espacios.`
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
      overrides[plugin.config.name] = false;
      successList.push(plugin.config.name);
    }
  }
  
  db.setting("capprem", overrides);
  await db.save();

  await m.react("✅");
  
  let msg = `✅ *ESTADO CAMBIADO CON ÉXITO*\n\n`;
  if (successList.length > 0) {
    msg += `*Éxito (FREE 🆓):*\n${successList.map(f => `- ${f}`).join("\n")}\n\n`;
  }
  if (failedList.length > 0) {
    msg += `*Fallo (No encontrado):*\n${failedList.map(f => `- ${f}`).join("\n")}\n\n`;
  }
  
  msg += `_Las funciones anteriores (las exitosas) ahora son de acceso libre para todos los miembros._`;
  
  return m.reply(msg.trim());
}

export { pluginConfig as config, handler };
