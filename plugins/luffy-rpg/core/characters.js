import { loadData } from "./database.js";

export function getCharacters() {
  return loadData("characters");
}

export function getCharacterById(id) {
  return getCharacters().find((c) => c.id === id) || null;
}
