const pluginConfig = {
  name: "cekmesum",
  alias: ["mesum"],
  category: "cek",
  description: "Mide qué tan cachondo/a eres",
  usage: ".cekmesum <nombre>",
  example: ".cekmesum Budi",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m) {
  const percent = Math.floor(Math.random() * 101);
  const mentioned = m.mentionedJid[0] || m.sender;

  let desc = "";
  if (percent >= 90) {
    desc = "¡CACHONDO/A TERMINAL! ¡Arrepiéntate! 😳🔞";
  } else if (percent >= 70) {
    desc = "¡Muy cachondo/a! 👀";
  } else if (percent >= 50) {
    desc = "Bastante cachondo/a 😏";
  } else if (percent >= 30) {
    desc = "Un poco cachondo/a 🙈";
  } else {
    desc = "¡Puro/a y inocente! 😇";
  }

  let txt =
    mentioned === m.sender
      ? `Hola @${mentioned.split("@")[0]}
    
Tu nivel de cachondez es *${percent}%*
\`\`\`${desc}\`\`\``
      : `¿Quieres medir el nivel de cachondez de @${mentioned.split("@")[0]}?
    
Su nivel de cachondez es *${percent}%*
\`\`\`${desc}\`\`\``;

  await m.reply(txt, { mentions: [mentioned] });
}

export { pluginConfig as config, handler };
