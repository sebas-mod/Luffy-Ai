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
      `- *${m.prefix}autobio ganti_setiap <tiempo>* — Configurar el intervalo. Ejemplo: \`.autobio ganti_setiap 30 segundos\` o \`1 hora\`\n` +
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
    return m.reply(`✅ *AUTO BIO ACTIVADO*\n\nLa bio de WhatsApp del bot ahora se actualizará automáticamente cada minuto.`);
  }
  
  if (option === "off") {
    db.setting("autobio_status", false);
    await m.react("❌");
    return m.reply(`❌ *AUTO BIO DESACTIVADO*\n\nLa bio de WhatsApp del bot ya no se actualizará.`);
  }

  if (option.startsWith("ganti_setiap")) {
    const timeStr = arg.replace(/ganti_setiap/i, "").trim().toLowerCase();
    if (!timeStr) {
      return m.reply("❌ *Formato incorrecto*\n\nEjemplo: `.autobio ganti_setiap 30 detik` o `1 jam`");
    }

    let ms = 0;
    const value = parseInt(timeStr);
    if (isNaN(value)) {
      return m.reply("❌ *Formato incorrecto*\n\nIntroduce un número válido. Ejemplo: `.autobio ganti_setiap 30 detik`");
    }

    if (timeStr.includes("d") || timeStr.includes("detik")) ms = value * 1000;
    else if (timeStr.includes("m") || timeStr.includes("menit")) ms = value * 60000;
    else if (timeStr.includes("j") || timeStr.includes("jam")) ms = value * 3600000;
    else ms = value * 60000; // default to minutes

    if (ms < 10000) {
      return m.reply("❌ *Error*\n\nEl intervalo mínimo es de 10 segundos para evitar spam del servidor de WhatsApp.");
    }

    db.setting("autobio_interval", ms);
    await m.react("✅");
    
    // Restart scheduler
    try {
      const { startAutoBioChecker } = await import("../../src/lib/luffy-scheduler.js");
      startAutoBioChecker(sock);
    } catch (e) {}

    return m.reply(`✅ *Intervalo cambiado*\n\nLa bio se actualizará automáticamente cada *${value} ${timeStr.replace(/[0-9\s]/g, "")}* (o ${ms / 1000} segundos).`);
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
