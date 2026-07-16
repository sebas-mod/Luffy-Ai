import { getDatabase } from "../../src/lib/ourin-database.js";
import config from "../../config.js";

const pluginConfig = {
  name: "autobio",
  alias: ["autostatus"],
  category: "owner",
  description: "Configura la actualización automática de la bio de WhatsApp del bot",
  usage: ".autobio on/off\n.autobio <texto>",
  example: ".autobio on\n.autobio Bot by Owner | 🕒 {clock} | ⏳ {runtime}",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, db }) {
  const arg = m.text?.trim();
  
  if (!arg) {
    const status = db.setting("autobio_status") || false;
    const text = db.setting("autobio_text") || "Bot activo | 🕒 {clock} | ⏳ {runtime}";
    const intervalMs = db.setting("autobio_interval") || 60000;
    
    return m.reply(
      `📝 *AUTO BIO SETTINGS*\n\n` +
      `> Status: *${status ? "Aktif ✅" : "Nonaktif ❌"}*\n` +
      `> Interval: *${intervalMs / 1000} segundos*\n` +
      `> Texto Bio: ${text}\n\n` +
      `*USO:*\n` +
      `- *${m.prefix}autobio on/off* — Activar/Desactivar función\n` +
      `- *${m.prefix}autobio cambiar_cada <tiempo>* — Configurar el intervalo. Ejemplo: \`.autobio cambiar_cada 30 segundos\` o \`1 hora\`\n` +
      `- *${m.prefix}autobio <texto>* — Configurar el texto de la bio\n\n` +
      `*PLACEHOLDER TERSEDIA:*\n` +
      `- \`{clock}\` — Mostrando la hora actual\n` +
      `- \`{runtime}\` — Mostrando el tiempo que lleva encendido el bot\n` +
      `- \`{botname}\` — Mostrando el nombre del bot de la configuración\n` +
      `- \`{version}\` — Mostrando la versión del bot`
    );
  }

  const option = arg.toLowerCase();
  
  if (option === "on") {
    db.setting("autobio_status", true);
    await m.react("✅");
    try {
      const { startAutoBioChecker } = await import("../../src/lib/ourin-scheduler.js");
      startAutoBioChecker(sock);
    } catch (e) {}
    return m.reply(`✅ *BIO AUTOMÁTICO ACTIVADO*\n\nLa bio de WhatsApp del bot ahora se actualizará automáticamente cada minuto.`);
  }
  
  if (option === "off") {
    db.setting("autobio_status", false);
    await m.react("❌");
    return m.reply(`❌ *BIO AUTOMÁTICO DESACTIVADO*\n\nLa bio de WhatsApp del bot no se actualizará de nuevo.`);
  }

  if (option.startsWith("cambiar_cada")) {
    const timeStr = arg.replace(/cambiar_cada/i, "").trim().toLowerCase();
    if (!timeStr) {
      return m.reply("❌ *Formato Incorrecto*\n\nEjemplo: `.autobio cambiar_cada 30 segundos` o `1 hora`");
    }

    let ms = 0;
    const value = parseInt(timeStr);
    if (isNaN(value)) {
      return m.reply("❌ *Formato Incorrecto*\n\nIngresa un número válido. Ejemplo: `.autobio cambiar_cada 30 segundos`");
    }

    if (timeStr.includes("d") || timeStr.includes("segundo")) ms = value * 1000;
    else if (timeStr.includes("m") || timeStr.includes("minuto")) ms = value * 60000;
    else if (timeStr.includes("j") || timeStr.includes("jam")) ms = value * 3600000;
    else ms = value * 60000; // default to minutes

    if (ms < 10000) {
      return m.reply("❌ *Fallo*\n\nEl intervalo mínimo es de 10 segundos para no generar spam en el servidor de WhatsApp.");
    }

    db.setting("autobio_interval", ms);
    await m.react("✅");
    
    // Restart scheduler
    try {
      const { startAutoBioChecker } = await import("../../src/lib/ourin-scheduler.js");
      startAutoBioChecker(sock);
    } catch (e) {}

    return m.reply(`✅ *Intervalo Modificado*\n\nBio se actualizará automáticamente cada *${value} ${timeStr.replace(/[0-9\s]/g, "")}* (o ${ms / 1000} segundos).`);
  }

  db.setting("autobio_text", arg);
  await m.react("✅");
  
  // Restart scheduler to apply new text immediately
  try {
    const { startAutoBioChecker } = await import("../../src/lib/ourin-scheduler.js");
    startAutoBioChecker(sock);
  } catch (e) {}
  
  return m.reply(
    `✅ *TEKS BIO DIUBAH*\n\n` +
    `El formato de autobio nuevo ha sido guardado:\n` +
    `> ${arg}`
  );
}

export { pluginConfig as config, handler };
