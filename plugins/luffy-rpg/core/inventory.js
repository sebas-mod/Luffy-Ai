import { updateUser, getUser } from "./user.js";
import { getItemById } from "./items.js";

export function addItem(jid, itemId, cantidad = 1) {
  return updateUser(jid, (u) => {
    const id = getItemById(itemId)?.id || itemId;
    u.inventario[id] = (u.inventario[id] || 0) + cantidad;
    return u.inventario[id];
  });
}

export function removeItem(jid, itemId, cantidad = 1) {
  return updateUser(jid, (u) => {
    const id = getItemById(itemId)?.id || itemId;
    const actual = u.inventario[id] || 0;
    const restar = Math.min(actual, cantidad);
    u.inventario[id] = actual - restar;
    if (u.inventario[id] <= 0) delete u.inventario[id];
    return restar;
  });
}

export function hasItem(jid, itemId, cantidad = 1) {
  const u = getUser(jid);
  const id = getItemById(itemId)?.id || itemId;
  return (u?.inventario?.[id] || 0) >= cantidad;
}

export function getCantidadItem(jid, itemId) {
  const u = getUser(jid);
  const id = getItemById(itemId)?.id || itemId;
  return u?.inventario?.[id] || 0;
}

export function getInventario(jid) {
  return getUser(jid)?.inventario || {};
}

export function getInventarioDetallado(jid) {
  const inv = getInventario(jid);
  const det = [];
  for (const [id, cant] of Object.entries(inv)) {
    if (cant <= 0) continue;
    const item = getItemById(id);
    det.push({
      id,
      cant,
      item: item || { id, nombre: id, emoji: "📦", precio: 0 },
    });
  }
  return det;
}

export function valorInventario(jid) {
  const inv = getInventarioDetallado(jid);
  return inv.reduce((s, e) => s + (e.item.precio || 0) * e.cant, 0);
}
