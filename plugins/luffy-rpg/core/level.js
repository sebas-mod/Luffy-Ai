import { updateUser, getUser } from "./user.js";
import { FORMULAS, getRango, getProximoRango, getTituloById } from "./config.js";

export function getExp(jid) {
  return getUser(jid)?.exp || 0;
}

export function expSiguiente(nivel) {
  return FORMULAS.expSiguiente(nivel);
}

export function addExp(jid, amount, { onLevelUp } = {}) {
  return updateUser(jid, (u) => {
    u.exp = (u.exp || 0) + amount;
    let subio = false;
    while (u.exp >= FORMULAS.expSiguiente(u.nivel)) {
      u.exp -= FORMULAS.expSiguiente(u.nivel);
      u.nivel += 1;
      u.saludMax = FORMULAS.saludMax(u.nivel);
      u.carneMax = FORMULAS.carneMax(u.nivel);
      u.ataque = FORMULAS.ataqueBase(u.nivel);
      u.defensa = FORMULAS.defensaBase(u.nivel);
      u.salud = u.saludMax;
      u.carne = Math.min(u.carne ?? 0, u.carneMax);
      subio = true;
      if (onLevelUp) onLevelUp(u);
    }
    u.rango = getRango(u.nivel);
    if (u.nivel >= 100 && !u.titulos.includes("leyenda")) {
      u.titulos.push("leyenda");
      u.titulo = "leyenda";
    }
    return { exp: u.exp, nivel: u.nivel, subio };
  });
}

export function levelInfo(u) {
  return {
    nivel: u.nivel,
    exp: u.exp,
    expSiguiente: FORMULAS.expSiguiente(u.nivel),
    rango: getRango(u.nivel),
    proximoRango: getProximoRango(u.nivel),
    titulo: getTituloById(u.titulo),
  };
}
