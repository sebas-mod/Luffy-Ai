import { ensureUser } from "./core/user.js";
import { getItemById } from "./core/items.js";
import { getInventarioDetallado, getCantidadItem, removeItem } from "./core/inventory.js";
import { usarItemEfecto } from "./core/stats.js";
import { saveUser, getUser } from "./core/user.js";

const pluginConfig = {
  name: "inventario",
  alias: ["inv", "mochila", "bolsa"],
  category: "rpg",
  description: "🎒 Ver tu inventario de objetos",
  usage: ".inventario",
  example: ".inventario",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  carne: 0,
  isEnabled: true,
};

function handler(m, { sock }) {
  ensureUser(m.sender, m.pushName || "Usuario");
  const det = getInventarioDetallado(m.sender);

  let txt = `☽◯☾ ╭ ♰ 🎒 INVENTARIO ♰ ━╮ ☽◯☾\n`;

  if (det.length === 0) {
    txt += `┃ Tu mochila está vacía.\n┃\n`;
    txt += `┃ › Compra objetos con *${m.prefix}tienda*.\n`;
    txt += `┃ › Usa *${m.prefix}usar <id>* para consumir.\n`;
    txt += `╰━ ⊱༺༒༻⊰ ━╯`;
    return m.reply(txt);
  }

  for (const { id, cant, item } of det) {
    txt += `┃ ${item.emoji} *${item.nombre}* — \`${cant}\`\n`;
    txt += `┃    \`${id}\` · ${item.tipo}\n`;
  }

  txt += `☽◯☾ ♰ 💡 Usa *${m.prefix}usar <id>* para consumir objetos.`;
  return m.reply(txt);
}

export { pluginConfig as config, handler };
