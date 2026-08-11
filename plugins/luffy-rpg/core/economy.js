import { updateUser, getUser } from "./user.js";
import { clamp } from "./utils.js";

const MAX_BERRYS = 9000000000000;

export function addBerrys(jid, amount) {
  return updateUser(jid, (u) => {
    u.berrys = clamp((u.berrys || 0) + amount, 0, MAX_BERRYS);
    return u.berrys;
  });
}

export function removeBerrys(jid, amount) {
  return updateUser(jid, (u) => {
    const prev = u.berrys || 0;
    u.berrys = clamp(prev - amount, 0, MAX_BERRYS);
    return u.berrys;
  });
}

export function transferBerrys(fromJid, toJid, amount) {
  const from = updateUser(fromJid, (u) => {
    const prev = u.berrys || 0;
    if (prev < amount) return null;
    u.berrys = prev - amount;
    return u.berrys;
  });
  if (from === null) return false;
  addBerrys(toJid, amount);
  return true;
}

export function getBerrys(jid) {
  const u = getUser(jid);
  return u?.berrys || 0;
}
