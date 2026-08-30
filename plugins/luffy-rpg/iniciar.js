import { ensureUser, getUser } from "./core/user.js";
import { addItem } from "./core/inventory.js";
import { addCarne } from "./core/energy.js";
import { FORMULAS } from "./core/config.js";

const pluginConfig = {
  name: "iniciar",
  alias: ["iniciar_pg", "nueva_aventura", "start_rpg"],
  category: "rpg",
  description: "🛶 Iniciar tu aventura como pirata",
  usage: ".iniciar",
  example: ".iniciar",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  carne: 0,
  isEnabled: true,
};

function handler(m, { sock }) {
  const existente = getUser(m.sender);
  if (existente) {
    return m.reply(
      `🏴‍☠️ *YA ERES UN PIRATA*\n\n` +
        `Ya tienes una aventura en curso, ${existente.nombre}!\n\n` +
        `> Nivel: *${existente.nivel}*\n` +
        `> Berrys: *${existente.berrys}*\n` +
        `> Escribe *${m.prefix}perfil* para ver tu ficha.`,
    );
  }

  const nombre = m.pushName || m.sender.split("@")[0];
  const user = ensureUser(m.sender, nombre);

  addItem(m.sender, "carne_asada", 3);
  addCarne(m.sender, 0);

  let txt = `╭━━━🏴‍☠️━━━╮\n`;
  txt += `⛵ *¡BIENVENIDO A LA GRAN ERA DE LOS PIRATAS!*\n`;
  txt += `╰━ ⊱༺༒༻⊰ ━╯\n\n`;
  txt += `⚓ ¡${nombre}! Has decidido zarpar hacia la aventura.\n\n`;
  txt += `👤 *Nombre:* ${user.nombre}\n`;
  txt += `🎗️ *Rango:* Pirata Novato\n`;
  txt += `📊 *Nivel:* 1\n`;
  txt += `💰 *Berrys:* ${user.berrys}\n`;
  txt += `🍖 *Carne:* ${user.carne}/${FORMULAS.carneMax(1)}\n\n`;
  txt += `🎁 *Regalo de inicio:* 3x Carne Asada 🍖\n\n`;
  txt += `🧭 ¿Qué sigue?\n`;
  txt += `• *${m.prefix}perfil* — Ver tu ficha de pirata\n`;
  txt += `• *${m.prefix}explorar* — Buscar aventuras en tu isla\n`;
  txt += `• *${m.prefix}tienda* — Comprar suministros\n`;
  txt += `• *${m.prefix}ayudarpg* — Ver todos los comandos RPG`;

  m.react("⛵").catch(() => {});
  return m.reply(txt);
}

export { pluginConfig as config, handler };
