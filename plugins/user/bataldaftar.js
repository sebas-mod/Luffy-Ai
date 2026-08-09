import { clearRegistrationSession } from "./daftar.js";

const pluginConfig = {
  name: "bataldaftar",
  alias: ["cancelreg", "canceldaftar", "regcancel"],
  category: "user",
  description: "Cancelar la sesión de registro activa",
  usage: ".bataldaftar",
  example: ".bataldaftar",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  carne: 0,
  isEnabled: true,
  skipRegistration: true,
};

async function handler(m) {
  const canceled = clearRegistrationSession(m.sender);

  if (!canceled) {
    return m.reply(`❌ No tienes una sesión de registro activa.`);
  }

  return m.reply(
    `✅ Sesión de registro cancelada correctamente.\n\n` +
      `> Vuelve a empezar con: \`${m.prefix}daftar\``,
  );
}

export { pluginConfig as config, handler };
