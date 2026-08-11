import { ensureUser, getUser, updateUser } from "./core/user.js";
import { loadData } from "./core/database.js";
import { getStats } from "./core/stats.js";
import { removeBerrys, getBerrys } from "./core/economy.js";

const pluginConfig = {
  name: "barco",
  alias: ["barcos", "navio", "ship"],
  category: "rpg",
  description: "🚢 Comprar o ver tu barco",
  usage: ".barco [comprar <id>|listar]",
  example: ".barco listar",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  carne: 0,
  isEnabled: true,
};

function handler(m, { sock }) {
  const user = ensureUser(m.sender, m.pushName || "Usuario");
  const args = m.args || [];
  const accion = (args[0] || "listar").toLowerCase();
  const barcos = loadData("ships") || [];

  if (accion === "listar") {
    let txt = `🚢 *BARCOS*\n\n`;
    const actual = user.equipo?.barco;
    for (const b of barcos) {
      const esActual = actual === b.id;
      txt += `${esActual ? "✅" : "⬜"} ${b.emoji} *${b.nombre}*\n`;
      txt += `   \`${b.id}\` · 💰 ${b.precio} Berrys\n`;
      txt += `   🛡️ +${b.defensa} DEF · ❤️ +${b.saludBonus} Salud · 💨 +${b.velocidad} VEL\n`;
      txt += `   _${b.descripcion}_\n`;
    }
    txt += `\n> Comprar: *${m.prefix}barco comprar <id>*`;
    return m.reply(txt);
  }

  if (accion === "comprar") {
    const id = args[1];
    if (!id) return m.reply(`Usa: *${m.prefix}barco comprar <id>*`);
    const barco = barcos.find((b) => b.id === id);
    if (!barco) return m.reply(`❌ Barco \`${id}\` no existe.`);

    if (user.equipo?.barco === barco.id) {
      return m.reply(`⛵ Ya tienes el *${barco.nombre}* equipado.`);
    }

    if (getBerrys(m.sender) < barco.precio) {
      return m.reply(
        `❌ *SALDO INSUFICIENTE*\n\n` +
          `${barco.emoji} *${barco.nombre}* cuesta *${barco.precio} Berrys*.\n` +
          `> Tu saldo: *${getBerrys(m.sender)} Berrys*`,
      );
    }

    removeBerrys(m.sender, barco.precio);
    updateUser(m.sender, (u) => {
      if (!u.equipo) u.equipo = {};
      u.equipo.barco = barco.id;
      return u;
    });

    const stats = getStats(getUser(m.sender));
    return m.reply(
      `🚢 *¡BARCO ADQUIRIDO!*\n\n` +
        `${barco.emoji} *${barco.nombre}*\n` +
        `_${barco.descripcion}_\n\n` +
        `🛡️ *Tu defensa:* ${stats.defensa}\n` +
        `❤️ *Tu salud máx:* ${stats.saludMax}\n\n` +
        `¡Navega con *${m.prefix}viajar*!`,
    );
  }

  return m.reply(`Uso: *${m.prefix}barco [listar|comprar <id>]*`);
}

export { pluginConfig as config, handler };
