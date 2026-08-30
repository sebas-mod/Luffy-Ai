import { ensureUser, getUser, updateUser } from "./core/user.js";
import { getIslaById, getIslasDisponibles } from "./core/islands.js";
import { addExp } from "./core/level.js";
import { removeCarne, hasCarne } from "./core/energy.js";
import { registrarProgreso } from "./core/missions.js";

const pluginConfig = {
  name: "viajar",
  alias: ["viajar_pg", "navegar", "travel"],
  category: "rpg",
  description: "🚢 Viajar a otra isla del mapa",
  usage: ".viajar <id_isla>",
  example: ".viajar isla_shells",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 15,
  carne: 0,
  isEnabled: true,
};

function handler(m, { sock }) {
  const user = ensureUser(m.sender, m.pushName || "Usuario");
  const args = m.args || [];
  const id = args[0]?.toLowerCase();

  if (!id) {
    let txt = `🚢 *VIAJAR*\n\n`;
    txt += `Usa: *${m.prefix}viajar <id_isla>*\n\n`;
    txt += `*Islas disponibles:*\n`;
    const disponibles = getIslasDisponibles(user.nivel);
    for (const isla of disponibles) {
      txt += `• ${isla.emoji} \`${isla.id}\` — ${isla.nombre} (Nv. ${isla.nivelMin})\n`;
    }
    txt += `\n> Ver mapa completo con *${m.prefix}isla*`;
    return m.reply(txt);
  }

  const isla = getIslaById(id);
  if (!isla) return m.reply(`❌ Isla \`${id}\` no encontrada. Revisa con *${m.prefix}isla*.`);

  if (user.nivel < isla.nivelMin) {
    return m.reply(
      `🔒 *ISLA BLOQUEADA*\n\n` +
        `${isla.emoji} *${isla.nombre}* requiere nivel *${isla.nivelMin}*.\n` +
        `> Tu nivel: *${user.nivel}*\n` +
        `> Sube de nivel con *${m.prefix}explorar* y *${m.prefix}entrenar*.`,
    );
  }

  if (user.islaId === isla.id) {
    return m.reply(`📍 Ya te encuentras en ${isla.emoji} *${isla.nombre}*.`);
  }

  if (!hasCarne(m.sender, 20)) {
    return m.reply(
      `🍖 *SIN ENERGÍA*\n\n` +
        `Viajar consume *20* de Carne.\n\n` +
        `> Come con *${m.prefix}usar carne_asada* o reclama tu *${m.prefix}diario*.`,
    );
  }

  removeCarne(m.sender, 20);
  const res = addExp(m.sender, 30);
  registrarProgreso(m.sender, "viajar", 1);

  updateUser(m.sender, (u) => {
    u.islaId = isla.id;
    return u;
  });

  let txt = `╭━━━⛵━━━╮\n`;
  txt += `⛵ *¡VIAJE COMPLETADO!*\n`;
  txt += `${isla.emoji} Has llegado a *${isla.nombre}*\n`;
  txt += `_${isla.descripcion}_\n\n`;
  txt += `✨ *EXP:* +30\n`;
  if (res.subio) txt += `👑 *¡Subiste de nivel! Ahora eres nivel ${res.nivel}!*\n`;
  txt += `\n☽◯☾ ♰ Explora con *${m.prefix}explorar* o pelea con *${m.prefix}combate*.`;

  return m.reply(txt);
}

export { pluginConfig as config, handler };
