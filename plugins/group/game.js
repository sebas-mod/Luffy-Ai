import { getDatabase } from "../../src/lib/luffy-database.js";

const pluginConfig = {
  name: "game",
  alias: ["togglegame"],
  category: "group",
  description: "Activar o desactivar la función de juegos en el grupo",
  usage: ".game <on/off>",
  example: ".game on",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  isAdmin: true,
  cooldown: 5,
  carne: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const args = m.text?.trim()?.toLowerCase();

  if (args !== "on" && args !== "off") {
    return m.reply(
      `🎮 *FUNCIÓN DE JUEGOS EN EL GRUPO*\n\n` +
        `Usa este comando para configurar el acceso de los miembros a los juegos.\n\n` +
        `• *${m.prefix}game on* - Los miembros pueden jugar\n` +
        `• *${m.prefix}game off* - Los miembros no pueden jugar\n\n` +
        `*Nota:* Los admins siempre pueden acceder a los juegos aunque estén desactivados.`,
    );
  }

  const db = getDatabase();
  const group = db.getGroup(m.chat) || db.setGroup(m.chat);

  const isEnable = args === "on";

  if (group.game === isEnable) {
    return m.reply("☽◯☾ ╭━ ♰ ⚡ GRUPO ♰ ━╮ ☽◯☾\n"+`🎮 La función de juegos ya está *${isEnable ? "ACTIVADA" : "DESACTIVADA"}* en este grupo.`+"\n╰━ ⊱༺༒༻⊰ ━╯");
  }

  group.game = isEnable;
  db.setGroup(m.chat, group);

  await m.react("✅");
  return m.reply(
    `✅ Se logró *${isEnable ? "ACTIVAR" : "DESACTIVAR"}* la función de juegos en este grupo!\n\n` +
    (isEnable
      ? `Los miembros ahora pueden usar todos los comandos del menú de juegos.`
      : `Los miembros ya no podrán usar los comandos de juegos.`),
  );
}

export { pluginConfig as config, handler };
