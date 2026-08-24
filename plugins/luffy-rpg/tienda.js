import { ensureUser } from "./core/user.js";
import { getItems } from "./core/items.js";

const pluginConfig = {
  name: "tienda",
  alias: ["shop", "tienda_pg", "negocio"],
  category: "rpg",
  description: "🛒 Ver la tienda pirata",
  usage: ".tienda [tipo]",
  example: ".tienda",
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
  const args = m.args || [];
  const tipo = args[0]?.toLowerCase();

  let items = getItems();
  if (tipo) {
    const filtrados = items.filter((i) => i.tipo === tipo);
    if (filtrados.length) items = filtrados;
  }

  const grupos = {};
  for (const item of items) {
    if (!grupos[item.tipo]) grupos[item.tipo] = [];
    grupos[item.tipo].push(item);
  }

  const emojis = {
    comida: "🍖",
    pocion: "🧪",
    arma: "⚔️",
    escudo: "🛡️",
    especial: "✨",
    cofre: "📦",
  };

  let txt = `꧁༺ 🛒 TIENDA PIRATA ༻꧂\n\n`;
  txt += `╰┈➤ Compras con tus Berrys. Usa:\n`;
  txt += `› *${m.prefix}comprar_rpg <id> [cantidad]*\n`;
  txt += `› *${m.prefix}vender <id> [cantidad]*\n\n`;

  for (const [tipoKey, itemsList] of Object.entries(grupos)) {
    txt += `━━━ ${emojis[tipoKey] || "📦"} ${tipoKey.toUpperCase()} ━━━\n`;
    for (const item of itemsList) {
      txt += `╰┈➤ ${item.emoji} *${item.nombre}*\n`;
      txt += `   \`${item.id}\` — 💰 ${item.precio} Berrys\n`;
      txt += `   ✦ _${item.descripcion}_\n`;
    }
    txt += `\n`;
  }

  return m.reply(txt);
}

export { pluginConfig as config, handler };
