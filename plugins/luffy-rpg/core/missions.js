import { loadData } from "./database.js";
import { updateUser, getUser } from "./user.js";
import { addBerrys } from "./economy.js";
import { addExp } from "./level.js";
import { addItem } from "./inventory.js";
import { now } from "./utils.js";

export function getMisiones() {
  return loadData("missions");
}

export function getMision(id) {
  return getMisiones().find((mi) => mi.id === id) || null;
}

export function getMisionesActivas(jid) {
  const u = getUser(jid);
  const activas = u?.misiones || {};
  const det = [];
  for (const [id, prog] of Object.entries(activas)) {
    if (!prog || prog.completada) continue;
    const mision = getMision(id);
    if (mision) det.push({ mision, progreso: prog });
  }
  return det;
}

export function asignarMision(jid, id) {
  const mision = getMision(id);
  if (!mision) return null;
  updateUser(jid, (u) => {
    if (!u.misiones[id]) {
      u.misiones[id] = { progreso: 0, objetivo: mision.objetivo, completada: false, asignada: now() };
    }
  });
  return getMision(id);
}

export function recompensar(jid, user, mision) {
  const r = mision.recompensa || {};
  const uAntes = getUser(jid);
  const expAntes = uAntes?.exp || 0;
  const resultado = addExp(jid, r.exp || 0);
  const expGanado = r.exp || 0;
  const berry = addBerrys(jid, r.berrys || 0);
  const berryGanado = r.berrys || 0;
  const items = [];
  if (r.items) {
    for (const it of r.items) {
      addItem(jid, it.id, it.cantidad || 1);
      items.push(`${it.cantidad || 1}x ${it.id}`);
    }
  }
  return { resultado, expGanado, berry, berryGanado, items };
}

export function completarMision(jid, id) {
  const mision = getMision(id);
  if (!mision) return null;
  let resultado = null;
  updateUser(jid, (u) => {
    const prog = u.misiones[id];
    if (prog && !prog.completada && prog.progreso >= prog.objetivo) {
      prog.completada = true;
      prog.completadaEn = now();
      resultado = recompensar(jid, u, mision);
    }
  });
  return resultado;
}

export function registrarProgreso(jid, tipo, cantidad = 1) {
  updateUser(jid, (u) => {
    for (const [id, prog] of Object.entries(u.misiones || {})) {
      if (prog.completada) continue;
      const mision = getMision(id);
      if (!mision) continue;
      if (mision.tipo === tipo) {
        prog.progreso = Math.min(prog.objetivo, (prog.progreso || 0) + cantidad);
      }
    }
  });
}

export function asignarMisionesDiarias(jid) {
  const diarias = getMisiones().filter((m) => m.frecuencia === "diaria");
  updateUser(jid, (u) => {
    if (!u.misiones) u.misiones = {};
    const hoy = new Date().toDateString();
    if (!u.misionesDiarias || u.misionesDiarias.fecha !== hoy) {
      u.misionesDiarias = { fecha: hoy, ids: [] };
      for (const m of diarias.slice(0, 3)) {
        u.misionesDiarias.ids.push(m.id);
        if (!u.misiones[m.id]) {
          u.misiones[m.id] = { progreso: 0, objetivo: m.objetivo, completada: false, asignada: now() };
        }
      }
    }
  });
}
