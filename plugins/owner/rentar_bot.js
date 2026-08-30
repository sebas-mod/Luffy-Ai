import { getDatabase } from "../../src/lib/luffy-database.js";
import fs from "fs";
import te from "../../src/lib/luffy-error.js";
import { saluranCtx } from "../../src/lib/luffy-context.js";
const pluginConfig = {
  name: "rentar_bot",
  alias: ["sewa"],
  category: "owner",
  description: "Activar/desactivar y gestionar el sistema de alquiler del bot",
  usage: ".rentar_bot <on/off/leave/status>",
  example: ".rentar_bot on",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  carne: 0,
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
      `☽◯☾ ╭━ ♰ 🔧 SISTEMA DE ALQUILER DEL BOT ♰ ━╮ ☽◯☾\n\n` +
        `Estado: *${currentStatus ? "✅ ACTIVO" : "❌ INACTIVO"}*\n` +
        `Grupos registrados: *${sewaGroups.length}*\n\n` +
        `*COMANDOS DISPONIBLES:*\n` +
        `• *${m.prefix}rentar_bot on* — Activar el sistema de alquiler\n` +
        `• *${m.prefix}rentar_bot off* — Desactivar el sistema de alquiler\n` +
        `• *${m.prefix}rentar_bot leave* — Salir de todos los grupos no whitelist\n\n` +
        `*GESTIÓN DEL ALQUILER:*\n` +
        `• *${m.prefix}agregar_renta <link> <duración>* — Agregar grupo + auto join\n` +
        `• *${m.prefix}quitar_renta <link/id>* — Eliminar grupo del whitelist\n` +
        `• *${m.prefix}renovar_renta <link/id> <duración>* — Renovar el alquiler\n` +
        `• *${m.prefix}lista_rentas* — Ver todos los grupos registrados\n` +
        `• *${m.prefix}ver_renta* — Consultar el alquiler restante (en el grupo)\n\n` +
        `*FORMATO DE DURACIÓN:*\n` +
        `30i (min) \u2022 12h (h) \u2022 7d (días) \u2022 1m (mes) \u2022 1y (año) \u2022 lifetime\n\n` +
        `*CÓMO FUNCIONA:*\n` +
        `1. Agrega un grupo con *${m.prefix}agregar_renta*\n` +
        `2. El bot se une automáticamente si usas un link\n` +
        `3. Actívalo con *${m.prefix}rentar_bot on*\n` +
        `4. El bot saldrá de todos los grupos no registrados\n` +
        `5. Alquiler vencido → el bot sale automáticamente del grupo\n\n` +
        `👑•─────•👑`,
    );
  }
  if (args === "off") {
    db.db.data.sewa.enabled = false;
    db.db.write();
    await m.react("✅");
    return m.reply(
      `☽◯☾ ╭ ♰ ⚙️ SISTEMA ♰ ━╮ ☽◯☾\n┃ ❌ Sistema de alquiler desactivado\n╰━━━━━━━━╯\n\nEl bot no abandonará ningún grupo. ✅`,
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
        `🕕 Ya existe una solicitud pendiente\n\nEscribe *${m.prefix}rentar_bot confirm* para continuar\nEscribe *${m.prefix}rentar_bot cancel* para cancelar`,
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
      `⚠️ *CONFIRMACIÓN DE ACTIVACIÓN DEL ALQUILER*\n\n` +
        `Si se activa:\n` +
        `• ✅ ${sewaGroups.length} grupos whitelist siguen seguros\n` +
        `• ❌ ¡Todos los demás grupos serán abandonados!\n\n` +
        `Escribe *${m.prefix}rentar_bot confirm* para continuar\nEscribe *${m.prefix}rentar_bot cancel* para cancelar\n\n` +
        `💡 Asegúrate de haber puesto en whitelist los grupos importantes con:\n*${m.prefix}agregar_renta <link del grupo> <duración>*`,
    );
  }
  if (args === "confirm" || args === "yes" || args === "y") {
    const pending = pendingConfirmations.get(m.sender);
    if (!pending || pending.type !== "sewabot_on") {
      return m.reply(
        `❌ No hay solicitudes pendientes\nPrimero escribe *${m.prefix}rentar_bot on*`,
      );
    }
    pendingConfirmations.delete(m.sender);
    db.db.data.sewa.enabled = true;
    db.db.write();
    await m.react("🕕");
    await m.reply(`🕕 Sistema de alquiler activado, procesando auto-leave...`);
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
          try {
            await sock.sendText(
              groupId,
              `⛔ Este grupo no está registrado en el sistema de alquiler.\nEl bot abandonará este grupo.\n\nContacta al owner para alquilar el bot.`,
              null,
              {
                contextInfo: saluranCtx(),
              },
            );
            await new Promise((r) => setTimeout(r, 2000));
          } catch (err) {
            // Ignorar error si falla el envío del mensaje (p. ej. grupo bloqueado por admin)
          }

          await sock.groupLeave(groupId);
          leftCount++;
          await new Promise((r) => setTimeout(r, 3000));
        } catch {
          failedCount++;
        }
      }
      await m.react("✅");
      return m.reply(
        `✅ *ALQUILER DEL BOT ACTIVO*\n\n` +
          `Grupos whitelist: *${sewaGroups.length}*\n` +
          `Salidos de: *${leftCount}* grupos\n` +
          `Fallidos: *${failedCount}* grupos`,
      );
    } catch (e) {
      await m.react("✅");
      return m.reply(te(m.prefix, m.command, m.pushName));
    }
  }
  if (args === "leave") {
    if (!currentStatus)
      return m.reply(`❌ Activa primero sewabot con *${m.prefix}rentar_bot on*`);
    await m.react("🕕");
    await m.reply(`🕕 Obteniendo la lista de grupos...`);
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
        `📊 Total: ${allGroupIds.length} grupos\nWhitelist: ${sewaGroups.length}\nSaldrá de: ${unlistedGroups.length} grupos`,
      );
      let leftCount = 0;
      let failedCount = 0;
      for (const groupId of unlistedGroups) {
        try {
          try {
            await sock.sendText(
              groupId,
              `👋 Este grupo no está registrado en el sistema de alquiler.\nEl bot abandonará este grupo.\n\nContacta al owner para alquilar el bot.`,
              null,
              {
                contextInfo: saluranCtx(),
              },
            );
            await new Promise((r) => setTimeout(r, 3000));
          } catch (err) {
            // Ignorar error del mensaje para que el bot pueda salir igual
          }

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
        `✅ Terminado\n\nSalidos correctamente: *${leftCount}* grupos\nFallidos: *${failedCount}* grupos`,
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
      return m.reply(`❌ No hay solicitudes pendientes`);
    pendingConfirmations.delete(m.sender);
    await m.react("❌");
    return m.reply(
      `❌ Activación cancelada\nPrimero pon el grupo en whitelist con *${m.prefix}agregar_renta*`,
    );
  }
  return m.reply(
    `❌ Comando no válido\n\nEscribe *${m.prefix}rentar_bot* para ver la guía completa`,
  );
}
export { pluginConfig as config, handler, pendingConfirmations };
