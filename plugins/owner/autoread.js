import { getDatabase } from "../../src/lib/luffy-database.js";
import { saluranCtx } from "../../src/lib/luffy-context.js";
import config from "../../config.js";

const pluginConfig = {
  name: "autoread",
  alias: ["readchat", "autobaca"],
  category: "owner",
  description: "Leer automáticamente los mensajes entrantes",
  usage: ".autoread on/off",
  example: ".autoread on",
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
    const current = db.setting("autoRead") ?? config.features?.autoRead ?? false;
    return m.reply(
      `📖 *Auto Lectura*\n\n` +
        `> Estado: *${current ? "Activo ✅" : "Inactivo ❌"}*\n\n` +
        `*USO:*\n` +
        `> *${m.prefix}autoread on* — Activar\n` +
        `> *${m.prefix}autoread off* — Desactivar\n\n` +
        `_El bot leerá automáticamente los mensajes entrantes_`
    );
  }

  if (option === "on") {
    db.setting("autoRead", true);
    const ctx = saluranCtx();
    return m.reply(
      `📖 *Auto Lectura Activo*\n\n` +
        `> El bot leerá automáticamente los mensajes entrantes`,
      { contextInfo: ctx }
    );
  }

  if (option === "off") {
    db.setting("autoRead", false);
    return m.reply(
      `📖 *Auto Lectura Inactivo*\n\n` +
        `> El bot ya no leerá los mensajes automáticamente`
    );
  }

  return m.reply(
    `👑•─────•👑\n❌ *Opción No Válida*\n\n> Usa *${m.prefix}autoread on* o *${m.prefix}autoread off*\n✦────────✦`
  );
}

export { pluginConfig as config, handler };
