import { ensureUser, getUser, updateUser } from "./core/user.js";
import { getCrews, getCrew, getCrewByName, crearCrew, agregarMiembro, quitarMiembro, eliminarCrew, actualizarCrew, rolEnCrew } from "./core/crews.js";
import { removeBerrys, addBerrys, getBerrys } from "./core/economy.js";

const pluginConfig = {
  name: "tripulacion",
  alias: ["tripulaciones", "crew", "tripu"],
  category: "rpg",
  description: "🏴 Gestionar tu tripulación pirata",
  usage: ".tripulacion [crear <nombre>|unirse <nombre>|salir|info|eliminar]",
  example: ".tripulacion crear Sombrero de Paja",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  carne: 0,
  isEnabled: true,
};

const PRECIO_CREAR = 2000;

function handler(m, { sock }) {
  const user = ensureUser(m.sender, m.pushName || "Usuario");
  const args = m.args || [];
  const accion = (args[0] || "info").toLowerCase();
  const nombre = args.slice(1).join(" ").trim();

  if (accion === "crear") {
    if (!nombre) return m.reply(`Usa: *${m.prefix}tripulacion crear <nombre>*`);
    if (user.tripulacionId) return m.reply(`⚠️ Ya perteneces a una tripulación.`);
    if (getCrewByName(nombre)) return m.reply(`❌ Ya existe una tripulación llamada *${nombre}*.`);
    if (getBerrys(m.sender) < PRECIO_CREAR) {
      return m.reply(
        `❌ *SALDO INSUFICIENTE*\n\n` +
          `Crear una tripulación cuesta *${PRECIO_CREAR} Berrys*.\n` +
          `> Tu saldo: *${getBerrys(m.sender)} Berrys*`,
      );
    }

    removeBerrys(m.sender, PRECIO_CREAR);
    const crew = crearCrew(m.sender, nombre);
    updateUser(m.sender, (u) => {
      u.tripulacionId = crew.id;
      return u;
    });

    return m.reply(
      `╭━━━🏴‍☠️━━━╮\n` +
        `🏴 *¡TRIPULACIÓN CREADA!*\n` +
        `🎌 *${crew.nombre}*\n` +
        `👑 Capitán: *${user.nombre}*\n` +
        `💰 Costo: ${PRECIO_CREAR} Berrys\n` +
        `☽◯☾ ♰ Invita miembros con *${m.prefix}tripulacion unirse ${crew.nombre}*`,
    );
  }

  if (accion === "unirse") {
    if (!nombre) return m.reply(`Usa: *${m.prefix}tripulacion unirse <nombre>*`);
    if (user.tripulacionId) return m.reply(`⚠️ Ya perteneces a una tripulación.`);
    const crew = getCrewByName(nombre);
    if (!crew) return m.reply(`❌ No existe la tripulación *${nombre}*.`);

    agregarMiembro(crew.id, m.sender);
    updateUser(m.sender, (u) => {
      u.tripulacionId = crew.id;
      return u;
    });

    return m.reply(
      `⚔️ *¡BIENVENIDO A LA TRIPULACIÓN!*\n` +
        `🏴 ⚔️ 🏴\n` +
        `🏴 *${crew.nombre}*\n` +
        `👥 Miembros: *${crew.miembros.length}*\n` +
        `☽◯☾ ♰ Ver info: *${m.prefix}tripulacion info*`,
    );
  }

  if (accion === "salir") {
    if (!user.tripulacionId) return m.reply(`❌ No perteneces a ninguna tripulación.`);
    const crew = getCrew(user.tripulacionId);
    if (crew?.capitan === m.sender) {
      return m.reply(`⚠️ Como capitán usa *${m.prefix}tripulacion eliminar* para disolver la tripulación.`);
    }
    quitarMiembro(crew.id, m.sender);
    updateUser(m.sender, (u) => {
      u.tripulacionId = null;
      return u;
    });
    return m.reply(`👋 Has salido de *${crew.nombre}*.`);
  }

  if (accion === "eliminar") {
    if (!user.tripulacionId) return m.reply(`❌ No perteneces a ninguna tripulación.`);
    const crew = getCrew(user.tripulacionId);
    if (crew?.capitan !== m.sender) return m.reply(`⚠️ Solo el capitán puede disolver la tripulación.`);
    eliminarCrew(crew.id);
    updateUser(m.sender, (u) => {
      u.tripulacionId = null;
      return u;
    });
    return m.reply(`💥 La tripulación *${crew.nombre}* ha sido disuelta.`);
  }

  if (accion === "lista") {
    const crews = Object.values(getCrews());
    if (crews.length === 0) return m.reply(`No hay tripulaciones registradas.\n> Crea una con *${m.prefix}tripulacion crear <nombre>*`);
    let txt = `☽◯☾ ╭ ♰ 🏴 TRIPULACIONES ♰ ━╮ ☽◯☾\n`;
    for (const c of crews) {
      txt += `┃ ⚑ *${c.nombre}*\n`;
      txt += `┃   👥 ${c.miembros.length} miembros · 👑 ${c.capitan}\n`;
    }
    txt += `╰━ ⊱༺༒༻⊰ ━╯`;
    return m.reply(txt);
  }

  // info por defecto
  if (!user.tripulacionId) {
    let txt = `🏴 *TRIPULACIONES*\n\n`;
    txt += `Únete a una tripulación o crea la tuya.\n\n`;
    txt += `• *${m.prefix}tripulacion crear <nombre>* — ${PRECIO_CREAR} Berrys\n`;
    txt += `• *${m.prefix}tripulacion unirse <nombre>*\n`;
    txt += `• *${m.prefix}tripulacion lista*\n`;
    txt += `• *${m.prefix}tripulacion info*\n`;
    return m.reply(txt);
  }

  const crew = getCrew(user.tripulacionId);
  if (!crew) return m.reply(`❌ Tu tripulación no existe.`);
  const rol = rolEnCrew(crew, m.sender);

  let txt = `☽◯☾ ╭ ♰ 🏴 ${crew.nombre} ♰ ━╮ ☽◯☾\n`;
  txt += `┃ 👑 *Capitán:* ${crew.capitan}\n`;
  txt += `┃ ⭐ *Tu rol:* ${rol}\n`;
  txt += `┃ 👥 *Miembros:* ${crew.miembros.length}\n`;
  txt += `┃ 💰 *Tesoro:* ${crew.tesoro} Berrys\n`;
  txt += `┃\n┃ *Miembros:*\n`;
  for (const jid of crew.miembros) {
    const nom = jid === m.sender ? "tú" : jid.split("@")[0];
    txt += `┃ › ${nom}\n`;
  }
  txt += `☽◯☾ ♰ Salir: *${m.prefix}tripulacion salir*`;

  return m.reply(txt);
}

export { pluginConfig as config, handler };
