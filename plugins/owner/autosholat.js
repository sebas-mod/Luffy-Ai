import * as timeHelper from "../../src/lib/ourin-time.js";
import { getDatabase } from "../../src/lib/ourin-database.js";
import config from "../../config.js";
import {
  getTodaySchedule,
  extractPrayerTimes,
  searchKota,
} from "../../src/lib/ourin-sholat-api.js";
import te from "../../src/lib/ourin-error.js";

const pluginConfig = {
  name: "autosholat",
  alias: ["sholat", "autoadzan"],
  category: "owner",
  description: "Activa recordatorios automáticos de oración con audio y cierre del grupo",
  usage: ".autosholat on/off/status/kota <nombre>",
  example: ".autosholat on",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

const AUDIO_ADZAN = "https://media.vocaroo.com/mp3/1ofLT2YUJAjQ";

async function handler(m, { sock, db }) {
  const args = m.args[0]?.toLowerCase();
  const database = getDatabase();
  
  if (!args || args === "status") {
    const status = database.setting("autoSholat") ? "Activo ✅" : "Nonactivo ❌";
    const closeGroup = database.setting("autoSholatCloseGroup") ? "Ya ✅" : "No ❌";
    const duration = database.setting("autoSholatDuration") || 5;
    const kotaSetting = database.setting("autoSholatKota") || { id: "1301", nama: "KOTA JAKARTA" };
    
    let jadwalText = "";
    try {
      const jadwalData = await getTodaySchedule(kotaSetting.id);
      const times = extractPrayerTimes(jadwalData);
      for (const [nama, waktu] of Object.entries(times)) {
        jadwalText += `- **${nama.charAt(0).toUpperCase() + nama.slice(1)}**: ${waktu}\n`;
      }
    } catch {
      jadwalText = "- Fallo al cargar el horario de MyQuran\n";
    }

    return m.reply(
      `🕌 **Auto Sholat - Sistema de Recordatorio de Tiempo de Oración**\n\n` +
      `El sistema está configurado para ayudarte a ti y a los miembros del grupo a recordar el tiempo de oración de forma automática. Lo siguiente es la configuración actual:\n\n` +
      `- **Status Pengingat**: ${status}\n` +
      `- **Cierre Automático del Grupo**: ${closeGroup}\n` +
      `- **Duración del Cierre**: ${duration} minuto\n` +
      `- **Ubicación del Recordatorio**: ${kotaSetting.nama}\n\n` +
      `**Horario de Oración de Hoy:**\n` +
      jadwalText + `\n` +
      `**Guía de Configuración:**\n` +
      `- Escribe \`${m.prefix}autosholat on\` para activar el sistema de recordatorio.\n` +
      `- Escribe \`${m.prefix}autosholat off\` para desactivar el sistema de recordatorio.\n` +
      `- Escribe \`${m.prefix}autosholat close on\` o \`off\` para activar/desactivar el cierre automático del grupo.\n` +
      `- Escribe \`${m.prefix}autosholat duration <angka>\` para determinar cuánto tiempo el grupo será cerrado (en minutos).\n` +
      `- Escribe \`${m.prefix}autosholat kota <nombre daerah>\` para sincronizar el tiempo de oración con la región que elijas.\n\n` +
      `_Todos los horarios se obtienen de forma precisa y directa del centro de datos de MyQuran API._`
    );
  }

  if (args === "on") {
    database.setting("autoSholat", true);
    await m.react("✅");
    const kota = database.setting("autoSholatKota") || { nama: "KOTA JAKARTA" };
    return m.reply(
      `✅ **Sistema de Recordatorio de Oración Activado con Éxito!**\n\n` +
      `A partir de ahora, enviaré mensajes de notificación junto con la grabación de audio del adhan cuando llegue el tiempo de oración. Toda la información se ajustará a la zona horaria de **${kota.nama}** ya!`
    );
  }

  if (args === "off") {
    database.setting("autoSholat", false);
    await m.react("❌");
    return m.reply(
      `❌ **Sistema de Recordatorio de Oración Desactivado.**\n\n` +
      `Está bien, ya no volveré a transmitir el horario de oración y a reproducir el audio del adhan de forma automática a los grupos.`
    );
  }

  if (args === "close") {
    const subArg = m.args[1]?.toLowerCase();
    if (subArg === "on") {
      database.setting("autoSholatCloseGroup", true);
      await m.react("🔒");
      return m.reply(
        `🔒 **Cierre Automático del Grupo Activado!**\n\n` +
        `Cuando llegue el tiempo de oración, cerraré automáticamente el chat del grupo para que todos puedan enfocarse en la oración primero. ¿Verdad?`
      );
    }
    if (subArg === "off") {
      database.setting("autoSholatCloseGroup", false);
      await m.react("🔓");
      return m.reply(
        `🔓 **Cierre Automático del Grupo Desactivado.**\n\n` +
        `Ahora el grupo no será cerrado cuando suene el adhan, por lo que el chat podrá continuar sin interrupciones.`
      );
    }
    return m.reply(`Oh, lo siento. El formato es un poco confuso. Por favor usa \`${m.prefix}autosholat close on\` o \`${m.prefix}autosholat close off\`.`);
  }

  if (args === "duration") {
    const duration = parseInt(m.args[1]);
    if (isNaN(duration) || duration < 1 || duration > 60) {
      return m.reply(`Por favor ingresa un número entre 1 y 60 para la duración del cierre del grupo (en minutos).`);
    }
    database.setting("autoSholatDuration", duration);
    await m.react("⏱️");
    return m.reply(
      `⏱️ **Duración del Cierre Grup Ha Dipernuevoi!**\n\n` +
      `Luego, el acceso al chat del grupo se bloqueará durante **${duration} minuto** consecutivos en cada horario de oración antes de abrirlo de vuelta automáticamente.`
    );
  }

  if (args === "kota") {
    const kotaName = m.args.slice(1).join(" ").trim();
    if (!kotaName) {
      return m.reply(`Por favor menciona también el nombre de la ciudad! Misalnya, \`${m.prefix}autosholat kota Surabaya\`.`);
    }
    await m.react("🔍");
    try {
      const result = await searchKota(kotaName);
      if (!result) {
        return m.reply(`Vaya, estuve buscando en la base de datos de MyQuran pero el nombre de la región **${kotaName}** no pude encontrar. Prueba con otro nombre de ciudad?`);
      }
      database.setting("autoSholatKota", {
        id: result.id,
        nama: result.lokasi,
      });
      await m.react("📍");
      return m.reply(
        `📍 **Ubicación del Recordatorio Actualizada!**\n\n` +
        `Todos los horarios de oración han sido recalibrados para ajustarse a la región **${result.lokasi}**.`
      );
    } catch (e) {
      await m.reply(te(m.prefix, m.command, m.pushName));
    }
  }

  return m.reply(`El comando que ingresaste no es correcto. Puedes usar el parámetro seperti \`on\`, \`off\`, \`status\`, \`close\`, \`duration\`, o \`kota\`.`);
}

async function runAutoSholat(sock) {
  const db = getDatabase();
  if (!db.setting("autoSholat")) return;
  
  const kotaSetting = db.setting("autoSholatKota") || {
    id: "1301",
    nama: "KOTA JAKARTA",
  };
  
  let times;
  try {
    const jadwalData = await getTodaySchedule(kotaSetting.id);
    times = extractPrayerTimes(jadwalData);
  } catch {
    return;
  }
  
  const JADWAL = {
    subuh: times.subuh,
    dzuhur: times.dzuhur,
    ashar: times.ashar,
    maghrib: times.maghrib,
    isya: times.isya,
  };
  
  const timeNow = timeHelper.getCurrentTimeString();
  if (!global.autoSholatLock) global.autoSholatLock = {};
  
  for (const [sholat, waktu] of Object.entries(JADWAL)) {
    if (waktu === "-") continue;
    
    if (timeNow === waktu && !global.autoSholatLock[sholat]) {
      global.autoSholatLock[sholat] = true;
      try {
        global.isFetchingGroups = true;
        const groupsObj = await sock.groupFetchAllParticipating();
        global.isFetchingGroups = false;
        
        const groupList = Object.keys(groupsObj);
        const closeGroup = db.setting("autoSholatCloseGroup") || false;
        const duration = db.setting("autoSholatDuration") || 5;

        for (const jid of groupList) {
          const groupData = db.data?.groups?.[jid] || {};
          if (groupData.notifSholat === false) continue;
          
          try {
            const caption =
              `🕌 **Notificación de Tiempo de Oración ${sholat.toUpperCase()}** 🕌\n\n` +
              `Es hora de descansar un momento de tus asuntos mundanos! Tiempo para realizar la oración **${sholat}** ha llegado para la región **${kotaSetting.nama}** y sekitarnya (tepatnya en pukul **${waktu} WIB**).\n\n` +
              `Mari segarkan pikiran, ambil air wudhu, y hampiri panggilan suci-Nya. Que disfrutes realizar tu oración! 🤲\n\n` +
              (closeGroup ? `_Como forma de respeto, el sistema cerrará el chat de este grupo por un tiempo temporal (durante ${duration} minuto)._` : "");
            
            const msgTeks = await sock.sendMessage(jid, {
              text: caption,
            });

            await sock.sendMessage(jid, {
              audio: { url: AUDIO_ADZAN },
              mimetype: "audio/mpeg",
              ptt: false,
            }, { quoted: msgTeks });

            if (closeGroup) {
              await sock.groupSettingUpdate(jid, "announcement");
            }
            await new Promise((res) => setTimeout(res, 500));
          } catch (e) {
            console.log(`Fallo enviar mensaje sholat al grupo ${jid}:`, e.message);
          }
        }
        
        if (closeGroup) {
          setTimeout(async () => {
            for (const jid of groupList) {
              try {
                await sock.groupSettingUpdate(jid, "not_announcement");
                await sock.sendMessage(jid, {
                  text: `✅ **Tiempo de Cierre Ha Finalizado**\n\nLa sesión de oración **${sholat}** ha terminado. El chat del grupo ahora se abrirá de vuelta automáticamente. Que disfrutes continuar con tus actividades!`,
                });
                await new Promise((res) => setTimeout(res, 600));
              } catch (e) {
                console.log(`Fallo abriendo obrolan grup ${jid}:`, e.message);
              }
            }
            console.log(`Completado el restablecimiento de apertura de todos los grupos.`);
          }, duration * 60 * 1000);
        }
        
        console.log(`Transmisión del adhan ${sholat} éxito realizada a ${groupList.length} grup de forma paralel.`);
      } catch (error) {
        global.isFetchingGroups = false;
        console.error("Ocurrió un error en el ejecutor:", error.message);
      }
      
      setTimeout(() => {
        delete global.autoSholatLock[sholat];
      }, 2 * 60 * 1000);
    }
  }
}

export { pluginConfig as config, handler, runAutoSholat, AUDIO_ADZAN };
