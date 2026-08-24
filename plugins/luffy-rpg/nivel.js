import { getUser } from "./core/user.js";
import { getStats } from "./core/stats.js";
import { levelInfo } from "./core/level.js";
import { getProximoRango, getRango } from "./core/config.js";

const pluginConfig = {
  name: "nivel",
  alias: ["nivel_pg", "mi_nivel", "rpg_nivel"],
  category: "rpg",
  description: "📊 Ver tu nivel y progreso de EXP",
  usage: ".nivel",
  example: ".nivel",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  carne: 0,
  isEnabled: true,
};

function handler(m, { sock }) {
  const user = getUser(m.sender);
  if (!user) {
    return m.reply(`❌ Aún no eres pirata. Escribe *${m.prefix}iniciar* para comenzar.`);
  }

  const info = levelInfo(user);
  const s = getStats(user);
  const progreso = Math.min(100, Math.floor((info.exp / info.expSiguiente) * 100));

  let txt = `꧁༺ 📊 PROGRESO DE PIRATA ༻꧂\n\n`;
  txt += `🎗️ *Rango:* ${info.rango}\n`;
  txt += `⬆️ *Nivel:* ${info.nivel}\n\n`;
  txt += `✨ *EXP:* ${info.exp} / ${info.expSiguiente}\n`;
  txt += `▰`.repeat(Math.floor(progreso / 10)) + `▱`.repeat(10 - Math.floor(progreso / 10)) + ` ${progreso}%\n\n`;

  if (info.proximoRango) {
    txt += `🎯 *Próximo rango:* ${info.proximoRango.nombre}\n`;
    txt += `   Faltan *${info.proximoRango.nivel - info.nivel}* niveles.\n\n`;
  } else {
    txt += `👑 *Has alcanzado el rango máximo!*\n\n`;
  }

  txt += `⚔️ *Ataque:* ${s.ataque}\n`;
  txt += `🛡️ *Defensa:* ${s.defensa}\n`;
  txt += `❤️ *Salud:* ${s.salud}/${s.saludMax}\n`;

  txt += `\n╰┈➤ 💡 Gana EXP con *${m.prefix}explorar*, *${m.prefix}combate* y *${m.prefix}entrenar*.`;

  return m.reply(txt);
}

export { pluginConfig as config, handler };
