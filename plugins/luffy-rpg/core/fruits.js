import { loadData } from "./database.js";

export function getFrutas() {
  return loadData("fruits");
}

export function getFrutaById(id) {
  return getFrutas().find((f) => f.id === id) || null;
}
