import { updateUser, getUser } from "./user.js";
import { clamp } from "./utils.js";
import { FORMULAS } from "./config.js";

export function getCarne(jid) {
  return getUser(jid)?.carne || 0;
}

export function addCarne(jid, amount) {
  return updateUser(jid, (u) => {
    const max = FORMULAS.carneMax(u.nivel || 1);
    u.carne = clamp((u.carne || 0) + amount, 0, max);
    u.carneMax = max;
    return u.carne;
  });
}

export function removeCarne(jid, amount) {
  return updateUser(jid, (u) => {
    const max = FORMULAS.carneMax(u.nivel || 1);
    u.carneMax = max;
    u.carne = clamp((u.carne || 0) - amount, 0, max);
    return u.carne;
  });
}

export function hasCarne(jid, amount) {
  return (getCarne(jid) || 0) >= amount;
}

export function refreshStats(jid) {
  return updateUser(jid, (u) => {
    const max = FORMULAS.carneMax(u.nivel || 1);
    const sMax = FORMULAS.saludMax(u.nivel || 1);
    u.carneMax = max;
    u.saludMax = sMax;
    u.carne = clamp(u.carne ?? max, 0, max);
    u.salud = clamp(u.salud ?? sMax, 0, sMax);
    return u;
  });
}
