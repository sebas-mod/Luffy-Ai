import { ensureUser } from "./core/user.js";
import { getItemById } from "./core/items.js";
import { addBerrys, getBerrys } from "./core/economy.js";
import { removeItem, getCantidadItem } from "./core/inventory.js";

const pluginConfig = {
  name: "vender",
  alias: ["vender_pg", "venda", "sell"],
  category: "rpg",
  description: "💰 Vender objetos de tu inventario",
  usage: ".vender <id> [cantidad]",
  example: ".vender carne_asada 2",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  carne: 0,
  isEnabled: true,
};

function handler(m, { sock }) {
  ensureUser(m.sender, m.pushName || "Usuario");
  const args = m.args || [];
  const id = args[0]?.toLowerCase();
  const cantidad = Math.min(999, Math.max(1, parseInt(args[1]) || 1));

  if (!id) {
    return m.reply(
      `💰 *CÓMO VENDER*\n\n` +
        `Usa: *${m.prefix}vender <id> [cantidad]*\n\n` +
        `Los objetos se venden al *50%* de su precio.\n\n` +
        `Ver tu inventario con *${m.prefix}inventario*.`,
    );
  }

  const item = getItemById(id);
  const disponible = getCantidadItem(m.sender, id);

  if (!item) return m.reply(`❌ Objeto \`${id}\` no existe.`);
  if (disponible <= 0) return m.reply(`❌ No tienes *${item.nombre}* en tu inventario.`);
  if (disponible < cantidad) {
    return m.reply(`❌ Solo tienes *${disponible}* de *${item.nombre}*.`);
  }

  const precioVenta = Math.floor(item.precio / 2);
  const total = precioVenta * cantidad;

  removeItem(m.sender, item.id, cantidad);
  addBerrys(m.sender, total);

  return m.reply(
    `☽◯☾ ╭ ♰ 💰 VENTA EXITOSA ♰ ━╮ ☽◯☾\n` +
      `┃ ${item.emoji} *${item.nombre}* x${cantidad}\n` +
      `┃ 💵 Ganado: *${total} Berrys*\n` +
      `┃ 💵 Saldo: *${getBerrys(m.sender)} Berrys*\n` +
      `╰━ ⊱༺༒༻⊰ ━╯`,
  );
}

export { pluginConfig as config, handler };
