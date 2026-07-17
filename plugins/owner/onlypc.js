import { getDatabase } from "../../src/lib/ourin-database.js";

const pluginConfig = {
  name: "onlypc",
  alias: ["onlyprivate", "privateonly"],
  category: "owner",
  description: "Activa o desactiva el modo del bot solo en chats privados",
  usage: ".onlypc on/off",
  example: ".onlypc on",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const option = m.text?.toLowerCase()?.trim();

  if (!option) {
    const current = db.setting("onlyPc") || false;
    return m.reply(
      `💬 *Only Private*\n\n` +
        `> Status: *${current ? "Activo ✅" : "Inactivo ❌"}*\n\n` +
        `*USO:*\n` +
        `> *${m.prefix}onlypc on* — Bot solo puede accederse en chat privado\n` +
        `> *${m.prefix}onlypc off* — Bot puede accederse en cualquier lugar\n\n` +
        `_Si activo, mode Only Group va a automáticamente desactivado_`
    );
  }

  if (option === "on") {
    db.setting("onlyPc", true);
    db.setting("onlyGc", false);
    db.save();
    await m.react("✅");
    return m.reply(
      `💬 *Only Private Activo*\n\n` +
        `> Bot solo puede accederse en chat privado\n` +
        `> Mode Only Group desactivado`
    );
  }

  if (option === "off") {
    db.setting("onlyPc", false);
    db.save();
    await m.react("❌");
    return m.reply(
      `💬 *Only Private Nonactivo*\n\n` +
        `> Bot puede accederse en cualquier lugar`
    );
  }

  return m.reply(
    `❌ *Opsi No Valid*\n\n> Usa *${m.prefix}onlypc on* o *${m.prefix}onlypc off*`
  );
}

export { pluginConfig as config, handler };
