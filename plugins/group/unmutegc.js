import { getDatabase } from "../../src/lib/ourin-database.js";
import { saluranCtx } from "../../src/lib/ourin-context.js";

const pluginConfig = {
  name: "unmutegc",
  alias: ["unmutegrup", "unmutebot", "unblockbot", "unlockbot"],
  category: "group",
  description: "Buka blokir command bot untuk member di grup",
  usage: ".unmutegc",
  example: ".unmutegc",
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

  if (!groupData.mutegc) {
    return m.reply(
      `🔊 *Mute GC No Activo*\n\n` +
        `> Los miembros ya pueden usar los comandos del bot en este grupo`
    );
  }

  db.setGroup(m.chat, { mutegc: false });
  const ctx = saluranCtx();
  const groupName = m.groupMetadata?.subject || "este grupo";

  return m.reply(
    `🔊 *Mute GC Desactivado*\n\n` +
      `> Grupo: *${groupName}*\n` +
      `> Los miembros ahora pueden usar los comandos del bot otra vez 🏴‍☠️\n\n` +
      `_Escribe *${m.prefix}mutegc* para volver a bloquear_`,
    { contextInfo: ctx }
  );
}

export { pluginConfig as config, handler };
