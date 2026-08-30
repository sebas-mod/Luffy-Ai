import { getDatabase } from "../../src/lib/luffy-database.js";
import { saluranCtx } from "../../src/lib/luffy-context.js";

const pluginConfig = {
  name: "silenciar_grupo",
  alias: ["mutegrup", "mutebot", "blockbot", "lockbot"],
  category: "group",
  description: "Bloquear comandos del bot para los miembros, solo admin/owner pueden usarlos",
  usage: ".silenciar_grupo",
  example: ".silenciar_grupo",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  isAdmin: true,
  isBotAdmin: false,
  cooldown: 5,
  carne: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const groupData = db.getGroup(m.chat) || {};

  if (groupData.mutegc) {
    return m.reply(
      `🔇 *Mute GC Ya Activo*\n\n` +
        `> Los miembros no pueden usar comandos del bot en este grupo\n` +
        `> Solo los admins del grupo y el owner del bot pueden acceder\n\n` +
        `_Escribe *${m.prefix}unmutegc* para abrir_`
    );
  }

  db.setGroup(m.chat, { mutegc: true });
  const ctx = saluranCtx();
  const groupName = m.groupMetadata?.subject || "este grupo";

  return m.reply(
    `🔇 *Mute GC Activo*\n\n` +
      `> Grupo: *${groupName}*\n` +
      `> Los miembros no pueden usar comandos del bot\n` +
      `> Los admins del grupo y el owner del bot pueden acceder\n\n` +
      `_Escribe *${m.prefix}unmutegc* para abrir_`,
    { contextInfo: ctx }
  );
}

function isMutegc(groupJid, db) {
  const group = db.getGroup(groupJid) || {};
  return !!group.mutegc;
}

export { pluginConfig as config, handler, isMutegc };
