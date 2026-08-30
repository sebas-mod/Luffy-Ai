import { ensureUser, getUser } from "./core/user.js";
import { getItemById } from "./core/items.js";
import { removeBerrys, getBerrys } from "./core/economy.js";
import { addItem } from "./core/inventory.js";

const pluginConfig = {
  name: "comprar_rpg",
  alias: ["comprar_pg", "adquirir", "buy_rpg"],
  category: "rpg",
  description: "🛒 Comprar un objeto de la tienda",
  usage: ".comprar_rpg <id> [cantidad]",
  example: ".comprar_rpg carne_asada 2",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  carne: 0,
  isEnabled: true,
};

function handler(m, { sock }) {
  const user = ensureUser(m.sender, m.pushName || "Usuario");
  const args = m.args || [];
  const id = args[0]?.toLowerCase();
  const cantidad = Math.min(999, Math.max(1, parseInt(args[1]) || 1));

  if (!id) {
    return m.reply(
      `🛒 *CÓMO COMPRAR*\n\n` +
        `Usa: *${m.prefix}comprar_rpg <id> [cantidad]*\n\n` +
        `Ver los objetos con *${m.prefix}tienda*.\n\n` +
        `Ejemplo: *${m.prefix}comprar_rpg carne_asada 2*`,
    );
  }

  const item = getItemById(id);
  if (!item) return m.reply(`❌ Objeto \`${id}\` no encontrado en la tienda.`);

  const total = item.precio * cantidad;
  const saldo = getBerrys(m.sender);

  if (saldo < total) {
    return m.reply(
      `❌ *SALDO INSUFICIENTE*\n\n` +
        `${item.emoji} *${item.nombre}* x${cantidad}\n` +
        `💰 Precio total: *${total} Berrys*\n` +
        `💵 Tu saldo: *${saldo} Berrys*\n\n` +
        `Gana Berrys con *${m.prefix}explorar* y *${m.prefix}combate*.`,
    );
  }

  removeBerrys(m.sender, total);
  addItem(m.sender, item.id, cantidad);

  return m.reply(
    `☽◯☾ ╭ ♰ 🛒 COMPRA EXITOSA ♰ ━╮ ☽◯☾\n` +
      `┃ ${item.emoji} *${item.nombre}* x${cantidad}\n` +
      `┃ 💰 Pagado: *${total} Berrys*\n` +
      `┃ 💵 Saldo restante: *${getBerrys(m.sender)} Berrys*\n` +
      `☽◯☾ ♰ Revisa tu inventario con *${m.prefix}inventario*`,
  );
}

export { pluginConfig as config, handler };
