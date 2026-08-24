import { ensureUser, getUser } from "./core/user.js";
import { getIslasOrdenadas } from "./core/islands.js";
import { getEnemigosDeIsla } from "./core/combat.js";

const pluginConfig = {
  name: "isla",
  alias: ["islas", "mapa", "isla_pg"],
  category: "rpg",
  description: "🗺️ Ver el mapa de islas y sus enemigos",
  usage: ".isla [id]",
  example: ".isla",
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
  const islas = getIslasOrdenadas();

  const idFiltro = args[0]?.toLowerCase();
  const islaEspecifica = islas.find((i) => i.id === idFiltro || i.nombre.toLowerCase() === idFiltro);

  if (islaEspecifica) {
    const enemigos = getEnemigosDeIsla(islaEspecifica.id);
    let txt = `╭━━〔 🗺️ ${islaEspecifica.emoji} ${islaEspecifica.nombre} 〕━━╮\n`;
    txt += `┃ _${islaEspecifica.descripcion}_\n`;
    txt += `┃\n`;
    txt += `┃ 🎯 *Nivel mínimo:* ${islaEspecifica.nivelMin}\n`;
    txt += `┃ 👾 *Enemigos:* ${enemigos.length}\n`;
    txt += `┃\n`;
    txt += enemigos.map((e) => `┃ › ${e.emoji} ${e.nombre} (Nv. ${e.nivel})`).join("\n") + `\n`;
    txt += `╰┈➤ Pelea con *${m.prefix}combate* o viaja aquí con *${m.prefix}viajar ${islaEspecifica.id}*`;
    return m.reply(txt);
  }

  let txt = `꧁༺ 🗺️ GRAND LINE - MAPA DE ISLAS ༻꧂\n\n`;
  txt += `⚓ Estás en: *${getUser(m.sender)?.islaId || "?"}*\n\n`;

  for (const isla of islas) {
    const desbloqueada = user.nivel >= isla.nivelMin;
    txt += `${desbloqueada ? isla.emoji : "🔒"} ⚑ *${isla.nombre}*\n`;
    txt += `   \`${isla.id}\` · Nv. ${isla.nivelMin} · ${isla.enemigos.length} enemigos\n`;
    if (!desbloqueada) txt += `   ✦ _Requiere nivel ${isla.nivelMin}_\n`;
  }

  txt += `\n╰┈➤ Detalle: *${m.prefix}isla <id>*\n`;
  txt += `╰┈➤ Viajar: *${m.prefix}viajar <id>*`;
  return m.reply(txt);
}

export { pluginConfig as config, handler };
