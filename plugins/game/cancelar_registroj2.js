import { clearJ2Session } from "./registro.js";

const pluginConfig = {
  name: "cancelar_registrogame",
  alias: ["cancelar_registroj2", "cancelregjuego", "cancelar_juego", "regjuegocancel"],
  category: "game",
  description: "Cancelar la sesión de registro de juegos activa",
  usage: ".cancelar_registrogame",
  example: ".cancelar_registrogame",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  carne: 0,
  isEnabled: true,
};

async function handler(m) {
  const canceled = clearJ2Session(m.sender);

  if (!canceled) {
    return m.reply(`❌ No tienes una sesión de registro de juegos activa.`);
  }

  return m.reply(
    `✅ Sesión de registro de juegos cancelada correctamente.\n\n` +
      `> Vuelve a empezar con: \`${m.prefix}registrogame\``,
  );
}

export { pluginConfig as config, handler };