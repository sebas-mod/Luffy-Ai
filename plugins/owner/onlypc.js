import { getDatabase } from "../../src/lib/luffy-database.js";

const pluginConfig = {
  name: "onlypc",
  alias: ["onlyprivate", "privateonly"],
  category: "owner",
  description: "Toggle mode bot hanya di private chat",
  usage: ".onlypc on/off",
  example: ".onlypc on",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  carne: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const option = m.text?.toLowerCase()?.trim();

  if (!option) {
    const current = db.setting("onlyPc") || false;
    return m.reply(
      `💬 *Only Private*\n\n` +
        `> Estado: *${current ? "Activo ✅" : "Inactivo ❌"}*\n\n` +
        `*USO:*\n` +
        `> *${m.prefix}onlypc on* — El bot solo se puede usar en chat privado\n` +
        `> *${m.prefix}onlypc off* — El bot se puede usar en cualquier lugar\n\n` +
        `_Si está activo, el modo Solo Grupo se desactivará automáticamente_`
    );
  }

  if (option === "on") {
    db.setting("onlyPc", true);
    db.setting("onlyGc", false);
    await m.react("✅");
    return m.reply(
      `💬 *Only Private Activo*\n\n` +
        `> El bot solo se puede usar en chat privado\n` +
        `> El modo Solo Grupo se desactivó`
    );
  }

  if (option === "off") {
    db.setting("onlyPc", false);
    await m.react("❌");
    return m.reply(
      `💬 *Only Private Inactivo*\n\n` +
        `> El bot se puede usar en cualquier lugar`
    );
  }

  return m.reply(
    `❌ *Opción no válida*\n\n> Usa *${m.prefix}onlypc on* o *${m.prefix}onlypc off*`
  );
}

export { pluginConfig as config, handler };
