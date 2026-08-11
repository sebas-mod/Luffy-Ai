import { loadData } from "./database.js";

export function getIslas() {
  return loadData("islands");
}

export function getIslaById(id) {
  return getIslas().find((i) => i.id === id) || null;
}

export function getIslasOrdenadas() {
  return [...getIslas()].sort((a, b) => (a.orden || 999) - (b.orden || 999));
}

export function getIslasDisponibles(nivel) {
  return getIslasOrdenadas().filter((i) => nivel >= (i.nivelMin || 1));
}
