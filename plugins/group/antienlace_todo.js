import { getDatabase } from "../../src/lib/luffy-database.js";

const pluginConfig = {
  name: "antienlace_todo",
  alias: ["alall", "antialllink"],
  category: "group",
  description: "Anti todo tipo de enlaces (detección por extensión de dominio)",
  usage: ".antilinkall <on/off/metode> [kick/remove]",
  example: ".antilinkall on",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 3,
  carne: 0,
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
      `🔗 *Antilink Total*\n\n` +
        `> Estado: *${status === "on" ? "Activo ✅" : "Inactivo ❌"}*\n` +
        `> Modo: *${mode.toUpperCase()}*\n\n` +
        `*DETECCIÓN:*\n` +
        `> • https:// / http:// (con protocolo)\n` +
        `> • www. (subdominio)\n` +
        `> • Extensión de dominio (.com, .id, .io, .net, etc.)\n` +
        `> • Shortlinks (bit.ly, t.me, tinyurl, etc.)\n\n` +
        `*USO:*\n` +
        `> *${m.prefix}antienlace_todo on* — Activar\n` +
        `> *${m.prefix}antienlace_todo off* — Desactivar\n` +
        `> *${m.prefix}antienlace_todo metode kick* — Modo expulsar usuario\n` +
        `> *${m.prefix}antienlace_todo metode remove* — Modo eliminar mensaje`
    );
  }

  if (option === "on") {
    db.setGroup(m.chat, { antilinkall: "on" });
    return m.reply(
      `✅ *Antilink Total Activo*\n\n` +
        `> Todos los enlaces se detectarán automáticamente\n> Detecta extensión de dominio, no solo http/https`
    );
  }

  if (option === "off") {
    db.setGroup(m.chat, { antilinkall: "off" });
    return m.reply("╭━━〔 🛡️ PROTECCIÓN 〕━━╮\n┃ "+`❌ *Antilink Total Inactivo*\n\n> Los enlaces ya no se filtrarán`+"\n╰━━━━━━━━━━━━╯");
  }

  if (option.startsWith("metode")) {
    const method = m.args?.[1]?.toLowerCase();
    if (method === "kick") {
      db.setGroup(m.chat, { antilinkall: "on", antilinkallMode: "kick" });
      return m.reply(
        "╭━━〔 🛡️ PROTECCIÓN 〕━━╮\n┃ "+`✅ *Antilink Total — Modo Expulsar*\n\n> El usuario que envíe un enlace será expulsado`+"\n╰━━━━━━━━━━━━╯"
      );
    } else if (method === "remove" || method === "delete") {
      db.setGroup(m.chat, { antilinkall: "on", antilinkallMode: "remove" });
      return m.reply(
        "╭━━〔 🛡️ PROTECCIÓN 〕━━╮\n┃ "+`✅ *Antilink Total — Modo Eliminar*\n\n> El mensaje con enlace será eliminado`+"\n╰━━━━━━━━━━━━╯"
      );
    } else {
      return m.reply(
        "╭━━〔 🛡️ PROTECCIÓN 〕━━╮\n"+`❌ *Método No Válido*\n\n> Usa *kick* o *remove*\n> Ejemplo: *${m.prefix}antienlace_todo metode kick*`+"\n╰━━━━━━━━━━━━╯"
      );
    }
  }

  if (option === "kick") {
    db.setGroup(m.chat, { antilinkall: "on", antilinkallMode: "kick" });
    return m.reply(
      "╭━━〔 🛡️ PROTECCIÓN 〕━━╮\n┃ "+`✅ *Antilink Total — Modo Expulsar*\n\n> El usuario que envíe un enlace será expulsado`+"\n╰━━━━━━━━━━━━╯"
    );
  }

  if (option === "remove" || option === "delete") {
    db.setGroup(m.chat, { antilinkall: "on", antilinkallMode: "remove" });
    return m.reply(
      "╭━━〔 🛡️ PROTECCIÓN 〕━━╮\n┃ "+`✅ *Antilink Total — Modo Eliminar*\n\n> El mensaje con enlace será eliminado`+"\n╰━━━━━━━━━━━━╯"
    );
  }

  return m.reply(
    "╭━━〔 🛡️ PROTECCIÓN 〕━━╮\n┃ "+`❌ *Opción No Válida*\n\n> Usa *on*, *off*, *metode kick* o *metode remove*`+"\n╰━━━━━━━━━━━━╯"
  );
}

export { pluginConfig as config, handler };
