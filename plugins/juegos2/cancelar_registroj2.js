import { clearJ2Session } from "./registro.js";

const pluginConfig = {
  name: "cancelar_registroj2",
  alias: ["cancelregjuego", "cancelar_juego", "regjuegocancel"],
  category: "juegos2",
  description: "Cancelar la sesión de registro de juegos activa",
  usage: ".cancelar_registroj2",
  example: ".cancelar_registroj2",
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
      `> Vuelve a empezar con: \`${m.prefix}registroj2\``,
  );
}

export { pluginConfig as config, handler };