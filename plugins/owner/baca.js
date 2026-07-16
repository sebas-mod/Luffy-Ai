const pluginConfig = {
  name: ["baca", "read", "markread"],
  alias: [],
  category: "owner",
  description: "Marca un mensaje como leído",
  usage: ".baca",
  example: ".baca",
  isOwner: true,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  try {
    await sock.readMessages([m.key]);
    await m.react("✅");
    return m.reply("📖 *Mensaje ditandai ya dibaca*");
  } catch (err) {
    return m.reply(`❌ Fallo: ${err.message}`);
  }
}

export { pluginConfig as config, handler };
