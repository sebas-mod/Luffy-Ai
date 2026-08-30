import { getDatabase } from "../../src/lib/luffy-database.js";
import { saluranCtx } from "../../src/lib/luffy-context.js";
const pluginConfig = {
  name: "quitar_renta",
  alias: ["sewadel", "removesewa"],
  category: "owner",
  description: "Eliminar un grupo del whitelist de alquiler",
  usage: ".delsewa <link/id del grupo>",
  example: ".delsewa https://chat.whatsapp.com/xxx",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  carne: 0,
  isEnabled: true,
};

async function resolveGroupId(sock, input) {
  if (input.includes("chat.whatsapp.com/")) {
    const inviteCode = input.split("chat.whatsapp.com/")[1]?.split(/[\s?]/)[0];
    try {
      const metadata = await sock.groupGetInviteInfo(inviteCode);
      if (metadata?.id) return { id: metadata.id, name: metadata.subject };
    } catch {}
    return null;
  }
  return { id: input.includes("@g.us") ? input : input + "@g.us", name: null };
}

async function handler(m, { sock }) {
  const db = getDatabase();
  const input = m.text?.trim();

  if (!db.db.data.sewa) {
    db.db.data.sewa = { enabled: false, groups: {} };
    db.db.write();
  }

  let groupId = null;
  let groupName = null;

  if (!input) {
    if (!m.isGroup) {
      return m.reply(
        `📝 *ELIMINAR RENTA*\n` +
          `──────────\n\n` +
          `Desde privado: *${m.prefix}quitar_renta <link/id>*\n` +
          `Desde el grupo: escribe *${m.prefix}quitar_renta* directamente en el grupo\n\n` +
          `Ejemplo:\n` +
          `• ${m.prefix}quitar_renta https://chat.whatsapp.com/xxx\n` +
          `• ${m.prefix}quitar_renta 120363xxx\n\n` +
          `⚠️ Si el bot de alquiler está activo, el bot saldrá automáticamente del grupo eliminado`,
      );
    }
    groupId = m.chat;
  } else {
    const result = await resolveGroupId(sock, input);
    if (!result)
      return m.reply(`☽◯☾ ♰ ❌ Enlace no válido o grupo no encontrado`);
    groupId = result.id;
    groupName = result.name;
  }

  if (!groupId) return m.reply(`☽◯☾ ♰ ❌ No se pudo determinar el grupo`);

  const sewaData = db.db.data.sewa.groups[groupId];
  if (!sewaData)
    return m.reply(
      `☽◯☾ ╭ ♰ ⚙️ SISTEMA ♰ ━╮ ☽◯☾\n` +
      `┃ ❌ El grupo no está registrado\n` +
      `┃ en el sistema de alquiler\n` +
      `╰━ ⊱༺༒༻⊰ ━╯\n\nConsulta la lista: *${m.prefix}lista_rentas*`,
    );

  groupName = groupName || sewaData.name || groupId.split("@")[0];

  delete db.db.data.sewa.groups[groupId];
  db.db.write();

  await m.react("✅");
  await m.reply(
    `☽◯☾ ╭━ ♰ ✦ ÉXITO ♰ ━╮ ☽◯☾\n┃ ✅ *RENTA ELIMINADA*\n╰━ ⊱༺༒༻⊰ ━╯\n\nGrupo: *${groupName}*\nID: ${groupId.split("@")[0]}`,
  );

  if (db.db.data.sewa.enabled) {
    try {
      await sock.sendText(
        groupId,
        `⛔ ──────────\nEste grupo ha sido eliminado de la lista blanca de alquiler.\nEl bot abandonará el grupo.\n──────────\n\nContacta al owner para volver a alquilar. 👑`,
        null,
        {
          contextInfo: saluranCtx(),
        },
      );
      await new Promise((r) => setTimeout(r, 2000));
      await sock.groupLeave(groupId);
    } catch {}
  }
}

export { pluginConfig as config, handler };
