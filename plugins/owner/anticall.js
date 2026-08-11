import { getDatabase } from "../../src/lib/luffy-database.js";
import { saluranCtx } from "../../src/lib/luffy-context.js";
import config from "../../config.js";

const pluginConfig = {
  name: "anticall",
  alias: ["antitelpon", "antitelp", "rejectcall"],
  category: "owner",
  description: "Rechazar automáticamente las llamadas entrantes",
  usage: ".anticall on/off",
  example: ".anticall on",
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
    const current = db.setting("antiCall") ?? config.features?.antiCall ?? true;
    return m.reply(
      `📞 *Anti Llamada*\n\n` +
        `> Estado: *${current ? "Activo ✅" : "Inactivo ❌"}*\n\n` +
        `*USO:*\n` +
        `> *${m.prefix}anticall on* — Activar\n` +
        `> *${m.prefix}anticall off* — Desactivar\n\n` +
        `_El bot rechazará automáticamente las llamadas entrantes_`
    );
  }

  if (option === "on") {
    db.setting("antiCall", true);
    const ctx = saluranCtx();
    return m.reply(
      `📞 *Anti Llamada Activo*\n\n` +
        `> El bot rechazará automáticamente las llamadas entrantes`,
      { contextInfo: ctx }
    );
  }

  if (option === "off") {
    db.setting("antiCall", false);
    return m.reply(
      `📞 *Anti Llamada Inactivo*\n\n` +
        `> El bot no rechazará las llamadas entrantes`
    );
  }

  return m.reply(
    `❌ *Opción No Válida*\n\n> Usa *${m.prefix}anticall on* o *${m.prefix}anticall off*`
  );
}

export { pluginConfig as config, handler };
