import { getDatabase } from "../../src/lib/ourin-database.js";
import { saluranCtx } from "../../src/lib/ourin-context.js";
import config from "../../config.js";

const pluginConfig = {
  name: "autotyping",
  alias: ["typing", "autoescribe"],
  category: "owner",
  description: "Muestra automáticamente que el bot está escribiendo al recibir mensajes",
  usage: ".autotyping on/off",
  example: ".autotyping on",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const option = m.text?.toLowerCase()?.trim();

  if (!option) {
    const current = db.setting("autoTyping") ?? config.features?.autoTyping ?? true;
    return m.reply(
      `⌨️ *Auto Typing*\n\n` +
        `> Status: *${current ? "Aktif ✅" : "Nonaktif ❌"}*\n\n` +
        `*USO:*\n` +
        `> *${m.prefix}autotyping on* — Activar\n` +
        `> *${m.prefix}autotyping off* — Desactivar\n\n` +
        `_Bot va a mostrando indicador de escritura cuando recibe mensaje_`
    );
  }

  if (option === "on") {
    db.setting("autoTyping", true);
    const ctx = saluranCtx();
    return m.reply(
      `⌨️ *Auto Typing Activo*\n\n` +
        `> Bot va a mostrando indicador de escritura`,
      { contextInfo: ctx }
    );
  }

  if (option === "off") {
    db.setting("autoTyping", false);
    return m.reply(
      `⌨️ *Auto Typing Nonactivo*\n\n` +
        `> Bot no va a mostrando indicador de escritura`
    );
  }

  return m.reply(
    `❌ *Opsi No Valid*\n\n> Usa *${m.prefix}autotyping on* o *${m.prefix}autotyping off*`
  );
}

export { pluginConfig as config, handler };
