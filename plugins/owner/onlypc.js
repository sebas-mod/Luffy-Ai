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
        `> Status: *${current ? "Aktif ✅" : "Nonaktif ❌"}*\n\n` +
        `*PENGGUNAAN:*\n` +
        `> *${m.prefix}onlypc on* — Bot solo puede diakses di private chat\n` +
        `> *${m.prefix}onlypc off* — Bot puede diakses di mana saja\n\n` +
        `_Si activo, mode Only Group va a automáticamente nonactivo_`
    );
  }

  if (option === "on") {
    db.setting("onlyPc", true);
    db.setting("onlyGc", false);
    db.save();
    await m.react("✅");
    return m.reply(
      `💬 *Only Private Activo*\n\n` +
        `> Bot solo puede diakses di private chat\n` +
        `> Mode Only Group dinonactivokan`
    );
  }

  if (option === "off") {
    db.setting("onlyPc", false);
    db.save();
    await m.react("❌");
    return m.reply(
      `💬 *Only Private Nonactivo*\n\n` +
        `> Bot puede diakses di mana saja`
    );
  }

  return m.reply(
    `❌ *Opsi No Valid*\n\n> Usa *${m.prefix}onlypc on* o *${m.prefix}onlypc off*`
  );
}

export { pluginConfig as config, handler };
