import { getPlugin } from "../../src/lib/ourin-plugins.js";
import { getDatabase } from "../../src/lib/ourin-database.js";

const config = {
  name: "capenergi",
  alias: ["setenergi"],
  category: "owner",
  description: "Cambia de una vez el consumo de energía de varias funciones",
  usage: ".capenergi <nombre_fesor1> <nombre_fesor2> ... <cantidad>",
  example: ".capenergi hd faadev 5",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 0,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  if (m.args.length < 2) {
    return m.reply(
      `⚙️ *SISTEM CAP ENERGI*\n\n` +
      `Sistema para cambiar de forma dinámica la cantidad de energía que se descuenta para muchas funciones a la vez.\n\n` +
      `*USO:*\n` +
      `- *${m.prefix}capenergi <nombre_fesor1> <nombre_fesor2> ... <cantidad>*\n\n` +
      `*EJEMPLO DE USO:*\n` +
      `- *${m.prefix}capenergi hd jpm 5* (Fesor HD & JPM descuenta 5 de energía)\n` +
      `- *${m.prefix}capenergi hd 0* (Fesor HD se convierte en energía gratis)\n\n` +
      `*EXPLICACIÓN:*\n` +
      `1. Ingresa uno o muchos nombres de funciones que quieres cambiar.\n` +
      `2. Al final (última palabra) debe ser un NÚMERO (cantidad de descuento de energía).`
    );
  }

  const rawCost = m.args[m.args.length - 1];
  const cost = parseInt(rawCost);
  
  if (isNaN(cost) || cost < 0) {
    return m.reply(`❌ *ERROR*\n\nLa cantidad de energía (en el último argumento) debe ser un número 0 o mayor.`);
  }

  const commands = m.args.slice(0, -1);

  await m.react("🕕");
  
  const db = getDatabase();
  const overrides = db.setting("capenergi") || {};
  
  let successList = [];
  let failedList = [];
  
  for (const cmd of commands) {
    const targetCommand = cmd.toLowerCase();
    const plugin = getPlugin(targetCommand);
    if (!plugin) {
      failedList.push(targetCommand);
    } else {
      overrides[plugin.config.name] = cost;
      successList.push(plugin.config.name);
    }
  }
  
  db.setting("capenergi", overrides);
  await db.save();

  await m.react("✅");
  
  let msg = `✅ *DESCUENTO DE ENERGÍA CAMBIADO CON ÉXITO*\n\n`;
  if (successList.length > 0) {
    msg += `*Éxito cambiado a ${cost} Energi:*\n${successList.map(f => `- ${f}`).join("\n")}\n\n`;
  }
  if (failedList.length > 0) {
    msg += `*Fallo (No encontrado):*\n${failedList.map(f => `- ${f}`).join("\n")}\n\n`;
  }
  
  msg += `_La configuración se ha guardado en la base de datos y se aplica inmediatamente._`;
  return m.reply(msg.trim());
}

export { config, handler };
