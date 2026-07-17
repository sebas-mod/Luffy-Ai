import { getDatabase } from "../../src/lib/ourin-database.js";
import { addExpWithLevelCheck } from "../../src/lib/ourin-level.js";

const pluginConfig = {
  name: "nulis",
  alias: ["author", "wattpad"],
  category: "rpg",
  description: "Escribir cuentos cortos o artículos para obtener regalías",
  usage: ".nulis",
  example: ".nulis",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 120,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};
  
  const staminaCost = 10;
  user.rpg.stamina = user.rpg.stamina ?? 100;

  if (user.rpg.stamina < staminaCost) {
    return m.reply(`¡Bloqueo de escritura, parálisis creativa! 😵‍💫\n\nEscribir requiere *${staminaCost} Stamina*, te quedan *${user.rpg.stamina}*. ¡Busca inspiración primero! 💡`);
  }

  user.rpg.stamina -= staminaCost;
  await m.react("📝");
  await m.reply(`Componiendo palabra tras palabra con significado... ✍️\n¡Ojalá algún editor se interese! 📚`);
  await new Promise(r => setTimeout(r, 3000));

  const gacha = Math.random();

  if (gacha < 0.15) {
    await m.react("🚮");
    return m.reply(`¡MANUSCRITO RECHAZADO POR EL EDITOR! 🚮🥺\n\nRazón: "La historia es demasiado cliché y genérica."\n💵 Regalías: 0\n⚡ Stamina: -${staminaCost}\n\n¡No te rindas, escribe de nuevo mañana! 💪`);
  } else if (gacha > 0.9) {
    const viralRoyalti = Math.floor(Math.random() * 60000) + 30000;
    user.belly = (user.belly || 0) + viralRoyalti;
    const expGain = Math.floor(viralRoyalti / 20);
    await addExpWithLevelCheck(sock, m, db, user, expGain);
    
    await m.react("🌟");
    return m.reply(`¡¡TU HISTORIA SE VOLVIÓ VIRAL Y ES BEST SELLER!! 🌟📘\n\n¡Muchos lloraron leyendo tu obra, las regalías fluyen a raudales!\n💵 Regalías: *+Belly ${viralRoyalti.toLocaleString("es-ES")}*\n📈 EXP: *+${expGain}*\n⚡ Stamina: -${staminaCost}\n\n¡Pronto te contactará un director para la película! 🎬`);
  }

  const earning = Math.floor(Math.random() * 15000) + 5000;
  user.belly = (user.belly || 0) + earning;
  const expGain = Math.floor(earning / 20);
  await addExpWithLevelCheck(sock, m, db, user, expGain);

  await m.react("✅");
  m.reply(`¡REGALÍAS POR ESCRITURA EN TU CUENTA! 📝✨\n\n💵 Ingreso: *+Belly ${earning.toLocaleString("es-ES")}*\n📈 EXP: *+${expGain}*\n⚡ Stamina: -${staminaCost}\n\n¡Sigue creando, poeta! 🎓`);
}

export { pluginConfig as config, handler };
