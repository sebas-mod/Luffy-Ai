import { ensureUser, getUser } from "./core/user.js";
import { getStats } from "./core/stats.js";
import { addExp } from "./core/level.js";
import { removeCarne, hasCarne } from "./core/energy.js";
import { getRemaining, setCooldown, formatCooldown } from "./core/cooldown.js";
import { registrarProgreso } from "./core/missions.js";

const pluginConfig = {
  name: "entrenar",
  alias: ["entrenamiento", "train", "ejercitar"],
  category: "rpg",
  description: "💪 Entrenar para ganar EXP y fuerza",
  usage: ".entrenar",
  example: ".entrenar",
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

  const remaining = getRemaining(m.sender, "entrenar", 120);
  if (remaining > 0) {
    return m.reply(
      `😮‍💨 *Descansando del entrenamiento...*\n\n` +
        `> Podrás entrenar en *${formatCooldown(remaining)}*.`,
    );
  }

  if (!hasCarne(m.sender, 15)) {
    return m.reply(
      `🍖 *SIN ENERGÍA*\n\n` +
        `Entrenar consume *15* de Carne.\n\n` +
        `> Come con *${m.prefix}usar carne_asada* o reclama tu *${m.prefix}diario*.`,
    );
  }

  removeCarne(m.sender, 15);
  setCooldown(m.sender, "entrenar");

  const user = getUser(m.sender);
  const exp = 40 + user.nivel * 8;
  const res = addExp(m.sender, exp);
  registrarProgreso(m.sender, "entrenar", 1);

  let txt = `꧁༺ 💪 ENTRENAMIENTO ༻꧂\n\n`;
  txt += `☽◯☾ ♰ Sudaste pero valió la pena!\n\n`;
  txt += `✦ ✨ *EXP:* +${exp}\n`;
  if (res.subio) txt += `👑 *¡SUBISTE DE NIVEL! Ahora eres nivel ${res.nivel}!*\n`;

  const stats = getStats(getUser(m.sender));
  txt += `\n⚔️ *Ataque:* ${stats.ataque}\n`;
  txt += `🛡️ *Defensa:* ${stats.defensa}\n`;
  txt += `💨 *Velocidad:* ${stats.velocidad}\n`;
  txt += `\n☽◯☾ ♰ Sigue con *${m.prefix}explorar* o *${m.prefix}combate*.`;

  return m.reply(txt);
}

export { pluginConfig as config, handler };
