import { ensureUser, getUser, updateUser } from "./core/user.js";
import { addBerrys } from "./core/economy.js";
import { addCarne } from "./core/energy.js";
import { addExp } from "./core/level.js";
import { addItem } from "./core/inventory.js";
import { isOnCooldown, getRemaining, setCooldown, formatCooldown } from "./core/cooldown.js";
import { now } from "./core/utils.js";

const pluginConfig = {
  name: "diario",
  alias: ["recompensa_diaria", "daily_pg", "reclamar_diario"],
  category: "rpg",
  description: "🎁 Reclamar tu recompensa diaria de pirata",
  usage: ".diario",
  example: ".diario",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  carne: 0,
  isEnabled: true,
};

const DIA_MS = 24 * 60 * 60 * 1000;

function handler(m, { sock }) {
  ensureUser(m.sender, m.pushName || "Usuario");

  const remaining = getRemaining(m.sender, "diario", 86400);
  if (remaining > 0) {
    return m.reply(
      `⏳ *Espera un momento*\n\n` +
        `Ya reclamaste tu recompensa diaria hoy.\n\n` +
        `> Vuelve en *${formatCooldown(remaining)}*.`,
    );
  }

  const user = getUser(m.sender);
  const rachaAnterior = user.diario?.racha || 0;
  const ayer = new Date(Date.now() - DIA_MS).toDateString();
  const racha = user.diario?.ultimoDia === ayer ? rachaAnterior + 1 : 1;

  const baseBerry = 200 + (user.nivel - 1) * 50;
  const bonusRacha = Math.min(500, racha * 50);
  const carne = 50;
  const exp = 100;

  addBerrys(m.sender, baseBerry + bonusRacha);
  addCarne(m.sender, carne);
  addExp(m.sender, exp);
  addItem(m.sender, "carne_asada", 1);

  setCooldown(m.sender, "diario");
  updateUser(m.sender, (u) => {
    u.diario = {
      ultimoDia: new Date().toDateString(),
      racha,
      totalReclamado: (u.diario?.totalReclamado || 0) + 1,
    };
    return u;
  });

  let txt = `☽◯☾ ╭ ♰ 🎁 RECOMPENSA DIARIA ♰ ━╮ ☽◯☾\n`;
  txt += `┃ 📆 *Racha:* ${racha} día(s) ${racha > 1 ? "🔥" : ""}\n`;
  txt += `┃\n`;
  txt += `┃ 💰 *Berrys:* +${baseBerry}\n`;
  txt += `┃ 🍖 *Carne:* +${carne}\n`;
  txt += `┃ ✨ *EXP:* +${exp}\n`;
  txt += `┃ 🍖 *Objeto:* 1x Carne Asada\n`;
  if (bonusRacha > 0) txt += `┃ 🎉 *Bonus de racha:* +${bonusRacha} Berrys\n`;
  txt += `┃\n`;
  txt += `☽◯☾ ♰ ¡Vuelve mañana para mantener tu racha! ⚡`;

  return m.reply(txt);
}

export { pluginConfig as config, handler };
