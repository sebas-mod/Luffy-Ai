import { FORMULAS } from "./config.js";
import { clamp } from "./utils.js";
import { getItemById } from "./items.js";
import { loadData } from "./database.js";

export function getStats(user) {
  const u = user || {};
  const nivel = u.nivel || 1;
  let ataque = (u.ataque ?? FORMULAS.ataqueBase(nivel)) + (u.ataqueBonus || 0);
  let defensa = (u.defensa ?? FORMULAS.defensaBase(nivel)) + (u.defensaBonus || 0);
  let velocidad = (u.velocidad || 10) + (u.velocidadBonus || 0);
  let salud = u.salud ?? FORMULAS.saludMax(nivel);
  let saludMax = u.saludMax ?? FORMULAS.saludMax(nivel);

  const eq = u.equipo || {};

  if (eq.fruta) {
    const fruta = loadData("fruits").find((f) => f.id === eq.fruta);
    if (fruta) {
      ataque += fruta.ataque || 0;
      velocidad += fruta.velocidad || 0;
    }
  }

  if (eq.gear) {
    const gearBonus = { gear2: 30, gear3: 60, gear4: 100, gear5: 180 }[eq.gear] || 0;
    ataque += gearBonus;
  }

  if (eq.haki) {
    const haki = loadData("hakis")?.find((h) => h.id === eq.haki);
    if (haki) {
      ataque += haki.ataque || 0;
      defensa += haki.defensa || 0;
      velocidad += haki.velocidad || 0;
    }
  }

  if (eq.barco) {
    const barco = loadData("ships").find((b) => b.id === eq.barco);
    if (barco) {
      defensa += barco.defensa || 0;
      saludMax += barco.saludBonus || 0;
    }
  }

  const carneRestante = clamp(u.carne ?? 0, 0, u.carneMax || 100);
  const hambriento = carneRestante <= 10;

  return {
    nivel,
    ataque: Math.max(1, Math.floor(ataque)),
    defensa: Math.max(0, Math.floor(defensa)),
    velocidad: Math.max(1, Math.floor(velocidad)),
    salud: clamp(salud, 0, saludMax),
    saludMax,
    carne: carneRestante,
    carneMax: u.carneMax || 100,
    hambriento,
  };
}

export function setHealth(jid, user, value) {
  const max = user.saludMax ?? FORMULAS.saludMax(user.nivel || 1);
  user.salud = clamp(value, 0, max);
  return user.salud;
}

export function heal(jid, user, amount) {
  const max = user.saludMax ?? FORMULAS.saludMax(user.nivel || 1);
  user.salud = clamp((user.salud ?? max) + amount, 0, max);
  return user.salud;
}

export function damage(user, amount) {
  const max = user.saludMax ?? FORMULAS.saludMax(user.nivel || 1);
  user.salud = clamp((user.salud ?? max) - amount, 0, max);
  return user.salud;
}

export function getEquipoStats(eq) {
  const desc = [];
  if (eq.fruta) {
    const fruta = loadData("fruits").find((f) => f.id === eq.fruta);
    if (fruta) desc.push(`🍎 Fruta: ${fruta.nombre} (+${fruta.ataque || 0} ATK)`);
  }
  if (eq.haki) {
    const haki = loadData("hakis")?.find((h) => h.id === eq.haki);
    if (haki) desc.push(`🌊 Haki: ${haki.nombre}`);
  }
  if (eq.gear) {
    const gears = { gear2: "Gear 2", gear3: "Gear 3", gear4: "Gear 4", gear5: "Gear 5" };
    desc.push(`💥 ${gears[eq.gear] || eq.gear}`);
  }
  if (eq.barco) {
    const barco = loadData("ships").find((b) => b.id === eq.barco);
    if (barco) desc.push(`🚢 Barco: ${barco.nombre}`);
  }
  return desc;
}

export function usarItemEfecto(user, item) {
  let texto = "";
  const stats = getStats(user);
  if (item.efecto?.carne) {
    user.carne = clamp((user.carne ?? 0) + item.efecto.carne, 0, user.carneMax || 100);
    texto += `+${item.efecto.carne} 🍖 Carne\n`;
  }
  if (item.efecto?.salud) {
    user.salud = clamp((user.salud ?? 0) + item.efecto.salud, 0, user.saludMax || 100);
    texto += `+${item.efecto.salud} ❤️ Salud\n`;
  }
  if (item.efecto?.ataque) {
    user.ataqueBonus = (user.ataqueBonus || 0) + item.efecto.ataque;
    texto += `+${item.efecto.ataque} ⚔️ Ataque permanente\n`;
  }
  if (item.efecto?.defensa) {
    user.defensaBonus = (user.defensaBonus || 0) + item.efecto.defensa;
    texto += `+${item.efecto.defensa} 🛡️ Defensa permanente\n`;
  }
  return texto || "Sin efecto visible.";
}
