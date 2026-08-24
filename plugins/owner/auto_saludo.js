import { getDatabase } from "../../src/lib/luffy-database.js";

const pluginConfig = {
  name: "auto_saludo",
  alias: ["sambutowner"],
  category: "group",
  description: "Configurar el saludo automático cuando el owner aparece tras mucho tiempo inactivo",
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
  if (ms < 60000) return `${ms / 1000} segundos`;
  if (ms < 3600000) return `${ms / 60000} minutos`;
  if (ms < 86400000) return `${ms / 3600000} horas`;
  if (ms < 604800000) return `${ms / 86400000} días`;
  return `${ms / 86400000} días`;
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
      pesanList: ["¡Hola {user}! Bienvenido de nuevo 🙇‍♂️"],
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
    groupData.autoSambut.pesanList = ["¡Hola {user}! Bienvenido de nuevo 🙇‍♂️"];
  }

  if (!action) {
    const status = groupData.autoSambut.enabled ? "Activo ✅" : "Inactivo ❌";
    const delayMs = groupData.autoSambut.delayMs || 7200000;
    const totalPesan = groupData.autoSambut.pesanList.length;

    return m.reply(
      `⚠️ *SISTEMA DE BIENVENIDA AUTO*\n\n` +
      `El sistema saluda al capitán en el grupo de forma aleatoria cuando aparece después de mucho tiempo inactivo.\n` +
      `Estado: *${status}*\n` +
      `Límite de tiempo inactivo: *${formatTime(delayMs)}*\n` +
      `Número de saludos aleatorios: *${totalPesan} Saludos*\n\n` +
      `*USO PRINCIPAL:*\n` +
      `• *${m.prefix}auto_saludo on/off* — Activar/desactivar la función en este grupo\n` +
      `• *${m.prefix}auto_saludo delay <tiempo>* — Cambiar el límite de tiempo inactivo\n\n` +
      `*CONFIGURACIÓN DE SALUDOS ALEATORIOS (LISTA):*\n` +
      `• *${m.prefix}auto_saludo list* — Ver todos los saludos registrados\n` +
      `• *${m.prefix}auto_saludo add <texto>* — Añadir un nuevo saludo a la lista\n` +
      `• *${m.prefix}auto_saludo del <número>* — Eliminar el mensaje en ese número de orden\n\n` +
      `*EXPLICACIÓN ESPECIAL:*\n` +
      `1. Usa el formato de tiempo: *s* (segundos), *m* (minutos), *h* (horas), *d* (días). Ejemplo: *${m.prefix}auto_saludo delay 30m*\n` +
      `2. Usa *{name}* para mencionar el pushname del capitán, y *{user}* para mencionar al capitán.\n` +
      `3. Si añades el atributo *--global* al final de cada comando, la configuración de este grupo se copiará a TODOS los grupos donde está el bot!`
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
      return m.reply(`👑•─────•👑\n${isEnable ? '✅' : '❌'} *Función de Bienvenida Auto Global ${isEnable ? 'Activada' : 'Desactivada'}!*\n\nTodos los grupos (${count}) ahora usan el mismo sistema de saludos que este grupo.\n✦────────✦`);
    }

    groupData.autoSambut.enabled = isEnable;
    database.setGroup(m.chat, { autoSambut: groupData.autoSambut });
    return m.reply(isEnable ? `✅ *Función de Bienvenida Auto Activada!*` : `❌ *Función de Bienvenida Auto Desactivada.*`);
  }

  if (action === "delay") {
    const timeInput = args[1];
    if (!timeInput) return m.reply(`╰┈➤ Por favor, dame el tiempo! Ejemplo: \`${m.prefix}auto_saludo delay 2h\``);

    const parsedMs = parseTime(timeInput);
    if (!parsedMs) {
      return m.reply(`╰┈➤ Formato de tiempo no reconocido. Usa un número y el sufijo s, m, h, d, w, y. Ejemplo: \`2h\` (2 horas), \`30m\` (30 minutos).`);
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
      return m.reply(`╭━━━〔 ✦ ÉXITO 〕━━━╮\n┃ ⏱️ *Retraso de Bienvenida Auto Global cambiado a ${formatTime(parsedMs)} para ${count} grupos!*\n╰━━━━━━━━━━━━╯`);
    }

    groupData.autoSambut.delayMs = parsedMs;
    database.setGroup(m.chat, { autoSambut: groupData.autoSambut });
    return m.reply(`👑•─────•👑\n⏱️ *Retraso de Bienvenida Auto cambiado!*\n\nAhora el bot te saludará después de que no escribas nada en este grupo durante *${formatTime(parsedMs)}* consecutivos.\n✦────────✦`);
  }

  if (action === "list") {
    let listText = `📜 *LISTA DE MENSAJES DE BIENVENIDA AUTO*\n\nHay *${groupData.autoSambut.pesanList.length}* saludos aleatorios registrados en este grupo:\n\n`;
    groupData.autoSambut.pesanList.forEach((text, index) => {
      listText += `*${index + 1}.* ${text}\n\n`;
    });
    listText += `_Usa \`${m.prefix}auto_saludo del <número>\` para eliminar uno._`;
    return m.reply(listText);
  }

  if (action === "add") {
    const newMsg = args.slice(1).filter(v => v !== '--global').join(" ").trim();
    if (!newMsg) {
      return m.reply(`👑•─────•👑\nPor favor, introduce el texto del saludo.\nEjemplo: \`${m.prefix}auto_saludo add Hola jefe {user}!\`\n✦────────✦`);
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
      return m.reply(`👑•─────•👑\n💬 *Nuevo mensaje añadido a la lista Global (${count} grupos)!*\n\nMensaje registrado:\n"${newMsg}"\n✦────────✦`);
    }

    return m.reply(`👑•─────•👑\n💬 *Nuevo mensaje añadido con éxito!*\nAhora hay ${groupData.autoSambut.pesanList.length} saludos aleatorios en la lista.\n✦────────✦`);
  }

  if (action === "del") {
    const indexInput = parseInt(args[1]);
    if (isNaN(indexInput) || indexInput < 1 || indexInput > groupData.autoSambut.pesanList.length) {
      return m.reply(`👑•─────•👑\nPor favor, introduce un número de orden de mensaje válido.\nMira la lista de números con \`${m.prefix}auto_saludo list\`.\n✦────────✦`);
    }
    if (groupData.autoSambut.pesanList.length <= 1) {
      return m.reply(`╰┈➤ ¡No se pudo eliminar! Debe haber al menos 1 mensaje en la lista de saludos de este grupo.`);
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
      return m.reply(`👑•─────•👑\n🗑️ *Mensaje eliminado con éxito a nivel Global (${count} grupos)!*\n\nEliminado:\n"${removedMsg}"\n✦────────✦`);
    }

    return m.reply(`👑•─────•👑\n🗑️ *Mensaje eliminado con éxito!*\n\nEliminado:\n"${removedMsg}"\nQuedan ${groupData.autoSambut.pesanList.length} saludos en la lista.\n✦────────✦`);
  }

  if (action === "pesan") {
    return m.reply(`👑•─────•👑\n⚠️ El comando \`pesan\` está obsoleto y ha sido reemplazado por el sistema aleatorio.\nPor favor, usa \`${m.prefix}auto_saludo add <texto>\` para añadir saludos, o \`${m.prefix}auto_saludo list\` para ver la lista de saludos.\n✦────────✦`);
  }

  return m.reply(`╰┈➤ Comando no válido. Intenta escribir \`${m.prefix}auto_saludo\` sin argumentos para ver el manual.`);
}

export { pluginConfig as config, handler };
