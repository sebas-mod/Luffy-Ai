import { loadData, saveData } from "./database.js";
import { now, uid } from "./utils.js";

export function getCrews() {
  return loadData("crews");
}

export function getCrew(id) {
  return getCrews()[id] || null;
}

export function getCrewByName(nombre) {
  const crews = getCrews();
  return Object.values(crews).find(
    (c) => c.nombre.toLowerCase() === String(nombre).toLowerCase(),
  ) || null;
}

export function crearCrew(jid, nombre) {
  const id = uid();
  const crew = {
    id,
    nombre,
    creadoEn: now(),
    capitan: jid,
    miembros: [jid],
    oficiales: [],
    tesoro: 0,
    descripcion: "",
  };
  const crews = getCrews();
  crews[id] = crew;
  saveData("crews");
  return crew;
}

export function actualizarCrew(id, mutator) {
  const crews = getCrews();
  const crew = crews[id];
  if (!crew) return null;
  const r = mutator(crew);
  saveData("crews");
  return r;
}

export function agregarMiembro(id, jid) {
  return actualizarCrew(id, (c) => {
    if (!c.miembros.includes(jid)) c.miembros.push(jid);
    return c.miembros;
  });
}

export function quitarMiembro(id, jid) {
  return actualizarCrew(id, (c) => {
    c.miembros = c.miembros.filter((m) => m !== jid);
    c.oficiales = c.oficiales.filter((m) => m !== jid);
    if (c.capitan === jid) c.capitan = null;
    return c;
  });
}

export function eliminarCrew(id) {
  const crews = getCrews();
  if (crews[id]) {
    delete crews[id];
    saveData("crews");
    return true;
  }
  return false;
}

export function rolEnCrew(crew, jid) {
  if (crew.capitan === jid) return "capitan";
  if (crew.oficiales.includes(jid)) return "oficial";
  if (crew.miembros.includes(jid)) return "miembro";
  return null;
}
