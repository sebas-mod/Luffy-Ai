import { getDatabase } from "../../src/lib/ourin-database.js";
import { saluranCtx } from "../../src/lib/ourin-context.js";
import config from "../../config.js";

const pluginConfig = {
  name: "autoread",
  alias: ["readchat", "autobaca"],
  category: "owner",
  description: "Marca automáticamente los mensajes entrantes como leídos",
  usage: ".autoread on/off",
  example: ".autoread on",
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
    const current = db.setting("autoRead") ?? config.features?.autoRead ?? false;
    return m.reply(
      `📖 *Auto Read*\n\n` +
        `> Status: *${current ? "Activo ✅" : "Inactivo ❌"}*\n\n` +
        `*USO:*\n` +
        `> *${m.prefix}autoread on* — Activar\n` +
        `> *${m.prefix}autoread off* — Desactivar\n\n` +
        `_Bot va a automáticamente leyendo mensaje entrante_`
    );
  }

  if (option === "on") {
    db.setting("autoRead", true);
    const ctx = saluranCtx();
    return m.reply(
      `📖 *Auto Read Activo*\n\n` +
        `> Bot va a automáticamente leyendo mensaje entrante`,
      { contextInfo: ctx }
    );
  }

  if (option === "off") {
    db.setting("autoRead", false);
    return m.reply(
      `📖 *Auto Read Nonactivo*\n\n` +
        `> Bot no va a automáticamente leyendo mensaje`
    );
  }

  return m.reply(
    `❌ *Opsi No Valid*\n\n> Usa *${m.prefix}autoread on* o *${m.prefix}autoread off*`
  );
}

export { pluginConfig as config, handler };
