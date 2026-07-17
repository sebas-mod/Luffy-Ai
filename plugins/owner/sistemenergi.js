import { getDatabase } from "../../src/lib/ourin-database.js";

const pluginConfig = {
  name: "sistemenergi",
  alias: ["sistemlimit", "energimode", "limitmode"],
  category: "owner",
  description: "Consulta, activa o desactiva globalmente el sistema de energía",
  usage: ".sistemenergi [on / off]",
  example: ".sistemenergi on",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 0,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const mode = m.args[0]?.toLowerCase();
  const db = getDatabase();
  
  const currentStatus = db.setting("energi") !== undefined ? db.setting("energi") : true;
  
  if (!mode || (mode !== "on" && mode !== "off")) {
    return m.reply(
      `🎛️ *CONTROL DEL SISTEMA DE ENERGÍA*\n\n` +
      `La función principal para activar o desactivar todo el sistema de descuento de energía del bot de forma global.\n\n` +
      `*ESTADO ACTUAL:*\n` +
      `- Mode: *${currentStatus ? "ACTIVO 🔋" : "INACTIVO (UNLIMITED) ♾️"}*\n\n` +
      `*USO:*\n` +
      `- *${m.prefix}sistemenergi on* — Activar el descuento de energía\n` +
      `- *${m.prefix}sistemenergi off* — Desactivar el descuento de energía (Modo ilimitado)\n\n` +
      `*EJEMPLO DE USO:*\n` +
      `- *${m.prefix}sistemenergi on*`
    );
  }

  await m.react("🕕");
  
  const isEnabled = mode === "on";
  
  db.setting("energi", isEnabled);
  await db.save();

  await m.react("✅");
  return m.reply(
    `✅ *ESTADO DEL SISTEMA DE ENERGIA CAMBIADO CON EXITO*\n\n` +
    `El sistema de energia ha sido *${isEnabled ? "ACTIVADO" : "DESACTIVADO"}*.\n\n` +
    `*Estado Actual:*\n` +
    `- Modo: *${isEnabled ? "ACTIVO 🔋" : "INACTIVO (UNLIMITED) ♾️"}*\n\n` +
    `_Todos los cambios se han guardado y se aplicaran de inmediato en el sistema del bot._`
  );
}

export { pluginConfig as config, handler };
