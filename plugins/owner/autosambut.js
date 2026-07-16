import { getDatabase } from "../../src/lib/ourin-database.js";

const pluginConfig = {
  name: "autosambut",
  alias: ["sambutowner"],
  category: "group",
  description: "Configura el saludo automático cuando el dueño vuelve tras estar ausente",
  usage: ".autosambut on/off/delay/add/del/list",
  example: ".autosambut on",
  isOwner: true,
  isGroup: true,
  cooldown: 3,
  isEnabled: true,
};

function parseTime(str) {
  const match = str.match(/^([\d.]+)([a-zA-Z]+)$/);
  if (!match) return null;
  const val = parseFloat(match[1]);
  const unit = match[2].toLowerCase();

  if (unit.startsWith('s')) return val * 1000;
  if (unit.startsWith('m')) return val * 60 * 1000;
  if (unit.startsWith('h')) return val * 60 * 60 * 1000;
  if (unit.startsWith('d')) return val * 24 * 60 * 60 * 1000;
  if (unit.startsWith('w')) return val * 7 * 24 * 60 * 60 * 1000;
  if (unit.startsWith('y')) return val * 365 * 24 * 60 * 60 * 1000;
  return null;
}

function formatTime(ms) {
  if (ms < 60000) return `${ms / 1000} segundo`;
  if (ms < 3600000) return `${ms / 60000} minuto`;
  if (ms < 86400000) return `${ms / 3600000} hora(s)`;
  if (ms < 604800000) return `${ms / 86400000} día(s)`;
  return `${ms / 86400000} día(s)`;
}

async function handler(m, { sock, db }) {
  const args = m.args || [];
  const action = args[0]?.toLowerCase();
  const isGlobal = args.includes("--global");

  const database = getDatabase();
  let groupData = database.getGroup(m.chat);
  if (!groupData.autoSambut) {
    groupData.autoSambut = {
      enabled: false,
      delayMs: 2 * 60 * 60 * 1000,
      pesanList: ["Halo {user}! Bienvenido de vuelta 🙇‍♂️"],
      lastChats: {}
    };
    database.setGroup(m.chat, { autoSambut: groupData.autoSambut });
  }
  if (groupData.autoSambut.pesan !== undefined) {
    if (!groupData.autoSambut.pesanList) {
      groupData.autoSambut.pesanList = [groupData.autoSambut.pesan];
    }
    delete groupData.autoSambut.pesan;
    database.setGroup(m.chat, { autoSambut: groupData.autoSambut });
  }
  // Fallback
  if (!Array.isArray(groupData.autoSambut.pesanList) || groupData.autoSambut.pesanList.length === 0) {
    groupData.autoSambut.pesanList = ["Halo {user}! Bienvenido de vuelta 🙇‍♂️"];
  }

  if (!action) {
    const status = groupData.autoSambut.enabled ? "Activo ✅" : "Nonactivo ❌";
    const delayMs = groupData.autoSambut.delayMs || 7200000;
    const totalPesan = groupData.autoSambut.pesanList.length;

    return m.reply(
      `⚠️ *SISTEM AUTO SAMBUT*\n\n` +
      `El sistema automáticamente saluda al dueño en el grupo de forma aleatoria cuando el dueño aparece después de un largo tiempo inactivo.\n` +
      `Status: *${status}*\n` +
      `Batas Tiempo Idle: *${formatTime(delayMs)}*\n` +
      `Cantidad Mensaje Acak: *${totalPesan} Sapaan*\n\n` +
      `*PENGGUNAAN UTAMA:*\n` +
      `• *${m.prefix}autosambut on/off* — Activar/desactivar este en el grupo esto\n` +
      `• *${m.prefix}autosambut delay <tiempo>* — Cambiando batas tiempo idle\n\n` +
      `*PENGATURAN PESAN ACAK (LIST):*\n` +
      `• *${m.prefix}autosambut list* — Viendo todos los saludos que están listados\n` +
      `• *${m.prefix}autosambut add <texto>* — Agregar nuevo texto de saludo a la lista\n` +
      `• *${m.prefix}autosambut del <número>* — Eliminar mensaje en una posición específica\n\n` +
      `*PENJELASAN KHUSUS:*\n` +
      `1. Usa el formato tiempo: *s* (segundo), *m* (minuto), *h* (hora(s)), *d* (día(s)). Ejemplo: *${m.prefix}autosambut delay 30m*\n` +
      `2. Usa *{name}* para mencionar el nombre del owner, y *{user}* para etiquetar al owner.\n` +
      `3. Si agregas el atributo *--global* al final de cada comando, entonces la configuración en este grupo se copiará a TODOS los grupos que el bot visite!`
    );
  }

  if (action === "on" || action === "off") {
    const isEnable = action === "on";
    if (isGlobal) {
      const groups = await sock.groupFetchAllParticipating();
      let count = 0;
      for (const jid of Object.keys(groups)) {
        let gData = database.getGroup(jid) || {};
        gData.autoSambut = {
          enabled: isEnable,
          delayMs: groupData.autoSambut.delayMs,
          pesanList: [...groupData.autoSambut.pesanList],
          lastChats: {}
        };
        database.setGroup(jid, { autoSambut: gData.autoSambut });
        count++;
      }
      return m.reply(`${isEnable ? '✅' : '❌'} *Fesor Auto Sambut Global ${isEnable ? 'Activado' : 'Desactivado'}!*\n\nTodos los grupos (${count}) ahora usando el mismo sistema de saludos que este grupo.`);
    }

    groupData.autoSambut.enabled = isEnable;
    database.setGroup(m.chat, { autoSambut: groupData.autoSambut });
    return m.reply(isEnable ? `✅ *Fesor Auto Sambut Diactivokan!*` : `❌ *Fesor Auto Sambut Dinonactivokan.*`);
  }

  if (action === "delay") {
    const timeInput = args[1];
    if (!timeInput) return m.reply(`Por favor indica el tiempo! Ejemplo: \`${m.prefix}autosambut delay 2h\``);

    const parsedMs = parseTime(timeInput);
    if (!parsedMs) {
      return m.reply(`Formato de tiempo desconocido. Usa número y akhiran s, m, h, d, w, y. Ejemplo: \`2h\` (2 hora(s)), \`30m\` (30 minuto).`);
    }

    if (isGlobal) {
      const groups = await sock.groupFetchAllParticipating();
      let count = 0;
      for (const jid of Object.keys(groups)) {
        let gData = database.getGroup(jid) || {};
        gData.autoSambut = {
          enabled: groupData.autoSambut.enabled,
          delayMs: parsedMs,
          pesanList: [...groupData.autoSambut.pesanList],
          lastChats: {}
        };
        database.setGroup(jid, { autoSambut: gData.autoSambut });
        count++;
      }
      return m.reply(`⏱️ *Delay Auto Sambut Global Diubah a ${formatTime(parsedMs)} para ${count} grup!*`);
    }

    groupData.autoSambut.delayMs = parsedMs;
    database.setGroup(m.chat, { autoSambut: groupData.autoSambut });
    return m.reply(`⏱️ *Delay Auto Sambut Diubah!*\n\nAhora bot va a recibirte después de que no escribas nada en este grupo durante *${formatTime(parsedMs)}* consecutivos.`);
  }

  if (action === "list") {
    let listText = `📜 *DAFTAR PESAN AUTO SAMBUT*\n\nTotal hay *${groupData.autoSambut.pesanList.length}* saludos aleatorios listados en el grupo esto:\n\n`;
    groupData.autoSambut.pesanList.forEach((text, index) => {
      listText += `*${index + 1}.* ${text}\n\n`;
    });
    listText += `_Usa \`${m.prefix}autosambut del <número>\` para eliminar uno de ellos._`;
    return m.reply(listText);
  }

  if (action === "add") {
    const newMsg = args.slice(1).filter(v => v !== '--global').join(" ").trim();
    if (!newMsg) {
      return m.reply(`Por favor escribe el texto de saludo.\nEjemplo: \`${m.prefix}autosambut add Halo bosku {user}!\``);
    }

    groupData.autoSambut.pesanList.push(newMsg);
    database.setGroup(m.chat, { autoSambut: groupData.autoSambut });

    if (isGlobal) {
      const groups = await sock.groupFetchAllParticipating();
      let count = 0;
      for (const jid of Object.keys(groups)) {
        let gData = database.getGroup(jid) || {};
        gData.autoSambut = {
          enabled: groupData.autoSambut.enabled,
          delayMs: groupData.autoSambut.delayMs,
          pesanList: [...groupData.autoSambut.pesanList],
          lastChats: {}
        };
        database.setGroup(jid, { autoSambut: gData.autoSambut });
        count++;
      }
      return m.reply(`💬 *Mensaje Nuevo Agregado a Lista Global (${count} grup)!*\n\nMensaje listados:\n"${newMsg}"`);
    }

    return m.reply(`💬 *Mensaje Nuevo Éxito Agregado!*\nAsto hay ${groupData.autoSambut.pesanList.length} saludos aleatorios en la lista.`);
  }

  if (action === "del") {
    const indexInput = parseInt(args[1]);
    if (isNaN(indexInput) || indexInput < 1 || indexInput > groupData.autoSambut.pesanList.length) {
      return m.reply(`Tolong ingresa número urutan mensaje yang valid.\nLihat lista número con \`${m.prefix}autosambut list\`.`);
    }
    if (groupData.autoSambut.pesanList.length <= 1) {
      return m.reply(`Fallo al eliminar! Debe hay mestomal 1 mensaje dentro de lista sapaan grup esto.`);
    }

    const removedMsg = groupData.autoSambut.pesanList.splice(indexInput - 1, 1)[0];
    database.setGroup(m.chat, { autoSambut: groupData.autoSambut });

    if (isGlobal) {
      const groups = await sock.groupFetchAllParticipating();
      let count = 0;
      for (const jid of Object.keys(groups)) {
        let gData = database.getGroup(jid) || {};
        gData.autoSambut = {
          enabled: groupData.autoSambut.enabled,
          delayMs: groupData.autoSambut.delayMs,
          pesanList: [...groupData.autoSambut.pesanList],
          lastChats: {}
        };
        database.setGroup(jid, { autoSambut: gData.autoSambut });
        count++;
      }
      return m.reply(`🗑️ *Mensaje Éxito Eliminado de forma Global (${count} grup)!*\n\nEliminado:\n"${removedMsg}"`);
    }

    return m.reply(`🗑️ *Mensaje Éxito Dihapus!*\n\nEliminado:\n"${removedMsg}"\nSaludos restantes en la lista: ${groupData.autoSambut.pesanList.length}`);
  }

  if (action === "mensaje") {
    return m.reply(`⚠️ Comando \`mensaje\` ha sido obsoleto y reemplazado por el sistema aleatorio.\nPor favor usa \`${m.prefix}autosambut add <texto>\` para agregar saludos, o \`${m.prefix}autosambut list\` para ver la lista de saludos.`);
  }

  return m.reply(`Comando no válido. Intenta escribir \`${m.prefix}autosambut\` sin complementos para ver la guía.`);
}

export { pluginConfig as config, handler };
