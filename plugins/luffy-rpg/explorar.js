import { ensureUser, getUser, updateUser } from "./core/user.js";
import { getIslaById } from "./core/islands.js";
import { getStats } from "./core/stats.js";
import { addExp } from "./core/level.js";
import { addBerrys } from "./core/economy.js";
import { removeCarne, hasCarne } from "./core/energy.js";
import { addItem } from "./core/inventory.js";
import { getRemaining, setCooldown, formatCooldown } from "./core/cooldown.js";
import { randomInt, chance } from "./core/utils.js";
import { registrarProgreso } from "./core/missions.js";

const pluginConfig = {
  name: "explorar",
  alias: ["explorar_pg", "aventura"],
  category: "rpg",
  description: "🧭 Explorar tu isla en busca de aventuras",
  usage: ".explorar",
  example: ".explorar",
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

  const remaining = getRemaining(m.sender, "explorar", 300);
  if (remaining > 0) {
    return m.reply(
      `⏳ *Descansando tras explorar...*\n\n` +
        `> Podrás explorar de nuevo en *${formatCooldown(remaining)}*.`,
    );
  }

  const user = getUser(m.sender);
  const isla = getIslaById(user.islaId);
  if (!isla) return m.reply(`❌ No estás en una isla válida.`);

  if (!hasCarne(m.sender, 10)) {
    return m.reply(
      `🍖 *SIN ENERGÍA*\n\n` +
        `Explorar consume 10 de Carne.\n\n` +
        `> Come algo con *${m.prefix}usar carne_asada*\n` +
        `> O reclama tu *${m.prefix}diario*.`,
    );
  }

  removeCarne(m.sender, 10);
  setCooldown(m.sender, "explorar");

  const roll = randomInt(1, 100);
  let txt = `☽◯☾ ╭ ♰ 🌊 AVENTURA ♰ ━╮ ☽◯☾\n`;
  txt += `┃ 🧭 *EXPLORANDO ${isla.emoji} ${isla.nombre}*\n`;
  txt += `┃\n`;

  if (roll <= 45) {
    const tesoro = randomInt(1, 3);
    const berrys = 50 + user.nivel * 15;
    addBerrys(m.sender, berrys);
    registrarProgreso(m.sender, "recoger", tesoro);
    txt += `┃ 💰 *¡Encontraste un tesoro!*\n`;
    txt += `┃ +${berrys} Berrys\n`;
    if (chance(30)) {
      const drop = isla.tesoros[randomInt(0, isla.tesoros.length - 1)];
      addItem(m.sender, drop, 1);
      txt += `┃ 🎁 ¡Botín extra! Obtuviste un cofre: \`${drop}\`\n`;
    }
    txt += `┃\n`;
  } else if (roll <= 75) {
    const enemigo = randomInt(1, 3);
    const exp = 20 + user.nivel * 5;
    const res = addExp(m.sender, exp);
    registrarProgreso(m.sender, "derrotar", 0);
    txt += `┃ ⚔️ *¡Te enfrentaste a un enemigo!*\n`;
    txt += `┃ +${exp} EXP\n`;
    if (res.subio) txt += `┃ 👑 *¡Subiste de nivel! Ahora eres nivel ${res.nivel}!*\n`;
    txt += `┃\n`;
  } else {
    const res = addExp(m.sender, 15 + user.nivel * 4);
    txt += `┃ 🧘 *Entrenaste contra muñecos de paja*\n`;
    txt += `┃ +${15 + user.nivel * 4} EXP\n`;
    if (res.subio) txt += `┃ 👑 *¡Subiste de nivel! Ahora eres nivel ${res.nivel}!*\n`;
    txt += `┃\n`;
  }

  txt += `☽◯☾ ♰ 💡 Ve a pelear con *${m.prefix}combate* o cambia de isla con *${m.prefix}viajar*.`;

  return m.reply(txt);
}

export { pluginConfig as config, handler };
