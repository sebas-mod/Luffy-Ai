import { ensureUser, getUser, updateUser } from "./core/user.js";
import { getMisiones, getMision, getMisionesActivas, asignarMision, asignarMisionesDiarias, completarMision } from "./core/missions.js";

const pluginConfig = {
  name: "mision",
  alias: ["misiones", "quest", "mision_pg"],
  category: "rpg",
  description: "🎯 Ver y gestionar misiones piratas",
  usage: ".mision [listar|asignar <id>|completar <id>]",
  example: ".mision listar",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  carne: 0,
  isEnabled: true,
};

function handler(m, { sock }) {
  const user = ensureUser(m.sender, m.pushName || "Usuario");
  const args = m.args || [];
  const accion = (args[0] || "listar").toLowerCase();

  if (accion === "listar" || accion === "diarias") {
    asignarMisionesDiarias(m.sender);
    const activas = getMisionesActivas(m.sender);

    let txt = `☽◯☾ ╭ ♰ 🎯 MISIONES ACTIVAS ♰ ━╮ ☽◯☾\n`;
    if (activas.length === 0) {
      txt += `┃ No tienes misiones activas.\n`;
      txt += `☽◯☾ ♰ Usa *${m.prefix}mision asignar <id>* para tomar una.`;
    } else {
      activas.forEach(({ mision, progreso }, i) => {
        txt += `┃\`${i + 1}\` ${mision.emoji || "🎯"} *${mision.nombre}*\n`;
        txt += `┃    📝 ${mision.descripcion}\n`;
        txt += `┃    ⏳ Progreso: *${progreso.progreso}/${progreso.objetivo}*\n`;
        txt += `┃    💰 ${mision.recompensa?.berrys || 0} Berrys • ✨ ${mision.recompensa?.exp || 0} EXP\n`;
        txt += `┃    › \`${m.prefix}mision completar ${mision.id}\`\n`;
      });
    }

    txt += `\n📋 *Misiones disponibles:*\n`;
    const disponibles = getMisiones().filter((mi) => !user.misiones?.[mi.id]);
    disponibles.forEach((mi) => {
      txt += `• \`${mi.id}\` — ${mi.nombre} (${mi.frecuencia})\n`;
    });

    return m.reply(txt);
  }

  if (accion === "asignar") {
    const id = args[1];
    if (!id) return m.reply(`Usa: *${m.prefix}mision asignar <id>*`);
    const mision = getMision(id);
    if (!mision) return m.reply(`❌ Misión \`${id}\` no encontrada.`);
    if (user.misiones?.[id]) {
      return m.reply(`⚠️ Ya tienes la misión *${mision.nombre}* asignada.`);
    }
    asignarMision(m.sender, id);
    return m.reply(
      `✅ *MISIÓN ASIGNADA*\n\n` +
        `🎯 *${mision.nombre}*\n` +
        `📝 ${mision.descripcion}\n` +
        `⏳ Objetivo: *${mision.objetivo}*\n\n` +
        `¡Ve a completarla!`,
    );
  }

  if (accion === "completar") {
    const id = args[1];
    if (!id) return m.reply(`Usa: *${m.prefix}mision completar <id>*`);
    const resultado = completarMision(m.sender, id);
    const mision = getMision(id);
    if (resultado === null) {
      return m.reply(
        mision
          ? `❌ Aún no has completado *${mision.nombre}*.\n> Revisa el progreso con *${m.prefix}mision listar*.`
          : `❌ Misión \`${id}\` no encontrada.`,
      );
    }
    let txt = `꧁༺ 🎉 MISIÓN COMPLETADA ༻꧂\n\n`;
    txt += `🎯 *${mision.nombre}*\n\n`;
    txt += `✨ *EXP:* +${resultado.expGanado}\n`;
    txt += `💰 *Berrys:* +${resultado.berryGanado}\n`;
    if (resultado.items?.length) {
      txt += `🎒 *Objetos:* ${resultado.items.join(", ")}\n`;
    }
    if (resultado.resultado?.subio) {
      txt += `\n👑 *¡SUBISTE DE NIVEL! Ahora eres nivel ${resultado.resultado.nivel}!*\n`;
    }
    return m.reply(txt);
  }

  return m.reply(`Uso: *${m.prefix}mision [listar|asignar|completar]*`);
}

export { pluginConfig as config, handler };
