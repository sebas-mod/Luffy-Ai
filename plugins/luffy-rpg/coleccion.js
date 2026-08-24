import { ensureUser, getUser } from "./core/user.js";
import { getCharacterById, getCharacters } from "./core/characters.js";
import { getStats } from "./core/stats.js";

const pluginConfig = {
  name: "coleccion",
  alias: ["coleccion_pg", "mis_personajes", "deck"],
  category: "rpg",
  description: "⭐ Ver tu colección de personajes",
  usage: ".coleccion",
  example: ".coleccion",
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
  const personajes = user.personajes || [];
  const total = getCharactersCount();

  let txt = `╭━━〔 ⭐ TU COLECCIÓN 〕━━╮\n`;
  txt += `┃ 📊 Completitud: *${personajes.length}/${total}* (${Math.floor((personajes.length / total) * 100)}%)\n`;

  if (personajes.length === 0) {
    txt += `┃\n┃ Aún no coleccionas personajes.\n`;
    txt += `╰┈➤ Tira el gacha con *${m.prefix}personajes*`;
    return m.reply(txt);
  }

  txt += `┃\n`;

  const porRaro = {};
  for (const id of personajes) {
    const c = getCharacterById(id);
    if (!c) continue;
    const r = c.raro || "comun";
    if (!porRaro[r]) porRaro[r] = [];
    porRaro[r].push(c);
  }

  const orden = { legendario: "💎", epico: "🌟", raro: "✨" };
  for (const [raro, lista] of Object.entries(porRaro)) {
    txt += `━━━ ${orden[raro] || "🪙"} ${raro.toUpperCase()} ━━━\n`;
    for (const c of lista) {
      txt += `╰┈➤ ${c.emoji} *${c.nombre}* — ${c.poder} poder\n`;
    }
    txt += `\n`;
  }

  txt += `╰┈➤ Tira más: *${m.prefix}personajes*`;

  return m.reply(txt);
}

function getCharactersCount() {
  return getCharacters().length;
}

export { pluginConfig as config, handler };
