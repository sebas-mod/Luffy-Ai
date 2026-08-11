import { ensureUser, getUser } from "./core/user.js";
import { getStats } from "./core/stats.js";
import { getEquipoStats } from "./core/stats.js";
import { getIslaById } from "./core/islands.js";
import { getTituloById, getProximoRango } from "./core/config.js";
import { getCrew } from "./core/crews.js";
import { getCantidadItem, getInventarioDetallado } from "./core/inventory.js";

const pluginConfig = {
  name: "perfil",
  alias: ["perfil_pg", "ficha", "rp"],
  category: "rpg",
  description: "📋 Ver tu ficha de pirata",
  usage: ".perfil [@usuario]",
  example: ".perfil",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  carne: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  let targetJid = m.sender;
  let nombre = m.pushName || "Usuario";

  if (m.quoted?.sender) {
    targetJid = m.quoted.sender;
    nombre = m.quoted.pushName || "Usuario";
  } else if (m.mentions?.length) {
    targetJid = m.mentions[0];
  }

  const user = getUser(targetJid);
  if (!user) {
    return m.reply(
      `❌ *Sin registro*\n\n` +
        `${targetJid === m.sender ? "Aún no eres un pirata." : "Este usuario aún no es un pirata."}\n\n` +
        `> Escribe *${m.prefix}iniciar* para comenzar la aventura.`,
    );
  }

  const s = getStats(user);
  const titulo = getTituloById(user.titulo);
  const proximo = getProximoRango(user.nivel);
  const tripulacion = user.tripulacionId ? getCrew(user.tripulacionId) : null;
  const inventario = getInventarioDetallado(targetJid);
  const isla = getIslaById(user.islaId);

  let txt = `🏴‍☠️ *FICHA DE PIRATA*\n\n`;
  txt += `👤 *${user.nombre}*\n`;
  txt += `🎗️ *Rango:* ${user.rango}\n`;
  txt += `🎖️ *Título:* ${titulo?.emoji || "🪙"} ${titulo?.nombre || "Novato"}\n`;
  txt += `⬆️ *Nivel:* ${user.nivel} (${user.exp}/${getExpRequerida(user.nivel)} EXP)\n`;
  if (proximo) txt += `🎯 *Próximo rango:* ${proximo.nombre} (Nv. ${proximo.nivel})\n\n`;
  txt += `💰 *Berrys:* ${user.berrys}\n`;
  txt += `🍖 *Carne:* ${s.carne}/${s.carneMax}\n`;
  txt += `❤️ *Salud:* ${s.salud}/${s.saludMax}\n\n`;
  txt += `⚔️ *Ataque:* ${s.ataque}\n`;
  txt += `🛡️ *Defensa:* ${s.defensa}\n`;
  txt += `💨 *Velocidad:* ${s.velocidad}\n\n`;

  if (isla) txt += `📍 *Isla:* ${isla.emoji} ${isla.nombre}\n`;
  if (tripulacion) txt += `🏴 *Tripulación:* ${tripulacion.nombre}\n`;

  const equipo = getEquipoStats(user.equipo || {});
  if (equipo.length) {
    txt += `\n🎒 *Equipo:*\n` + equipo.map((e) => `  ${e}`).join("\n");
  }

  txt += `\n🎒 *Objetos:* ${inventario.length} tipos\n`;
  txt += `⭐ *Personajes:* ${user.personajes.length} coleccionados`;

  return m.reply(txt);
}

function getExpRequerida(nivel) {
  return Math.floor(100 * Math.pow(nivel, 1.4));
}

export { pluginConfig as config, handler };
