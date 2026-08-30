import { ensureUser, getUser, updateUser } from "./core/user.js";
import { loadData } from "./core/database.js";
import { removeBerrys, getBerrys } from "./core/economy.js";

const pluginConfig = {
  name: "haki",
  alias: ["hakis", "despertar_haki"],
  category: "rpg",
  description: "🌊 Despertar o ver tu Haki",
  usage: ".haki [despertar <id>|listar]",
  example: ".haki listar",
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
  const hakis = loadData("hakis") || [];

  if (accion === "listar") {
    let txt = `꧁༺ 🌊 HAKI ༻꧂\n\n`;
    txt += `_El Haki es la voluntad latente en todo ser vivo._\n\n`;
    for (const h of hakis) {
      const nivel = h.nivelMin || 20;
      txt += `${h.emoji} ⚡ *${h.nombre}*\n`;
      txt += `   \`${h.id}\` · Requiere Nv. ${nivel} · 💰 ${h.precio}\n`;
      txt += `   ✦ _${h.efecto}_\n`;
    }
    txt += `\n☽◯☾ ♰ Despertar: *${m.prefix}haki despertar <id>*\n`;
    txt += `☽◯☾ ♰ Tu nivel: *${user.nivel}*`;
    return m.reply(txt);
  }

  if (accion === "despertar") {
    const id = args[1];
    if (!id) return m.reply(`Usa: *${m.prefix}haki despertar <id>*`);
    const h = hakis.find((x) => x.id === id);
    if (!h) return m.reply(`❌ Haki \`${id}\` no encontrado.`);

    if (user.nivel < (h.nivelMin || 20)) {
      return m.reply(
        `🔒 *REQUISITOS NO CUMPLIDOS*\n\n` +
          `${h.emoji} *${h.nombre}* requiere nivel *${h.nivelMin}*.\n` +
          `> Tu nivel: *${user.nivel}*`,
      );
    }

    if (user.equipo?.haki) {
      const actual = hakis.find((x) => x.id === user.equipo.haki);
      return m.reply(`🌊 Ya tienes despertado *${actual?.nombre || user.equipo.haki}*.`);
    }

    if (getBerrys(m.sender) < h.precio) {
      return m.reply(`❌ No tienes ${h.precio} Berrys para despertar este Haki.`);
    }

    removeBerrys(m.sender, h.precio);
    updateUser(m.sender, (u) => {
      if (!u.equipo) u.equipo = {};
      u.equipo.haki = h.id;
      return u;
    });

    let txt = `꧁༺ 🌊 HAKI DESPERTADO ༻꧂\n\n`;
    txt += `${h.emoji} *${h.nombre}*\n\n`;
    txt += `✦ _${h.efecto}_\n\n`;
    txt += `💵 Pagado: *${h.precio} Berrys*`;
    return m.reply(txt);
  }

  return m.reply(`Uso: *${m.prefix}haki [listar|despertar <id>]*`);
}

export { pluginConfig as config, handler };
