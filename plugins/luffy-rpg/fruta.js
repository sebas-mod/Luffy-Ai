import { ensureUser, getUser, updateUser } from "./core/user.js";
import { getFrutas, getFrutaById } from "./core/fruits.js";
import { removeBerrys, getBerrys } from "./core/economy.js";

const pluginConfig = {
  name: "fruta",
  alias: ["frutas", "fruta_diablo", "akuma"],
  category: "rpg",
  description: "🍎 Comer o ver Frutas del Diablo",
  usage: ".fruta [comer <id>|listar|info <id>]",
  example: ".fruta listar",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  carne: 0,
  isEnabled: true,
};

const RARIDAD_EMOJI = {
  legendario: "💎",
  epico: "🌟",
  raro: "✨",
  comun: "🪙",
};

function handler(m, { sock }) {
  const user = ensureUser(m.sender, m.pushName || "Usuario");
  const args = m.args || [];
  const accion = (args[0] || "listar").toLowerCase();

  if (accion === "listar") {
    let txt = `🍎 *FRUTAS DEL DIABLO*\n\n`;
    for (const fruta of getFrutas()) {
      const raro = RARIDAD_EMOJI[fruta.raro] || "🪙";
      txt += `${raro} ${fruta.emoji} *${fruta.nombre}*\n`;
      txt += `   \`${fruta.id}\` · ${fruta.tipo} · 💰 ${fruta.precio}\n`;
    }
    txt += `\n> Comer: *${m.prefix}fruta comer <id>* (la fruta se consume)\n`;
    txt += `> Info: *${m.prefix}fruta info <id>*`;
    return m.reply(txt);
  }

  if (accion === "info") {
    const fruta = getFrutaById(args[1]);
    if (!fruta) return m.reply(`❌ Fruta \`${args[1]}\` no encontrada.`);
    let txt = `꧁༺ 🍎 FRUTA DEL DIABLO ༻꧂\n\n`;
    txt += `${RARIDAD_EMOJI[fruta.raro] || "🪙"} ${fruta.emoji} *${fruta.nombre}*\n\n`;
    txt += `› _${fruta.descripcion}_\n\n`;
    txt += `🪶 Tipo: *${fruta.tipo}*\n`;
    txt += `⚔️ Ataque: *+${fruta.ataque || 0}*\n`;
    txt += `💨 Velocidad: *+${fruta.velocidad || 0}*\n`;
    txt += `💰 Precio: *${fruta.precio} Berrys*\n\n`;
    txt += `☽◯☾ ♰ Para comerla: *${m.prefix}fruta comer ${fruta.id}*`;
    return m.reply(txt);
  }

  if (accion === "comer") {
    const id = args[1];
    if (!id) return m.reply(`Usa: *${m.prefix}fruta comer <id>*`);
    const fruta = getFrutaById(id);
    if (!fruta) return m.reply(`❌ Fruta \`${id}\` no encontrada.`);

    if (user.equipo?.fruta) {
      const actual = getFrutaById(user.equipo.fruta);
      return m.reply(
        `🍎 *YA TIENES UNA FRUTA*\n\n` +
          `Estás vinculado a *${actual?.nombre || user.equipo.fruta}*.\n` +
          `Solo puedes tener una Fruta del Diablo equipada.`,
      );
    }

    if (getBerrys(m.sender) < fruta.precio) {
      return m.reply(`❌ No tienes ${fruta.precio} Berrys para comprar esta fruta.`);
    }

    removeBerrys(m.sender, fruta.precio);
    updateUser(m.sender, (u) => {
      if (!u.equipo) u.equipo = {};
      u.equipo.fruta = fruta.id;
      return u;
    });

    let txt = `╭━━━🍎━━━╮\n`;
    txt += `🍎 *¡COMISTE LA FRUTA DEL DIABLO!*\n`;
    txt += `${RARIDAD_EMOJI[fruta.raro] || "🪙"} ${fruta.emoji} *${fruta.nombre}*\n\n`;
    txt += `› _${fruta.descripcion}_\n\n`;
    txt += `⚔️ *Ataque:* +${fruta.ataque || 0}\n`;
    txt += `💨 *Velocidad:* +${fruta.velocidad || 0}\n\n`;
    txt += `⚠️ *No puedes comer otra fruta.*\n`;
    txt += `╰━ ⊱༺༒༻⊰ ━╯`;
    return m.reply(txt);
  }

  return m.reply(`Uso: *${m.prefix}fruta [listar|comer <id>|info <id>]*`);
}

export { pluginConfig as config, handler };
