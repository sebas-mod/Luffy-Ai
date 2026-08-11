import { ensureUser, getUser, updateUser } from "./core/user.js";
import { getIslaById } from "./core/islands.js";
import { getStats, damage } from "./core/stats.js";
import { elegirEnemigo, elegirJefe, resolverTurno, aplicarRecompensa, getEnemigo, costoCarne } from "./core/combat.js";
import { removeCarne, hasCarne, refreshStats } from "./core/energy.js";
import { getRemaining, setCooldown, formatCooldown } from "./core/cooldown.js";
import { registrarProgreso } from "./core/missions.js";
import { chance } from "./core/utils.js";

const pluginConfig = {
  name: "combate",
  alias: ["pelea", "batalla", "fight"],
  category: "rpg",
  description: "⚔️ Pelear contra un enemigo de tu isla",
  usage: ".combate [enemigo_id|jefe]",
  example: ".combate",
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

  const remaining = getRemaining(m.sender, "combate", 30);
  if (remaining > 0) {
    return m.reply(
      `⏳ *Recuperándote de la batalla...*\n\n` +
        `> Podrás pelear en *${formatCooldown(remaining)}*.`,
    );
  }

  const isla = getIslaById(user.islaId);
  if (!isla) return m.reply(`❌ No estás en una isla válida.`);

  const args = m.args || [];
  let enemigo = null;

  if (args[0]?.toLowerCase() === "jefe") {
    enemigo = elegirJefe(user.islaId);
  } else if (args[0]) {
    enemigo = getEnemigo(args[0]);
  } else {
    enemigo = elegirEnemigo(user.islaId);
  }

  if (!enemigo) return m.reply(`❌ No hay enemigos aquí.`);

  const costo = costoCarne(enemigo);
  if (!hasCarne(m.sender, costo)) {
    return m.reply(
      `🍖 *SIN ENERGÍA*\n\n` +
        `Luchar contra *${enemigo.nombre}* cuesta *${costo}* de Carne.\n\n` +
        `> Come con *${m.prefix}usar carne_asada* o reclama tu *${m.prefix}diario*.`,
    );
  }

  removeCarne(m.sender, costo);
  setCooldown(m.sender, "combate");

  refreshStats(m.sender);
  const statsJugador = getStats(user);
  const resultado = resolverTurno(user, enemigo, statsJugador);

  let txt = `⚔️ *BATALLA:* Tú vs ${enemigo.emoji} ${enemigo.nombre}\n`;
  txt += `━━━━━━━━━━━━━━━\n`;
  txt += resultado.log.join("\n");
  txt += `\n━━━━━━━━━━━━━━━\n`;

  if (resultado.victoria) {
    const recompensa = aplicarRecompensa(m.sender, user, enemigo, { jefe: !!enemigo.jefe });
    registrarProgreso(m.sender, "derrotar", 1);
    updateUser(m.sender, (u) => {
      u.salud = resultado.saludJugador;
      u.victorias = (u.victorias || 0) + 1;
      if (enemigo.jefe) u.jefesDerrotados = (u.jefesDerrotados || 0) + 1;
      return u;
    });
    txt += `🎉 *¡VICTORIA!*\n`;
    txt += `✨ *EXP:* +${recompensa.expBase}\n`;
    txt += `💰 *Berrys:* +${recompensa.berryGanado}\n`;
    if (recompensa.drops.length) {
      txt += `🎁 *Botín:* ${recompensa.drops.join(", ")}\n`;
    }
    if (recompensa.resultado?.subio) {
      txt += `\n🎉 *¡SUBISTE DE NIVEL! Ahora eres nivel ${recompensa.resultado.nivel}!*\n`;
    }
    txt += `\n❤️ *Salud restante:* ${resultado.saludJugador}/${statsJugador.saludMax}\n`;
    txt += `> Recupérate con *${m.prefix}usar pocion_menor*`;
  } else {
    updateUser(m.sender, (u) => {
      u.salud = Math.max(1, resultado.saludJugador);
      u.derrotas = (u.derrotas || 0) + 1;
      return u;
    });
    txt += `💀 *¡DERROTA!*\n`;
    txt += `${enemigo.nombre} fue demasiado fuerte.\n`;
    txt += `\n❤️ *Salud restante:* ${Math.max(1, resultado.saludJugador)}/${statsJugador.saludMax}\n`;
    txt += `> Recupérate con *${m.prefix}usar pocion_menor* o *${m.prefix}diario*.`;
  }

  return m.reply(txt);
}

export { pluginConfig as config, handler };
