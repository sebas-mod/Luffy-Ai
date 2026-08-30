import { getPlugin } from "../../src/lib/luffy-plugins.js";
import { getDatabase } from "../../src/lib/luffy-database.js";

const config = {
  name: "limite_carne",
  alias: ["setcarne"],
  category: "owner",
  description: "Cambiar el descuento de carne de varias funciones a la vez",
  usage: ".capcarne <función1> <función2> ... <cantidad>",
  example: ".capcarne hd fakedev 5",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 0,
  carne: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  if (m.args.length < 2) {
    return m.reply(
      `⚙️ *SISTEMA CAP ENERGÍA*\n\n` +
      `Sistema para cambiar dinámicamente la cantidad de energía que se descuenta de varias funciones a la vez.\n\n` +
      `*USO:*\n` +
      `- *${m.prefix}limite_carne <nombre_función1> <nombre_función2> ... <cantidad>*\n\n` +
      `*EJEMPLO DE USO:*\n` +
      `- *${m.prefix}limite_carne hd jpm 5* (Las funciones HD y JPM descuentan 5 de energía)\n` +
      `- *${m.prefix}limite_carne hd 0* (La función HD queda gratis en energía)\n\n` +
      `*EXPLICACIÓN:*\n` +
      `1. Introduce uno o varios nombres de funciones que quieras cambiar.\n` +
      `2. El último argumento (la última palabra) debe ser un NÚMERO (cantidad de energía a descontar).`
    );
  }

  const rawCost = m.args[m.args.length - 1];
  const cost = parseInt(rawCost);
  
  if (isNaN(cost) || cost < 0) {
    return m.reply(`👑•─────•👑\n❌ *ERROR*\n\nLa cantidad de energía (en el último argumento) debe ser un número 0 o mayor.\n♰ ──────── ♱✦`);
  }

  const commands = m.args.slice(0, -1);

  await m.react("🕕");
  
  const db = getDatabase();
  const overrides = db.setting("capcarne") || {};
  
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
  
  db.setting("capcarne", overrides);
  await db.save();

  await m.react("✅");
  
  let msg = `✅ *DESCUENTO DE ENERGÍA CAMBIADO CON ÉXITO*\n\n`;
  if (successList.length > 0) {
    msg += `*Cambiados a ${cost} Energía:*\n${successList.map(f => `- ${f}`).join("\n")}\n\n`;
  }
  if (failedList.length > 0) {
    msg += `*Fallidos (No encontrados):*\n${failedList.map(f => `- ${f}`).join("\n")}\n\n`;
  }
  
  msg += `_La configuración se guardó en la base de datos y aplica de inmediato._`;
  return m.reply(msg.trim());
}

export { config, handler };
