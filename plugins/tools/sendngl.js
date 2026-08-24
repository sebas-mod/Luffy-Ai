import te from "../../src/lib/luffy-error.js";
import ourinApi from "../../src/lib/luffy-apimanager.js";
const pluginConfig = {
  name: "sendngl",
  alias: [],
  category: "tools",
  description: "Enviar NGL",
  usage: ".sendngl <url> | <texto>",
  example: ".sendngl https://ngl.link/xxxx | hola",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  carne: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const text = m.text?.split("|");
  const [link, kata] = text;
  if (!link)
    return m.reply(
      `╰┈➤ *¿DÓNDE ESTÁ EL ENLACE NGL??*\n──────────\nEjemplo: \`${m?.prefix}sendngl https://ngl.link/xxxx | hola`,
    );
  if (!kata)
    return m.reply(
      `╰┈➤ *¿Y EL MENSAJE??*\n──────────\nEjemplo: \`${m?.prefix}sendngl https://ngl.link/xxxx | hola`,
    );
  m.react("🎴");

  try {
    await ourinApi.cuki.sendNgl(
      {
        link,
        text: kata,
      },
      {
        timeout: 30000,
      },
    );

    m.react("✅");

    await sock.sendMessage(
      m.chat,
      {
        text: `✅ *HECHO*\n\nMensaje enviado correctamente!\nDestino: ${link}\nMensaje: ${kata}`,
      },
      { quoted: m },
    );
  } catch (error) {
    m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
