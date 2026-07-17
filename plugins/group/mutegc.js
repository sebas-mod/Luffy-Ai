import { getDatabase } from "../../src/lib/ourin-database.js";
import { saluranCtx } from "../../src/lib/ourin-context.js";

const pluginConfig = {
  name: "mutegc",
  alias: ["mutegrup", "mutebot", "blockbot", "lockbot"],
  category: "group",
  description: "Bloquea comandos del bot para miembros, solo admin/owner puede usar",
  usage: ".mutegc",
  example: ".mutegc",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  isAdmin: true,
  isBotAdmin: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const groupData = db.getGroup(m.chat) || {};

  if (groupData.mutegc) {
    return m.reply(
      `🔇 *Mute GC Ya Activo*\n\n` +
        `> Los miembros no pueden usar comandos del bot en este grupo\n` +
        `> Solo el admin del grupo y el owner del bot pueden acceder\n\n` +
        `_Escribe *${m.prefix}unmutegc* para desbloquear_`
    );
  }

  db.setGroup(m.chat, { mutegc: true });
  const ctx = saluranCtx();
  const groupName = m.groupMetadata?.subject || "este grupo";

  return m.reply(
    `🔇 *Mute GC Activo*\n\n` +
      `> Grup: *${groupName}*\n` +
      `> Los miembros no pueden usar comandos del bot\n` +
      `> Admin del grupo y owner del bot siguen pudiendo acceder\n\n` +
      `_Escribe *${m.prefix}unmutegc* para desbloquear_`,
    { contextInfo: ctx }
  );
}

function isMutegc(groupJid, db) {
  const group = db.getGroup(groupJid) || {};
  return !!group.mutegc;
}

export { pluginConfig as config, handler, isMutegc };
