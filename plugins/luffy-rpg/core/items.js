import { loadData } from "./database.js";

export function getItems() {
  return loadData("items");
}

export function getItem(id) {
  return getItems().find((i) => i.id === id) || null;
}

export function getItemById(id) {
  return getItem(id);
}

export function getItemsByType(type) {
  return getItems().filter((i) => i.type === type);
}
