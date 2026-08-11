import { randomInt, chance, clamp, randomFloat } from "./utils.js";
import { loadData } from "./database.js";
import { addExp } from "./level.js";
import { addBerrys } from "./economy.js";
import { addItem } from "./inventory.js";

export function getEnemigos() {
  return loadData("enemies");
}

export function getEnemigo(id) {
  return getEnemigos().find((e) => e.id === id) || null;
}

export function getEnemigosDeIsla(islaId) {
  const isla = loadData("islands").find((i) => i.id === islaId);
  if (!isla?.enemigos) return [];
  return isla.enemigos
    .map((id) => getEnemigo(id))
    .filter(Boolean);
}

export function elegirEnemigo(islaId) {
  const enemigos = getEnemigosDeIsla(islaId);
  if (enemigos.length === 0) return null;
  return enemigos[randomInt(0, enemigos.length - 1)];
}

export function elegirJefe(islaId) {
  const isla = loadData("islands").find((i) => i.id === islaId);
  return getEnemigo(isla?.jefe) || null;
}

export function calcularDano(atacante, defensor, { critico = false } = {}) {
  const base = atacante.ataque * 1.2 - defensor.defensa * 0.4;
  const factor = randomFloat(0.85, 1.15);
  let dano = Math.max(1, Math.floor(base * factor));
  if (critico) dano = Math.floor(dano * 1.8);
  return dano;
}

export function resolverTurno(jugador, enemigo, statsJugador) {
  const ataqueJugador = statsJugador.ataque;
  const defensaJugador = statsJugador.defensa;
  const velJugador = statsJugador.velocidad;

  const eneStats = {
    ataque: enemigo.ataque,
    defensa: enemigo.defensa,
    velocidad: enemigo.velocidad,
  };

  const primeroJugador = velJugador >= eneStats.velocidad;

  const log = [];
  let saludJugador = statsJugador.salud;
  let saludEnemigo = enemigo.salud;

  const orden = primeroJugador ? ["jugador", "enemigo"] : ["enemigo", "jugador"];

  for (const turno of orden) {
    if (saludJugador <= 0 || saludEnemigo <= 0) break;

    if (turno === "jugador") {
      const critico = chance(12);
      const dano = calcularDano(
        { ataque: ataqueJugador },
        { defensa: eneStats.defensa },
        { critico },
      );
      saludEnemigo = clamp(saludEnemigo - dano, 0, enemigo.salud);
      log.push(
        `⚔️ *Tú* atacas a *${enemigo.nombre}* por *${dano}*${critico ? " 💥 ¡CRÍTICO!" : ""}${saludEnemigo === 0 ? " ☠️" : ""}`,
      );
    } else {
      const critico = chance(8);
      const dano = calcularDano(
        { ataque: eneStats.ataque },
        { defensa: defensaJugador },
        { critico },
      );
      saludJugador = clamp(saludJugador - dano, 0, statsJugador.saludMax);
      log.push(
        `👊 *${enemigo.nombre}* te golpea por *${dano}*${critico ? " 💥 ¡CRÍTICO!" : ""}${saludJugador === 0 ? " 🏴‍☠️" : ""}`,
      );
    }
  }

  return {
    log,
    saludJugador,
    saludEnemigo,
    victoria: saludEnemigo === 0 && saludJugador > 0,
    derrota: saludJugador === 0,
    empate: saludJugador === 0 && saludEnemigo === 0,
  };
}

export function aplicarRecompensa(jid, user, enemigo, { jefe = false } = {}) {
  const expBase = jefe ? enemigo.exp * 3 : enemigo.exp;
  const berryBase = jefe ? enemigo.berrys * 3 : enemigo.berrys;
  const resultado = addExp(jid, expBase);
  addBerrys(jid, berryBase);

  const drops = [];
  if (enemigo.drops && chance(enemigo.dropProbabilidad ?? 25)) {
    const drop = enemigo.drops[randomInt(0, enemigo.drops.length - 1)];
    addItem(jid, drop, 1);
    drops.push(drop);
  }

  return { expBase, berryGanado: berryBase, drops, resultado };
}

export function costoCarne(enemigo) {
  return Math.max(1, Math.ceil(enemigo.nivel / 2));
}
