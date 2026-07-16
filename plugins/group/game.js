import { getDatabase } from "../../src/lib/ourin-database.js";

const pluginConfig = {
  name: "game",
  alias: ["togglegame"],
  category: "group",
  description: "Activar o desactivar la función de juego en el grupo",
  usage: ".game <on/off>",
  example: ".game on",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  isAdmin: true,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const args = m.text?.trim()?.toLowerCase();

  if (args !== "on" && args !== "off") {
    return m.reply(
      `🎮 *FUNCIONES DE JUEGO DEL GRUPO*\n\n` +
        `Usa este comando para configurar el acceso de los miembros a los juegos.\n\n` +
        `• *${m.prefix}game on* - Los miembros pueden jugar\n` +
        `• *${m.prefix}game off* - Los miembros no pueden jugar\n\n` +
        `*Nota:* Los admin siguen teniendo acceso a los juegos aunque esté desactivado.`,
    );
  }

  const db = getDatabase();
  const group = db.getGroup(m.chat) || db.setGroup(m.chat);

  const isEnable = args === "on";

  if (group.game === isEnable) {
    return m.reply(`🎮 La función de juego ya está *${isEnable ? "ACTIVA" : "INACTIVA"}* en este grupo. ¡Shishishi!`);
  }

  group.game = isEnable;
  db.setGroup(m.chat, group);

  await m.react("✅");
  return m.reply(
    `✅ ¡Función de juego *${isEnable ? "ACTIVADA" : "DESACTIVADA"}* con éxito en este grupo!\n\n` +
    (isEnable
      ? `Ahora los miembros pueden usar todos los comandos del menú de juegos. ¡Voy a ser el Rey de los Piratas!`
      : `Los miembros no podrán usar los comandos de juegos.`),
  );
}

export { pluginConfig as config, handler };
