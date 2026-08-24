import { ensureUser, getUser, updateUser } from "./core/user.js";
import { getCharacters, getCharacterById } from "./core/characters.js";
import { removeBerrys, addBerrys, getBerrys } from "./core/economy.js";
import { chance, randomInt } from "./core/utils.js";
import { registrarProgreso } from "./core/missions.js";

const pluginConfig = {
  name: "personajes",
  alias: ["gacha", "solicitar_pirata", "personaje"],
  category: "rpg",
  description: "🎴 Tirar del gacha de personajes",
  usage: ".personajes [listar]",
  example: ".personajes",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  carne: 0,
  isEnabled: true,
};

const PRECIO_TIRO = 500;
const RARIDAD_EMOJI = {
  legendario: "💎",
  epico: "🌟",
  raro: "✨",
};

function getProbabilidades() {
  const r = Math.random() * 100;
  if (r < 5) return "legendario";
  if (r < 20) return "epico";
  return "raro";
}

function handler(m, { sock }) {
  const user = ensureUser(m.sender, m.pushName || "Usuario");
  const args = m.args || [];
  const accion = (args[0] || "tirar").toLowerCase();

  if (accion === "listar") {
    let txt = `╭━━〔 🎴 PERSONAJES DISPONIBLES 〕━━╮\n`;
    const chars = getCharacters();
    for (const c of chars) {
      const raro = RARIDAD_EMOJI[c.raro] || "🪙";
      const poseido = user.personajes.includes(c.id);
      txt += `┃ ${poseido ? "✅" : "⬜"} ${raro} ${c.emoji} *${c.nombre}* — ${c.poder} poder\n`;
    }
    txt += `╰┈➤ Tirar: *${m.prefix}personajes* (${PRECIO_TIRO} Berrys/tiro)`;
    return m.reply(txt);
  }

  if (accion !== "tirar") {
    return m.reply(`Uso: *${m.prefix}personajes [tirar|listar]*`);
  }

  if (getBerrys(m.sender) < PRECIO_TIRO) {
    return m.reply(
      `❌ *SALDO INSUFICIENTE*\n\n` +
        `El gacha cuesta *${PRECIO_TIRO} Berrys*.\n` +
        `> Tu saldo: *${getBerrys(m.sender)} Berrys*\n\n` +
        `Gana Berrys con *${m.prefix}explorar* y *${m.prefix}combate*.`,
    );
  }

  removeBerrys(m.sender, PRECIO_TIRO);

  const raro = getProbabilidades();
  const candidatos = getCharacters().filter((c) => c.raro === raro);
  const personaje = candidatos[randomInt(0, candidatos.length - 1)];
  const repetido = user.personajes.includes(personaje.id);
  const res = updateUser(m.sender, (u) => {
    if (!u.personajes.includes(personaje.id)) {
      u.personajes.push(personaje.id);
    }
    u.gachasTiradas = (u.gachasTiradas || 0) + 1;
    return u;
  });
  registrarProgreso(m.sender, "coleccionar", 1);

  let txt = `꧁༺ 🎴 RESULTADO DEL GACHA ༻꧂\n\n`;
  txt += `${RARIDAD_EMOJI[personaje.raro] || "✨"} ${personaje.emoji} *${personaje.nombre}*\n`;
  txt += `⚔️ Poder: *${personaje.poder}*\n\n`;
  txt += `› _${personaje.descripcion}_\n\n`;
  if (repetido) {
    addBerrys(m.sender, 50);
    txt += `🔁 *¡Ya lo tenías!* Se convirtió en +50 Berrys.\n`;
  } else {
    txt += `🎉 *¡Nuevo personaje coleccionado!*\n`;
  }
  txt += `\n╰┈➤ Ver colección: *${m.prefix}coleccion*`;

  return m.reply(txt);
}

export { pluginConfig as config, handler };
