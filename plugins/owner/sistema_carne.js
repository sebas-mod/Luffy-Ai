import { getDatabase } from "../../src/lib/luffy-database.js";

const config = {
  name: "sistema_carne",
  alias: ["carnemode"],
  category: "owner",
  description: "Consultar, activar o desactivar el sistema de carne de forma global",
  usage: ".sistemacarne [on / off]",
  example: ".sistemacarne on",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 0,
  carne: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const mode = m.args[0]?.toLowerCase();
  const db = getDatabase();
  
  const currentStatus = db.setting("carne") !== undefined ? db.setting("carne") : true;
  
  if (!mode || (mode !== "on" && mode !== "off")) {
    return m.reply(
      `🎛️ *CONTROL DEL SISTEMA DE CARNE*\n` +
      `──────────\n\n` +
      `Función de control principal para activar o desactivar todo el sistema de consumo de carne del bot de forma global.\n\n` +
      `*ESTADO ACTUAL:*\n` +
      `- Modo: *${currentStatus ? "ACTIVO 🔋" : "INACTIVO (UNLIMITED) ♾️"}*\n\n` +
      `*USO:*\n` +
      `- *${m.prefix}sistema_carne on* — Activar el consumo de carne\n` +
      `- *${m.prefix}sistema_carne off* — Desactivar el consumo de carne (modo Unlimited)\n\n` +
      `*EJEMPLO DE USO:*\n` +
      `- *${m.prefix}sistema_carne on*`
    );
  }

  await m.react("🕕");
  
  const isEnabled = mode === "on";
  
  db.setting("carne", isEnabled);
  await db.save();

  await m.react("✅");
  return m.reply(
    `╭━━━〔 ✦ ÉXITO 〕━━━╮\n┃ ✅ ESTADO DEL SISTEMA\n┃ DE CARNE CAMBIADO\n╰━━━━━━━━━━━━╯\n\n` +
    `El sistema de carne se ha *${isEnabled ? "ACTIVADO" : "DESACTIVADO"}* correctamente.\n\n` +
    `*Estado actual:*\n` +
    `- Modo: *${isEnabled ? "ACTIVO 🔋" : "INACTIVO (UNLIMITED) ♾️"}*\n\n` +
    `_Todos los cambios ya están guardados y se aplicarán al sistema del bot de inmediato._`
  );
}

export { config, handler };
