import { getDatabase } from "../../src/lib/luffy-database.js";

const pluginConfig = {
  name: "onlygc",
  alias: ["onlygroup", "grouponly"],
  category: "owner",
  description: "Toggle mode bot hanya di grup",
  usage: ".onlygc on/off",
  example: ".onlygc on",
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
    const current = db.setting("onlyGc") || false;
    return m.reply(
      `🏘️ *Only Group*\n\n` +
        `> Estado: *${current ? "Activo ✅" : "Inactivo ❌"}*\n\n` +
        `*USO:*\n` +
        `> *${m.prefix}onlygc on* — El bot solo se puede usar en grupos\n` +
        `> *${m.prefix}onlygc off* — El bot se puede usar en cualquier lugar\n\n` +
        `_Si está activo, el modo Solo Privado se desactivará automáticamente_`
    );
  }

  if (option === "on") {
    db.setting("onlyGc", true);
    db.setting("onlyPc", false);
    await m.react("✅");
    return m.reply(
      `🏘️ *Only Group Activo*\n\n` +
        `> El bot solo se puede usar en grupos\n` +
        `> El modo Solo Privado se desactivó`
    );
  }

  if (option === "off") {
    db.setting("onlyGc", false);
    await m.react("❌");
    return m.reply(
      `🏘️ *Only Group Inactivo*\n\n` +
        `> El bot se puede usar en cualquier lugar`
    );
  }

  return m.reply(
    `❌ *Opción no válida*\n\n> Usa *${m.prefix}onlygc on* o *${m.prefix}onlygc off*`
  );
}

export { pluginConfig as config, handler };
