import { getPlugin } from "../../src/lib/ourin-plugins.js";
import { getDatabase } from "../../src/lib/ourin-database.js";

const config = {
  name: "capprem",
  alias: ["cappremium", "setprem"],
  category: "owner",
  description: "Marca varias funciones como premium de una vez",
  usage: ".capprem <nombre_fesor1> <nombre_fesor2> ...",
  example: ".capprem hd jpm warn",
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
      `💎 *SISTEM CAP PREMIUM*\n\n` +
      `Sistema exclusivo para cambiar el estado de acceso de muchas funciones a la vez a Premium.\n\n` +
      `*PENGGUNAAN:*\n` +
      `- *${m.prefix}capprem <nombre_fesor1> <nombre_fesor2> ...* — Puedes varios a la vez\n\n` +
      `*CONTOH PENGGUNAAN:*\n` +
      `- *${m.prefix}capprem hd jpm warn*\n\n` +
      `*PENJELASAN:*\n` +
      `Ingresa uno o más nombres de funciones que quieres convertir en Premium. Sepáralos con espacios.`
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
  
  let msg = `✅ *STATUS BERHASIL DIUBAH*\n\n`;
  if (successList.length > 0) {
    msg += `*Éxito (PREMIUM 💎):*\n${successList.map(f => `- ${f}`).join("\n")}\n\n`;
  }
  if (failedList.length > 0) {
    msg += `*Fallo (No encontrado):*\n${failedList.map(f => `- ${f}`).join("\n")}\n\n`;
  }
  
  msg += `_Las funciones anteriores (las exitosas) ahora solo pueden ser accedidas por miembros Premium._`;
  
  return m.reply(msg.trim());
}

export { config, handler };
