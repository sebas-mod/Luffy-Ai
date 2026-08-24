import { getDatabase } from "../../src/lib/luffy-database.js";

const pluginConfig = {
  name: "solo_grupo",
  alias: ["onlygroup", "grouponly"],
  category: "owner",
  description: "Activar el modo del bot solo en grupos",
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
        `> *${m.prefix}solo_grupo on* — El bot solo se puede usar en grupos\n` +
        `> *${m.prefix}solo_grupo off* — El bot se puede usar en cualquier lugar\n\n` +
        `_Si está activo, el modo Solo Privado se desactivará automáticamente_`
    );
  }

  if (option === "on") {
    db.setting("onlyGc", true);
    db.setting("onlyPc", false);
    await m.react("✅");
    return m.reply(
      `╭━━━〔 ✦ ÉXITO 〕━━━╮\n┃ 🏘️ *Only Group Activo*\n╰━━━━━━━━━━━━╯\n\n` +
        `> El bot solo se puede usar en grupos ✅\n` +
        `> El modo Solo Privado se desactivó`
    );
  }

  if (option === "off") {
    db.setting("onlyGc", false);
    await m.react("❌");
    return m.reply(
      `╭━〔 ⚙️ SISTEMA 〕━╮\n┃ 🏘️ *Only Group Inactivo*\n╰━━━━━━━━╯\n\n` +
        `> El bot se puede usar en cualquier lugar ✅`
    );
  }

  return m.reply(
    `❌ *Opción no válida*\n\n> Usa *${m.prefix}solo_grupo on* o *${m.prefix}solo_grupo off*`
  );
}

export { pluginConfig as config, handler };
