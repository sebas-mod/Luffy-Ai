import { getDatabase } from "../../src/lib/luffy-database.js";
import { saluranCtx } from "../../src/lib/luffy-context.js";
import config from "../../config.js";

const pluginConfig = {
  name: "autotyping",
  alias: ["typing", "autoketik"],
  category: "owner",
  description: "Indicador de escritura automático al recibir mensajes",
  usage: ".autotyping on/off",
  example: ".autotyping on",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  carne: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const option = m.text?.toLowerCase()?.trim();

  if (!option) {
    const current = db.setting("autoTyping") ?? config.features?.autoTyping ?? true;
    return m.reply(
      `⌨️ *Auto Escritura*\n\n` +
        `> Estado: *${current ? "Activo ✅" : "Inactivo ❌"}*\n\n` +
        `*USO:*\n` +
        `> *${m.prefix}autotyping on* — Activar\n` +
        `> *${m.prefix}autotyping off* — Desactivar\n\n` +
        `_El bot mostrará el indicador de escritura al recibir mensajes_`
    );
  }

  if (option === "on") {
    db.setting("autoTyping", true);
    const ctx = saluranCtx();
    return m.reply(
      `⌨️ *Auto Escritura Activo*\n\n` +
        `> El bot mostrará el indicador de escritura`,
      { contextInfo: ctx }
    );
  }

  if (option === "off") {
    db.setting("autoTyping", false);
    return m.reply(
      `⌨️ *Auto Escritura Inactivo*\n\n` +
        `> El bot ya no mostrará el indicador de escritura`
    );
  }

  return m.reply(
    `👑•─────•👑\n❌ *Opción No Válida*\n\n> Usa *${m.prefix}autotyping on* o *${m.prefix}autotyping off*\n♰ ──────── ♱✦`
  );
}

export { pluginConfig as config, handler };
