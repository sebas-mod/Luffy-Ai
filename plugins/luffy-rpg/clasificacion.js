import { ensureUser, getAllUsers } from "./core/user.js";

const pluginConfig = {
  name: "clasificacion",
  alias: ["ranking_pg", "top_piratas", "clasificacion_pg"],
  category: "rpg",
  description: "🏆 Ver el ranking de piratas",
  usage: ".clasificacion [nivel|berry|personajes]",
  example: ".clasificacion",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 15,
  carne: 0,
  isEnabled: true,
};

function getValor(u, key) {
  if (key === "personajes") return (u.personajes || []).length;
  return u[key] || 0;
}

function handler(m, { sock }) {
  ensureUser(m.sender, m.pushName || "Usuario");
  const args = m.args || [];
  const campo = (args[0] || "nivel").toLowerCase();
  const campoValido = ["nivel", "berry", "berrys", "exp", "personajes", "victorias"];
  if (!campoValido.includes(campo)) {
    return m.reply(`❌ Campo inválido. Usa: *${m.prefix}clasificacion [nivel|berry|personajes|victorias]*`);
  }

  const key = campo === "berrys" ? "berrys" : campo;
  const top = getAllUsers()
    .filter((u) => getValor(u, key) > 0)
    .sort((a, b) => getValor(b, key) - getValor(a, key))
    .slice(0, 10);

  if (top.length === 0) {
    return m.reply(`📭 Todavía no hay datos para este ranking.`);
  }

  const titulos = {
    nivel: "NIVEL",
    berry: "MÁS RICOS",
    berrys: "MÁS RICOS",
    exp: "EXP",
    personajes: "COLECCIÓN",
    victorias: "VICTORIAS",
  };

  let txt = `꧁༺ 🏆 TOP 10 - ${titulos[key] || key.toUpperCase()} ༻꧂\n\n`;

  top.forEach((u, i) => {
    const medalla = ["🥇", "🥈", "🥉"][i] || `${i + 1}.`;
    const valor =
      key === "personajes"
        ? `${u.personajes.length} personajes`
        : key === "victorias"
          ? `${u.victorias || 0} victorias`
          : `${u[key] || 0}`;
    txt += `${medalla} ⚔️ *${u.nombre}* — ${valor}\n`;
  });

  return m.reply(txt);
}

export { pluginConfig as config, handler };
