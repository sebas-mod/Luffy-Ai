const pluginConfig = {
  name: ["leer", "read", "markread"],
  alias: [],
  category: "owner",
  description: "Marcar el mensaje como leído",
  usage: ".leer",
  example: ".leer",
  isOwner: true,
  cooldown: 3,
  carne: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  try {
    await sock.readMessages([m.key]);
    await m.react("✅");
    return m.reply("☽◯☾ ♰ 📖 *Mensaje marcado como leído*");
  } catch (err) {
    return m.reply(`☽◯☾ ♰ ❌ Falló: ${err.message}`);
  }
}

export { pluginConfig as config, handler };
