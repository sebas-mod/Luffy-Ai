import fs from "fs";
import path from "path";
import { DATA_DIR } from "./utils.js";

const FILE_MANIFEST = {
  users: "users.json",
  characters: "characters.json",
  enemies: "enemies.json",
  items: "items.json",
  fruits: "fruits.json",
  islands: "islands.json",
  missions: "missions.json",
  ships: "ships.json",
  crews: "crews.json",
  hakis: "hakis.json",
};

const cache = {};

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function loadData(key) {
  if (cache[key]) return cache[key];
  ensureDir();
  const file = path.join(DATA_DIR, FILE_MANIFEST[key]);
  if (!fs.existsSync(file)) {
    cache[key] = key === "users" || key === "crews" ? {} : [];
    return cache[key];
  }
  try {
    cache[key] = JSON.parse(fs.readFileSync(file, "utf8")) ?? {};
  } catch {
    cache[key] = key === "users" || key === "crews" ? {} : [];
  }
  return cache[key];
}

export function saveData(key) {
  ensureDir();
  const file = path.join(DATA_DIR, FILE_MANIFEST[key]);
  const data = cache[key];
  if (data === undefined) return;
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
}

export function getData(key) {
  return loadData(key);
}

export function setData(key, value) {
  cache[key] = value;
  saveData(key);
}

export function updateData(key, mutator) {
  const data = loadData(key);
  const result = mutator(data);
  saveData(key);
  return result;
}

export function hasData(key) {
  return loadData(key) !== undefined;
}

export function persistAll() {
  for (const key of Object.keys(FILE_MANIFEST)) {
    saveData(key);
  }
}

export { DATA_DIR };
