import { getDatabase } from "../../src/lib/ourin-database.js";
import { saluranCtx } from "../../src/lib/ourin-context.js";

const pluginConfig = {
  name: "anticulik",
  alias: ["antikidnap", "antiileng", "anticulikgc"],
  category: "group",
  description: "El bot sale automáticamente del grupo si lo agregan sin permiso",
  usage: ".anticulik on/off",
  example: ".anticulik on",
  isOwner: true,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const option = m.text?.toLowerCase()?.trim();

  if (!option) {
    const status = db.setting("anticulik") || "off";

    return m.reply(
      `🛡️ *Anti Secuestro*\n\n` +
        `El bot sale automáticamente del grupo si lo agregan personas desconocidas sin permiso.\n\n` +
        `*ESTADO:*\n` +
        `> Modo: *${status === "on" ? "Activo ✅" : "Inactivo ❌"}*\n\n` +
        `*USO:*\n` +
        `> *${m.prefix}anticulik on* — Activar\n` +
        `> *${m.prefix}anticulik off* — Desactivar\n\n` +
        `_Si está activo, el bot solo puede unirse vía *${m.prefix}join* o si lo agrega el owner_`
    );
  }

  if (option === "on") {
    db.setting("anticulik", "on");
    const ctx = saluranCtx();
    return m.reply(
      `🛡️ *Anti Secuestro Activo*\n\n` +
        `> El bot saldrá automáticamente si lo agregan sin permiso\n` +
        `> La única forma de que el bot se una: *${m.prefix}join* por el owner\n\n` +
        `_El miembro que agregue al bot recibirá una advertencia_`,
      { contextInfo: ctx }
    );
  }

  if (option === "off") {
    db.setting("anticulik", "off");
    return m.reply(
      `🛡️ *Anti Secuestro Inactivo*\n\n` +
        `> El bot no saldrá automáticamente si lo agregan al grupo\n` +
        `> Cualquiera puede agregar al bot al grupo`
    );
  }

  return m.reply(
    `❌ *Opción No Válida*\n\n> Usa *${m.prefix}anticulik on* o *${m.prefix}anticulik off*`
  );
}

async function handleAntiCulik(event, sock, db) {
  if (event.action !== "add") return false;

  const botNumber =
    sock.user?.id?.split(":")[0] || sock.user?.id?.split("@")[0];
  const botLid = sock.user?.id;

  const isBotAdded = (event.participants || []).some((p) => {
    const rJid = typeof p === "object" && p !== null ? p.phoneNumber || p.id : p;
    if (typeof rJid !== "string") return false;
    const pNum = rJid.split("@")[0].split(":")[0];
    return (
      pNum === botNumber ||
      rJid === botLid ||
      rJid.includes(botNumber)
    );
  });

  if (!isBotAdded) return false;

  const anticulikStatus = db.setting("anticulik") || "off";
  if (anticulikStatus !== "on") return false;

  const inviter = event.author || "";
  const ownerNumbers = (global.owner || []).map((o) =>
    typeof o === "string" ? o.split("@")[0] : o
  );
  const inviterNum = inviter.split("@")[0].split(":")[0];

  const isOwnerInviter =
    inviterNum === botNumber ||
    ownerNumbers.includes(inviterNum) ||
    inviter === botLid;

  if (isOwnerInviter) return false;

  const inviterMention = inviter
    ? `@${inviter.split("@")[0]}`
    : "alguien";

  await sock.sendMessage(event.id, {
    text:
      `🛡️ *Anti Secuestro*\n\n` +
      `¡Pide permiso primero, no secuestres! 🗿\n\n` +
      `> El bot fue agregado por ${inviterMention} sin permiso\n` +
      `> El bot saldrá de este grupo\n\n` +
      `_Contacta al owner para agregar al bot correctamente_`,
    contextInfo: saluranCtx(),
    mentionedJid: inviter ? [inviter] : [],
  });

  await new Promise((r) => setTimeout(r, 2000));
  await sock.groupLeave(event.id);
  return true;
}

export { pluginConfig as config, handler, handleAntiCulik };
