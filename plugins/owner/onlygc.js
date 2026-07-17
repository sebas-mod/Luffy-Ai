import { getDatabase } from "../../src/lib/ourin-database.js";

const pluginConfig = {
  name: "onlygc",
  alias: ["onlygroup", "grouponly"],
  category: "owner",
  description: "Activa o desactiva el modo del bot solo en grupos",
  usage: ".onlygc on/off",
  example: ".onlygc on",
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
    const current = db.setting("onlyGc") || false;
    return m.reply(
      `🏘️ *Only Group*\n\n` +
        `> Status: *${current ? "Activo ✅" : "Inactivo ❌"}*\n\n` +
        `*USO:*\n` +
        `> *${m.prefix}onlygc on* — Bot solo puede accederse en el grupo\n` +
        `> *${m.prefix}onlygc off* — Bot puede accederse en cualquier lugar\n\n` +
        `_Si activo, mode Only Private va a automáticamente desactivado_`
    );
  }

  if (option === "on") {
    db.setting("onlyGc", true);
    db.setting("onlyPc", false);
    db.save();
    await m.react("✅");
    return m.reply(
      `🏘️ *Only Group Activo*\n\n` +
        `> Bot solo puede accederse en el grupo\n` +
        `> Mode Only Private desactivado`
    );
  }

  if (option === "off") {
    db.setting("onlyGc", false);
    db.save();
    await m.react("❌");
    return m.reply(
      `🏘️ *Only Group Nonactivo*\n\n` +
        `> Bot puede accederse en cualquier lugar`
    );
  }

  return m.reply(
    `❌ *Opsi No Valid*\n\n> Usa *${m.prefix}onlygc on* o *${m.prefix}onlygc off*`
  );
}

export { pluginConfig as config, handler };
