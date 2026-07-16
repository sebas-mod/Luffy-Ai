import { getDatabase } from "../../src/lib/ourin-database.js";

const pluginConfig = {
  name: "antilinkall",
  alias: ["alall", "antialllink"],
  category: "group",
  description: "Anti todo tipo de enlaces (detecta extensiones de dominio)",
  usage: ".antilinkall <on/off/metode> [kick/remove]",
  example: ".antilinkall on",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
  isAdmin: true,
  isBotAdmin: true,
};

function handler(m, { sock }) {
  const db = getDatabase();
  const option = m.text?.toLowerCase()?.trim();

  if (!option) {
    const groupData = db.getGroup(m.chat) || {};
    const status = groupData.antilinkall || "off";
    const mode = groupData.antilinkallMode || "remove";

    return m.reply(
      `🔗 *Antilink All*\n\n` +
        `> Estado: *${status === "on" ? "Activo ✅" : "Inactivo ❌"}*\n` +
        `> Modo: *${mode.toUpperCase()}*\n\n` +
        `*DETECCIÓN:*\n` +
        `> • https:// / http:// (con protocolo)\n` +
        `> • www. (subdominio)\n` +
        `> • Extensiones de dominio (.com, .id, .io, .net, etc)\n` +
        `> • Shortlinks (bit.ly, t.me, tinyurl, etc)\n\n` +
        `*USO:*\n` +
        `> *${m.prefix}antilinkall on* — Activar\n` +
        `> *${m.prefix}antilinkall off* — Desactivar\n` +
        `> *${m.prefix}antilinkall metode kick* — Modo expulsar usuario\n` +
        `> *${m.prefix}antilinkall metode remove* — Modo borrar mensaje`
    );
  }

  if (option === "on") {
    db.setGroup(m.chat, { antilinkall: "on" });
    return m.reply(
      `✅ *Antilink All Activo*\n\n` +
        `> Todos los enlaces serán detectados automáticamente\n> Detecta extensiones de dominio, no solo http/https`
    );
  }

  if (option === "off") {
    db.setGroup(m.chat, { antilinkall: "off" });
    return m.reply(`❌ *Antilink All Inactivo*\n\n> Los enlaces no serán filtrados más`);
  }

  if (option.startsWith("metode")) {
    const method = m.args?.[1]?.toLowerCase();
    if (method === "kick") {
      db.setGroup(m.chat, { antilinkall: "on", antilinkallMode: "kick" });
      return m.reply(
        `✅ *Antilink All — Modo Kick*\n\n> El usuario que envíe enlaces será expulsado`
      );
    } else if (method === "remove" || method === "delete") {
      db.setGroup(m.chat, { antilinkall: "on", antilinkallMode: "remove" });
      return m.reply(
        `✅ *Antilink All — Modo Delete*\n\n> Los mensajes con enlaces serán eliminados`
      );
    } else {
      return m.reply(
        `❌ *Método No Válido*\n\n> Usa *kick* o *remove*\n> Ejemplo: *${m.prefix}antilinkall metode kick*`
      );
    }
  }

  if (option === "kick") {
    db.setGroup(m.chat, { antilinkall: "on", antilinkallMode: "kick" });
    return m.reply(
      `✅ *Antilink All — Modo Kick*\n\n> El usuario que envíe enlaces será expulsado`
    );
  }

  if (option === "remove" || option === "delete") {
    db.setGroup(m.chat, { antilinkall: "on", antilinkallMode: "remove" });
    return m.reply(
      `✅ *Antilink All — Modo Delete*\n\n> Los mensajes con enlaces serán eliminados`
    );
  }

  return m.reply(
    `❌ *Opción No Válida*\n\n> Usa *on*, *off*, *metode kick*, o *metode remove*`
  );
}

export { pluginConfig as config, handler };
