const pluginConfig = {
  name: "cekmesum",
  alias: ["mesum"],
  category: "cek",
  description: "Comprueba cuán pervertido eres",
  usage: ".cekmesum <nombre>",
  example: ".cekmesum Budi",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  carne: 0,
  isEnabled: true,
};

async function handler(m) {
  const percent = Math.floor(Math.random() * 101);
  const mentioned = m.mentionedJid[0] || m.sender;

  let desc = "";
  if (percent >= 90) {
    desc = "¡PERVERTIDO AGUDO! ¡Arrepiéntete! 😳🔞";
  } else if (percent >= 70) {
    desc = "¡Muy pervertido! 👀";
  } else if (percent >= 50) {
    desc = "Bastante pervertido 😏";
  } else if (percent >= 30) {
    desc = "Un poco pervertido 🙈";
  } else {
    desc = "¡Inocente y puro! 😇";
  }

  let txt =
    mentioned === m.sender
      ? `Hola @${mentioned.split("@")[0]}
    
Tu nivel de perversión es *${percent}%*
\`\`\`${desc}\`\`\``
      : `¿Quieres comprobar el nivel de perversión de @${mentioned.split("@")[0]}? 
    
Su nivel de perversión es *${percent}%*
\`\`\`${desc}\`\`\``;

  await m.reply(txt, { mentions: [mentioned] });
}

export { pluginConfig as config, handler };
