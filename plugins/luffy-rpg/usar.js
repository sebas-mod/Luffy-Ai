import { ensureUser, getUser, saveUser } from "./core/user.js";
import { getItemById } from "./core/items.js";
import { removeItem, getCantidadItem } from "./core/inventory.js";
import { usarItemEfecto } from "./core/stats.js";
import { clamp } from "./core/utils.js";

const pluginConfig = {
  name: "usar",
  alias: ["usar_pg", "consumir", "use"],
  category: "rpg",
  description: "🧪 Usar o consumir un objeto de tu inventario",
  usage: ".usar <id> [cantidad]",
  example: ".usar carne_asada",
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
      `🧪 *CÓMO USAR OBJETOS*\n\n` +
        `Usa: *${m.prefix}usar <id> [cantidad]*\n\n` +
        `Ejemplo: *${m.prefix}usar carne_asada*\n\n` +
        `Ver tu inventario con *${m.prefix}inventario*.`,
    );
  }

  const item = getItemById(id);
  if (!item) return m.reply(`❌ Objeto \`${id}\` no existe.`);

  const disponible = getCantidadItem(m.sender, id);
  if (disponible <= 0) return m.reply(`❌ No tienes *${item.nombre}* en tu inventario.`);
  if (disponible < cantidad) return m.reply(`❌ Solo tienes *${disponible}* de *${item.nombre}*.`);

  const user = getUser(m.sender);
  const efecto = usarItemEfecto(user, item);

  removeItem(m.sender, id, cantidad);
  user.salud = clamp(user.salud ?? user.saludMax, 0, user.saludMax);
  user.carne = clamp(user.carne ?? user.carneMax, 0, user.carneMax);
  saveUser(m.sender, user);

  let txt = `✅ *OBJETO USADO*\n\n`;
  txt += `${item.emoji} *${item.nombre}* x${cantidad}\n\n`;
  txt += efecto;

  return m.reply(txt);
}

export { pluginConfig as config, handler };
