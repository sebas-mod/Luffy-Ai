import { getDatabase } from "../../src/lib/ourin-database.js";
import fs from "fs";
import te from "../../src/lib/ourin-error.js";
import { saluranCtx } from "../../src/lib/ourin-context.js";
const pluginConfig = {
  name: "sewabot",
  alias: ["sewa"],
  category: "owner",
  description: "Activa y gestiona el sistema de alquiler del bot",
  usage: ".sewabot <on/off/leave/status>",
  example: ".sewabot on",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};
const pendingConfirmations = new Map();
async function handler(m, { sock }) {
  const db = getDatabase();
  const args = m.text?.trim()?.toLowerCase();
  if (!db.db.data.sewa) {
    db.db.data.sewa = { enabled: false, groups: {} };
    db.db.write();
  }
  const currentStatus = db.db.data.sewa.enabled;
  const sewaGroups = Object.keys(db.db.data.sewa.groups || {});
  if (!args || args === "status") {
    return m.reply(
      `🔧 *SISTEM SEWA BOT*\n\n` +
        `Status: *${currentStatus ? "✅ AKTIF" : "❌ NONAKTIF"}*\n` +
        `Grupos en lista: *${sewaGroups.length}*\n\n` +
        `*PERINTAH TERSEDIA:*\n` +
        `• *${m.prefix}sewabot on* — Activar sistema de alquiler\n` +
        `• *${m.prefix}sewabot off* — Desactivar sistema de alquiler\n` +
        `• *${m.prefix}sewabot leave* — Salir de todos los grupos que no estén en la lista blanca\n\n` +
        `*KELOLA SEWA:*\n` +
        `• *${m.prefix}addsewa <link> <durasi>* — Agregar grupo + auto unirse\n` +
        `• *${m.prefix}delsewa <link/id>* — Eliminar grupo de la lista blanca\n` +
        `• *${m.prefix}renewsewa <link/id> <durasi>* — Extender el alquiler\n` +
        `• *${m.prefix}listsewa* — Ver todos los grupos en lista\n` +
        `• *${m.prefix}checksewa* — Verificar el tiempo restante de alquiler (en el grupo)\n\n` +
        `*FORMAT DURASI:*\n` +
        `30i (minutos) \u2022 12h (horas) \u2022 7d (días) \u2022 1m (mes) \u2022 1y (año) \u2022 lifetime\n\n` +
        `*CARA KERJA:*\n` +
        `1. Agrega el grupo con *${m.prefix}addsewa*\n` +
        `2. Bot automáticamente se une si usa link\n` +
        `3. Activar con *${m.prefix}sewabot on*\n` +
        `4. El bot saldrá de todos los grupos que no estén en la lista\n` +
        `5. Alquiler vencido → bot automáticamente sale del grupo`,
    );
  }
  if (args === "off") {
    db.db.data.sewa.enabled = false;
    db.db.write();
    await m.react("✅");
    return m.reply(
      `✅ Sistema de alquiler desactivado\n\nEl bot no abandonará ningún grupo.`,
    );
  }
  if (args === "on") {
    const pending = pendingConfirmations.get(m.sender);
    if (
      pending &&
      pending.type === "sewabot_on" &&
      Date.now() - pending.timestamp < 60000
    ) {
      return m.reply(
        `🕐 Ya existe una solicitud pendiente\n\nEscribe *${m.prefix}sewabot confirm* para continuar\nEscribe *${m.prefix}sewabot cancel* para cancelar`,
      );
    }
    pendingConfirmations.set(m.sender, {
      type: "sewabot_on",
      timestamp: Date.now(),
    });
    setTimeout(() => {
      if (pendingConfirmations.get(m.sender)?.type === "sewabot_on")
        pendingConfirmations.delete(m.sender);
    }, 60000);
    return m.reply(
      `⚠️ *KONFIRMASI AKTIVASI SEWA*\n\n` +
        `Si se activa:\n` +
        `• ✅ ${sewaGroups.length} grupos en la lista blanca permanecerán seguros\n` +
        `• ❌ ¡Todos los demás grupos serán abandonados!\n\n` +
        `Escribe *${m.prefix}sewabot confirm* para continuar\nEscribe *${m.prefix}sewabot cancel* para cancelar\n\n` +
        `💡 Asegúrate de tener en la lista blanca los grupos importantes con:\n*${m.prefix}addsewa <link grup> <durasi>*`,
    );
  }
  if (args === "confirm" || args === "yes" || args === "y") {
    const pending = pendingConfirmations.get(m.sender);
    if (!pending || pending.type !== "sewabot_on") {
      return m.reply(
        `❌ No hay solicitudes pendientes\nEscribe *${m.prefix}sewabot on* primero`,
      );
    }
    pendingConfirmations.delete(m.sender);
    db.db.data.sewa.enabled = true;
    db.db.write();
    await m.react("🕕");
    await m.reply(`🕕 El sistema de alquiler ha sido activado, procesando salida automática...`);
    try {
      global.isFetchingGroups = true;
      const allGroups = await sock.groupFetchAllParticipating();
      global.isFetchingGroups = false;
      const allGroupIds = Object.keys(allGroups);
      const unlistedGroups = allGroupIds.filter(
        (id) => !sewaGroups.includes(id),
      );
      let leftCount = 0;
      let failedCount = 0;
      for (const groupId of unlistedGroups) {
        try {
          await sock.sendText(
            groupId,
            `⛔ Este grupo no está en la lista del sistema de alquiler.\nEl bot abandonará este grupo.\n\nContacta al owner para alquilar el bot.`,
            null,
            {
              contextInfo: saluranCtx(),
            },
          );
          await new Promise((r) => setTimeout(r, 2000));
          await sock.groupLeave(groupId);
          leftCount++;
          await new Promise((r) => setTimeout(r, 3000));
        } catch {
          failedCount++;
        }
      }
      await m.react("✅");
      return m.reply(
        `✅ *SEWA BOT AKTIF*\n\n` +
          `Grup whitelist: *${sewaGroups.length}*\n` +
          `Aluar de: *${leftCount}* grup\n` +
          `Fallo: *${failedCount}* grup`,
      );
    } catch (e) {
      await m.react("✅");
      return m.reply(te(m.prefix, m.command, m.pushName));
    }
  }
  if (args === "leave") {
    if (!currentStatus)
      return m.reply(`❌ Activa el sistema de alquiler primero con *${m.prefix}sewabot on*`);
    await m.react("🕕");
    await m.reply(`🕕 Obteniendo lista de grupos...`);
    global.sewaLeaving = true;
    try {
      global.isFetchingGroups = true;
      const allGroups = await sock.groupFetchAllParticipating();
      global.isFetchingGroups = false;
      const allGroupIds = Object.keys(allGroups);
      const unlistedGroups = allGroupIds.filter(
        (id) => !sewaGroups.includes(id),
      );
      if (unlistedGroups.length === 0) {
        delete global.sewaLeaving;
        await m.react("✅");
        return m.reply(`✅ No hay grupos que abandonar`);
      }
      await m.reply(
        `📊 Total: ${allGroupIds.length} grup\nWhitelist: ${sewaGroups.length}\nVa a salir de: ${unlistedGroups.length} grup`,
      );
      let leftCount = 0;
      let failedCount = 0;
      for (const groupId of unlistedGroups) {
        try {
          await sock.sendText(
            groupId,
            `👋 Este grupo no está en la lista del sistema de alquiler.\nEl bot abandonará este grupo.\n\nContacta al owner para alquilar el bot.`,
            null,
            {
              contextInfo: saluranCtx(),
            },
          );
          await new Promise((r) => setTimeout(r, 3000));
          await sock.groupLeave(groupId);
          leftCount++;
          await new Promise((r) => setTimeout(r, 5000));
        } catch {
          failedCount++;
        }
      }
      delete global.sewaLeaving;
      await m.react("✅");
      return m.reply(
        `✅ Completado\n\nÉxito al salir: *${leftCount}* grup\nFallo: *${failedCount}* grup`,
      );
    } catch (e) {
      delete global.sewaLeaving;
      await m.react("☢");
      await m.reply(te(m.prefix, m.command, m.pushName));
    }
  }
  if (args === "cancel" || args === "no" || args === "n") {
    const pending = pendingConfirmations.get(m.sender);
    if (!pending || pending.type !== "sewabot_on")
      return m.reply(      `❌ No hay solicitudes pendientes`);
    pendingConfirmations.delete(m.sender);
    await m.react("❌");
    return m.reply(
      `❌ Activación cancelada\nPrimero agrega grupos a la lista blanca con *${m.prefix}addsewa*`,
    );
  }
  return m.reply(
      `❌ Comando no válido\n\nEscribe *${m.prefix}sewabot* para ver la guía completa`,
  );
}
export { pluginConfig as config, handler, pendingConfirmations };
