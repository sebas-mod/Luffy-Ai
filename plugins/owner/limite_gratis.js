import { getPlugin } from "../../src/lib/luffy-plugins.js";
import { getDatabase } from "../../src/lib/luffy-database.js";

const config = {
  name: "limite_gratis",
  alias: ["capgratis", "setfree"],
  category: "owner",
  description: "Marcar varias funciones a la vez como gratuitas",
  usage: ".capfree <nombre_funcion1> <nombre_funcion2> ...",
  example: ".capfree hd jpm warn",
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
      `╭━━━〔 👑 OWNER 〕━━━╮\n` +
      `┃ 🆓 *SISTEMA CAP FREE*\n` +
      `╰━━━━━━━━━━━━╯\n\n` +
      `╰┈➤ Sistema para devolver el estado de acceso de varias funciones a la vez y dejarlas gratis para el público.\n\n` +
      `*USO:*\n` +
      `- *${m.prefix}limite_gratis <nombre_función1> <nombre_función2> ...* — Pueden ser varias a la vez\n\n` +
      `*EJEMPLO DE USO:*\n` +
      `- *${m.prefix}limite_gratis hd jpm warn*\n\n` +
      `*EXPLICACIÓN:*\n` +
      `Introduce uno o más nombres de funciones que quieras dejar gratis. Sepáralos con espacios.`
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
  
  let msg = `╭━━━〔 ✦ ÉXITO 〕━━━╮\n┃ ✅ *ESTADO CAMBIADO CON ÉXITO*\n╰━━━━━━━━━━━━╯\n\n`;
  if (successList.length > 0) {
    msg += `*Exitosos (FREE 🆓):*\n${successList.map(f => `- ${f}`).join("\n")}\n\n`;
  }
  if (failedList.length > 0) {
    msg += `*Fallidos (No encontrados):*\n${failedList.map(f => `- ${f}`).join("\n")}\n\n`;
  }
  
  msg += `_Las funciones de arriba (las exitosas) ahora son de libre acceso para todos los miembros._\n`;
  msg += `✦────────✦`;
  
  return m.reply(msg.trim());
}

export { config, handler };
