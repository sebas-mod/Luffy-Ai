import { getDatabase } from "../../src/lib/luffy-database.js";
import { addExpWithLevelCheck } from "../../src/lib/luffy-level.js";

const pluginConfig = {
  name: "nulis",
  alias: ["author", "wattpad"],
  category: "rpg",
  description: "Escribir cuentos o artículos para ganar regalías",
  usage: ".nulis",
  example: ".nulis",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 120,
  carne: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};
  
  const staminaCost = 10;
  user.rpg.stamina = user.rpg.stamina ?? 100;

  if (user.rpg.stamina < staminaCost) {
    return m.reply(`¡Sin ideas, el bloqueo del escritor atacó! 😵‍💫\n\nEscribir necesita *${staminaCost} de Resistencia*, solo te quedan *${user.rpg.stamina}*. ¡Busca inspiración primero! 💡`);
  }

  user.rpg.stamina -= staminaCost;
  await m.react("📝");
  await m.reply(`Tejiendo palabra por palabra llenas de significado... ✍️\n¡Ojalá algún editor te preste atención! 📚`);
  await new Promise(r => setTimeout(r, 3000));

  const gacha = Math.random();

  if (gacha < 0.15) {
    await m.react("🚮");
    return m.reply(`¡MANUSCRITO RECHAZADO POR EL EDITOR! 🚮🥺\n\nRazón: "La historia es demasiado cliché y comercial."\n💵 Regalías: 0\n⚡ Resistencia: -${staminaCost}\n\nNo te rindas, ¡mañana escribes otra vez! 💪`);
  } else if (gacha > 0.9) {
    const viralRoyalti = Math.floor(Math.random() * 60000) + 30000;
    user.berry = (user.berry || 0) + viralRoyalti;
    const expGain = Math.floor(viralRoyalti / 20);
    await addExpWithLevelCheck(sock, m, db, user, expGain);
    
    await m.react("🌟");
    return m.reply(`¡TU HISTORIA SE VOLVIÓ VIRAL Y ES BEST SELLER! 🌟📘\n\nMuchos lloraron a mares leyendo tu obra, ¡las regalías llegan a raudales!\n💵 Regalías: *+Rp ${viralRoyalti.toLocaleString("id-ID")}*\n📈 EXP: *+${expGain}*\n⚡ Resistencia: -${staminaCost}\n\n¡En camino a que un director la lleve al cine! 🎬`);
  }

  const earning = Math.floor(Math.random() * 15000) + 5000;
  user.berry = (user.berry || 0) + earning;
  const expGain = Math.floor(earning / 20);
  await addExpWithLevelCheck(sock, m, db, user, expGain);

  await m.react("✅");
  m.reply(`¡REGALÍAS POR ESCRIBIR LIQUIDADAS! 📝✨\n\n💵 Ingreso: *+Rp ${earning.toLocaleString("id-ID")}*\n📈 EXP: *+${expGain}*\n⚡ Resistencia: -${staminaCost}\n\n¡Sigue creando, poetas! 🎓`);
}

export { pluginConfig as config, handler };
