export const RPG = {
  VERSION_DATOS: 1,
  NOMBRE: "Luffy RPG",
};

export const RANGOS = [
  { nivel: 1, nombre: "Pirata Novato" },
  { nivel: 10, nombre: "Pirata" },
  { nivel: 25, nombre: "Corsario" },
  { nivel: 50, nombre: "Supernova" },
  { nivel: 80, nombre: "Shichibukai" },
  { nivel: 120, nombre: "Emperador" },
];

export const TITULOS = [
  { id: "novato", nombre: "Novato", desc: "Título inicial" },
  { id: "gloton", nombre: "Glotón", desc: "Gana 1000 Carne en total" },
  { id: "recolector", nombre: "Recolector", desc: "Gana 5000 Berrys en total" },
  { id: "cazador", nombre: "Cazador", desc: "Derrota 50 enemigos" },
  { id: "explorador", nombre: "Explorador", desc: "Visita 5 islas" },
  { id: "guerrero", nombre: "Guerrero", desc: "Alcanza 200 de ataque" },
  { id: "muro", nombre: "Muro de Acero", desc: "Alcanza 200 de defensa" },
  { id: "rico", nombre: "Rico", desc: "Acumula 100000 Berrys" },
  { id: "leyenda", nombre: "Leyenda", desc: "Alcanza el nivel 100" },
];

export const FORMULAS = {
  expSiguiente(nivel) {
    return Math.floor(100 * Math.pow(nivel, 1.4));
  },
  carneMax(nivel) {
    return 100 + (nivel - 1) * 10;
  },
  saludMax(nivel) {
    return 100 + (nivel - 1) * 15;
  },
  ataqueBase(nivel) {
    return 10 + (nivel - 1) * 3;
  },
  defensaBase(nivel) {
    return 5 + (nivel - 1) * 2;
  },
};

export function getRango(nivel) {
  let rango = RANGOS[0].nombre;
  for (const r of RANGOS) {
    if (nivel >= r.nivel) rango = r.nombre;
  }
  return rango;
}

export function getProximoRango(nivel) {
  for (const r of RANGOS) {
    if (nivel < r.nivel) return r;
  }
  return null;
}

export function getTituloById(id) {
  return TITULOS.find((t) => t.id === id) || null;
}
