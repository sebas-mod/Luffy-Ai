import { getDatabase } from "../../src/lib/luffy-database.js";
import config from "../../config.js";

const pluginConfig = {
  name: "autobio",
  alias: ["autostatus"],
  category: "owner",
  description: "Configurar la actualización automática de la bio de WhatsApp del bot",
  usage: ".autobio on/off\n.autobio <teks>",
  example: ".autobio on\n.autobio Bot by Owner | 🕒 {clock} | ⏳ {runtime}",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  carne: 0,
  isEnabled: true,
};

async function handler(m, { sock, db }) {
  const arg = m.text?.trim();
  
  if (!arg) {
    const status = db.setting("autobio_status") || false;
    const text = db.setting("autobio_text") || "Bot activo | 🕒 {clock} | ⏳ {runtime}";
    const intervalMs = db.setting("autobio_interval") || 60000;
    
    return m.reply(
      `📝 *CONFIGURACIÓN DE AUTO BIO*\n\n` +
      `> Estado: *${status ? "Activo ✅" : "Inactivo ❌"}*\n` +
      `> Intervalo: *${intervalMs / 1000} segundos*\n` +
      `> Texto de la bio: ${text}\n\n` +
      `*USO:*\n` +
      `- *${m.prefix}autobio on/off* — Activar/desactivar la función\n` +
      `- *${m.prefix}autobio cambiar_cada <tiempo>* — Configurar el intervalo. Ejemplo: \`.autobio cambiar_cada 30 segundos\` o \`1 hora\`\n` +
      `- *${m.prefix}autobio <texto>* — Configurar el texto de la bio\n\n` +
      `*PLACEHOLDERS DISPONIBLES:*\n` +
      `- \`{clock}\` — Muestra la hora actual\n` +
      `- \`{runtime}\` — Muestra cuánto tiempo lleva el bot encendido\n` +
      `- \`{botname}\` — Muestra el nombre del bot desde la config\n` +
      `- \`{version}\` — Muestra la versión del bot`
    );
  }

  const option = arg.toLowerCase();
  
  if (option === "on") {
    db.setting("autobio_status", true);
    await m.react("✅");
    try {
      const { startAutoBioChecker } = await import("../../src/lib/luffy-scheduler.js");
      startAutoBioChecker(sock);
    } catch (e) {}
    return m.reply(`👑•─────•👑\n✅ *AUTO BIO ACTIVADO*\n\nLa bio de WhatsApp del bot ahora se actualizará automáticamente cada minuto.\n✦────────✦`);
  }
  
  if (option === "off") {
    db.setting("autobio_status", false);
    await m.react("❌");
    return m.reply(`👑•─────•👑\n❌ *AUTO BIO DESACTIVADO*\n\nLa bio de WhatsApp del bot ya no se actualizará.\n✦────────✦`);
  }

  if (option.startsWith("cambiar_cada")) {
    const timeStr = arg.replace(/cambiar_cada/i, "").trim().toLowerCase();
    if (!timeStr) {
      return m.reply("👑•─────•👑\n❌ *Formato incorrecto*\n\nEjemplo: `.autobio cambiar_cada 30 segundos` o `1 hora`\n✦────────✦");
    }

    let ms = 0;
    const value = parseInt(timeStr);
    if (isNaN(value)) {
      return m.reply("👑•─────•👑\n❌ *Formato incorrecto*\n\nIntroduce un número válido. Ejemplo: `.autobio cambiar_cada 30 segundos`\n✦────────✦");
    }

    if (timeStr.includes("s") || timeStr.includes("segundo")) ms = value * 1000;
    else if (timeStr.includes("min") || timeStr.includes("minuto")) ms = value * 60000;
    else if (timeStr.includes("h") || timeStr.includes("hora")) ms = value * 3600000;
    else ms = value * 60000; // default to minutes

    if (ms < 10000) {
      return m.reply("👑•─────•👑\n❌ *Error*\n\nEl intervalo mínimo es de 10 segundos para evitar spam del servidor de WhatsApp.\n✦────────✦");
    }

    db.setting("autobio_interval", ms);
    await m.react("✅");
    
    // Restart scheduler
    try {
      const { startAutoBioChecker } = await import("../../src/lib/luffy-scheduler.js");
      startAutoBioChecker(sock);
    } catch (e) {}

    return m.reply(`👑•─────•👑\n✅ *Intervalo cambiado*\n\nLa bio se actualizará automáticamente cada *${value} ${timeStr.replace(/[0-9\s]/g, "")}* (o ${ms / 1000} segundos).\n✦────────✦`);
  }

  db.setting("autobio_text", arg);
  await m.react("✅");
  
  // Restart scheduler to apply new text immediately
  try {
    const { startAutoBioChecker } = await import("../../src/lib/luffy-scheduler.js");
    startAutoBioChecker(sock);
  } catch (e) {}
  
  return m.reply(
    `✅ *TEXTO DE LA BIO CAMBIADO*\n\n` +
    `El nuevo formato de autobio se ha guardado:\n` +
    `> ${arg}`
  );
}

export { pluginConfig as config, handler };
