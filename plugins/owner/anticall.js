import { getDatabase } from "../../src/lib/ourin-database.js";
import { saluranCtx } from "../../src/lib/ourin-context.js";
import config from "../../config.js";

const pluginConfig = {
  name: "anticall",
  alias: ["antitelpon", "antitelp", "rejectcall"],
  category: "owner",
  description: "Rechaza automáticamente las llamhays entrantes",
  usage: ".anticall on/off",
  example: ".anticall on",
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
    const current = db.setting("antiCall") ?? config.features?.antiCall ?? true;
    return m.reply(
      `📞 *Anti Call*\n\n` +
        `> Status: *${current ? "Activo ✅" : "Inactivo ❌"}*\n\n` +
        `*USO:*\n` +
        `> *${m.prefix}anticall on* — Activar\n` +
        `> *${m.prefix}anticall off* — Desactivar\n\n` +
        `_Bot va a automáticamente rechazar llamadas entrantes_`
    );
  }

  if (option === "on") {
    db.setting("antiCall", true);
    const ctx = saluranCtx();
    return m.reply(
      `📞 *Anti Call Activo*\n\n` +
        `> Bot va a automáticamente rechazar llamadas entrantes`,
      { contextInfo: ctx }
    );
  }

  if (option === "off") {
    db.setting("antiCall", false);
    return m.reply(
      `📞 *Anti Call Nonactivo*\n\n` +
        `> Bot no va a rechazar llamadas entrantes`
    );
  }

  return m.reply(
    `❌ *Opsi No Valid*\n\n> Usa *${m.prefix}anticall on* o *${m.prefix}anticall off*`
  );
}

export { pluginConfig as config, handler };
