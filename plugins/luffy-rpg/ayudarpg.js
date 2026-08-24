const pluginConfig = {
  name: "ayudarpg",
  alias: ["help_rpg", "rpg_help", "ayuda_pg"],
  category: "rpg",
  description: "📖 Guía completa del sistema RPG",
  usage: ".ayudarpg",
  example: ".ayudarpg",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  carne: 0,
  isEnabled: true,
};

function handler(m, { sock }) {
  let txt = `꧁༺ ☠︎ LUFFY RPG - GUÍA PIRATA ༻꧂\n\n`;
  txt += `━━━ *⛵ INICIO* ━━━\n`;
  txt += `• *${m.prefix}iniciar* — Comenzar tu aventura\n`;
  txt += `• *${m.prefix}perfil* — Ver tu ficha de pirata\n\n`;
  txt += `━━━ *📈 PROGRESIÓN* ━━━\n`;
  txt += `• *${m.prefix}diario* — Recompensa diaria 🎁\n`;
  txt += `• *${m.prefix}mision* — Ver y gestionar misiones\n`;
  txt += `• *${m.prefix}nivel* — Ver progreso de nivel\n\n`;
  txt += `━━━ *💰 ECONOMÍA* ━━━\n`;
  txt += `• *${m.prefix}tienda* — Ver la tienda\n`;
  txt += `• *${m.prefix}comprar_rpg* — Comprar un objeto\n`;
  txt += `• *${m.prefix}vender* — Vender objetos\n`;
  txt += `• *${m.prefix}inventario* — Ver tu inventario\n`;
  txt += `• *${m.prefix}usar* — Usar un objeto\n\n`;
  txt += `━━━ *🗺️ AVENTURA* ━━━\n`;
  txt += `• *${m.prefix}explorar* — Explorar tu isla actual\n`;
  txt += `• *${m.prefix}isla* — Ver islas y enemigos\n`;
  txt += `• *${m.prefix}viajar* — Viajar a otra isla\n`;
  txt += `• *${m.prefix}combate* — Pelear contra un enemigo\n`;
  txt += `• *${m.prefix}entrenar* — Entrenar para ganar EXP\n\n`;
  txt += `━━━ *🍎 ONE PIECE* ━━━\n`;
  txt += `• *${m.prefix}fruta* — Comer una Fruta del Diablo\n`;
  txt += `• *${m.prefix}haki* — Despertar tu Haki\n`;
  txt += `• *${m.prefix}gear* — Activar tu Gear\n`;
  txt += `• *${m.prefix}personajes* — Gacha de personajes\n`;
  txt += `• *${m.prefix}coleccion* — Ver tu colección\n\n`;
  txt += `━━━ *🏴 TRIPULACIÓN* ━━━\n`;
  txt += `• *${m.prefix}tripulacion* — Gestionar tripulación\n`;
  txt += `• *${m.prefix}barco* — Comprar o ver barcos\n\n`;
  txt += `━━━ *🏆 COMPETENCIA* ━━━\n`;
  txt += `• *${m.prefix}clasificacion* — Top piratas\n\n`;
  txt += `╰┈➤ ¡Zarpa hacia la aventura! ⚔️ 🌊`;

  return m.reply(txt);
}

export { pluginConfig as config, handler };
