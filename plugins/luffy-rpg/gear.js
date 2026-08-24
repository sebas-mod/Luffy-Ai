import { ensureUser, getUser, updateUser } from "./core/user.js";
import { getStats } from "./core/stats.js";
import { getRemaining, setCooldown, formatCooldown } from "./core/cooldown.js";
import { addExp } from "./core/level.js";
import { removeCarne, hasCarne } from "./core/energy.js";

const pluginConfig = {
  name: "gear",
  alias: ["gears", "gear_pg"],
  category: "rpg",
  description: "💥 Activar tu Gear de combate",
  usage: ".gear [activar <gear>|listar]",
  example: ".gear listar",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  carne: 0,
  isEnabled: true,
};

const GEARS = [
  { id: "gear2", nombre: "Gear 2", nivel: 20, ataque: 30, desc: "Bombea sangre a máxima velocidad. +30 ATK." },
  { id: "gear3", nombre: "Gear 3", nivel: 35, ataque: 60, desc: "Gigante por unos instantes. +60 ATK." },
  { id: "gear4", nombre: "Gear 4", nivel: 50, ataque: 100, desc: "Forma Bounce Man. +100 ATK." },
  { id: "gear5", nombre: "Gear 5", nivel: 80, ataque: 180, desc: "La forma del Dios del Sol Nika. +180 ATK." },
];

function handler(m, { sock }) {
  const user = ensureUser(m.sender, m.pushName || "Usuario");
  const args = m.args || [];
  const accion = (args[0] || "listar").toLowerCase();

  if (accion === "listar") {
    let txt = `💥 *GEARS*\n\n`;
    txt += `Dominar los Gears requiere estar vinculado a la Gomu Gomu no Mi.\n\n`;
    for (const g of GEARS) {
      const desbloqueado = user.nivel >= g.nivel && user.equipo?.fruta === "gomu_gomu";
      const activo = user.equipo?.gear === g.id;
      txt += `${activo ? "✅" : desbloqueado ? "🔓" : "🔒"} *${g.nombre}*\n`;
      txt += `   \`${g.id}\` · Requiere Nv. ${g.nivel} ${user.equipo?.fruta === "gomu_gomu" ? "" : "· Fruta Gomu Gomu"}\n`;
      txt += `   _${g.desc}_\n`;
      if (activo) txt += `   _⚡ Activado actualmente_\n`;
    }
    txt += `\n> Activar: *${m.prefix}gear activar <gear>*`;
    return m.reply(txt);
  }

  if (accion === "activar") {
    const id = args[1];
    if (!id) return m.reply(`Usa: *${m.prefix}gear activar <id>*`);
    const gear = GEARS.find((g) => g.id === id);
    if (!gear) return m.reply(`❌ Gear \`${id}\` no existe.`);

    if (user.equipo?.fruta !== "gomu_gomu") {
      return m.reply(
        `🍅 *REQUIERE GOMU GOMU NO MI*\n\n` +
          `Solo los usuarios vinculados a la Gomu Gomu no Mi pueden usar Gears.\n\n` +
          `> Cómprala y cómela con *${m.prefix}fruta comer gomu_gomu*`,
      );
    }

    if (user.nivel < gear.nivel) {
      return m.reply(
        `🔒 *NIVEL INSUFICIENTE*\n\n` +
          `*${gear.nombre}* requiere nivel *${gear.nivel}*.\n` +
          `> Tu nivel: *${user.nivel}*`,
      );
    }

    const remaining = getRemaining(m.sender, "gear", 3600);
    if (remaining > 0) {
      return m.reply(
        `⏳ *Gear recargándose...*\n\n` +
          `> Podrás cambiar de Gear en *${formatCooldown(remaining)}*.`,
      );
    }

    if (!hasCarne(m.sender, 30)) {
      return m.reply(`🍖 *SIN ENERGÍA*\n\nActivar un Gear consume 30 de Carne.`);
    }

    removeCarne(m.sender, 30);
    setCooldown(m.sender, "gear");

    updateUser(m.sender, (u) => {
      if (!u.equipo) u.equipo = {};
      u.equipo.gear = gear.id;
      return u;
    });

    const stats = getStats(getUser(m.sender));
    return m.reply(
      `꧁༺ 💥 GEAR ACTIVADO ༻꧂\n\n` +
        `⚡ ${gear.nombre}\n✦ _${gear.desc}_\n\n` +
        `⚔️ *Tu ataque ahora es:* ${stats.ataque}\n` +
        `⏳ Cooldown de cambio: 1 hora`,
    );
  }

  return m.reply(`Uso: *${m.prefix}gear [listar|activar <id>]*`);
}

export { pluginConfig as config, handler };
