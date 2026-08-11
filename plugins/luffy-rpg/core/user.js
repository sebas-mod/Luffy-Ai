import { loadData, saveData } from "./database.js";
import { FORMULAS, getRango } from "./config.js";
import { normalizeJid, now } from "./utils.js";

export function createUser(jid, nombre = "") {
  return {
    versionDatos: 1,
    jid: normalizeJid(jid),
    nombre: nombre || "Desconocido",
    nivel: 1,
    exp: 0,
    titulo: "novato",
    titulos: ["novato"],
    berrys: 100,
    carne: 100,
    carneMax: FORMULAS.carneMax(1),
    salud: 100,
    saludMax: FORMULAS.saludMax(1),
    ataque: FORMULAS.ataqueBase(1),
    defensa: FORMULAS.defensaBase(1),
    inventario: {},
    equipo: {
      fruta: null,
      haki: null,
      gear: null,
      barco: null,
    },
    personajes: [],
    misiones: {},
    diario: { ultimoDia: null, racha: 0, totalReclamado: 0 },
    cooldowns: {},
    historial: [],
    tripulacionId: null,
    islaId: "isla_foosha",
    creadoEn: now(),
    ultimaConexion: now(),
  };
}

export function getUser(jid) {
  const users = loadData("users");
  return users[normalizeJid(jid)] || null;
}

export function ensureUser(jid, nombre = "") {
  const users = loadData("users");
  const key = normalizeJid(jid);
  if (!users[key]) {
    users[key] = createUser(jid, nombre);
    saveData("users");
  }
  return users[key];
}

export function saveUser(jid, user) {
  const users = loadData("users");
  users[normalizeJid(jid)] = user;
  saveData("users");
}

export function updateUser(jid, mutator) {
  const key = normalizeJid(jid);
  const users = loadData("users");
  const user = users[key] || createUser(jid);
  const result = mutator(user);
  user.ultimaConexion = now();
  users[key] = user;
  saveData("users");
  return result;
}

export function getAllUsers() {
  return Object.values(loadData("users"));
}

export function getTopUsers(field, limit = 10) {
  return getAllUsers()
    .filter((u) => (u[field] ?? 0) > 0)
    .sort((a, b) => (b[field] ?? 0) - (a[field] ?? 0))
    .slice(0, limit);
}

export function deleteUser(jid) {
  const users = loadData("users");
  const key = normalizeJid(jid);
  if (users[key]) {
    delete users[key];
    saveData("users");
    return true;
  }
  return false;
}

export function normalizeUser(user) {
  const base = createUser(user?.jid || "", user?.nombre);
  return {
    ...base,
    ...user,
    inventario: user?.inventario || {},
    equipo: { ...base.equipo, ...(user?.equipo || {}) },
    misiones: user?.misiones || {},
    diario: { ...base.diario, ...(user?.diario || {}) },
    cooldowns: user?.cooldowns || {},
    historial: Array.isArray(user?.historial) ? user.historial : [],
    personajes: Array.isArray(user?.personajes) ? user.personajes : [],
    titulos: Array.isArray(user?.titulos) && user.titulos.length ? user.titulos : ["novato"],
    rango: getRango(user?.nivel || 1),
  };
}
