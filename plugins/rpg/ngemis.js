import { getDatabase } from "../../src/lib/ourin-database.js";
import { addExpWithLevelCheck } from "../../src/lib/ourin-level.js";

const pluginConfig = {
  name: "ngemis",
  alias: ["minta", "gembel"],
  category: "rpg",
  description: "Mendigar en la calle con posibilidad de obtener arroz envuelto (recupera stamina)",
  usage: ".ngemis",
  example: ".ngemis",
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
  
  const staminaCost = 5;
  user.rpg.stamina = user.rpg.stamina ?? 100;

  if (user.rpg.stamina < staminaCost) {
    return m.reply(`¡Se te acabó la energía de mendigar! 🥺\n\nMendigar requiere *${staminaCost} Stamina*, te quedan *${user.rpg.stamina}*. ¡No puedes más... 💔`);
  }

  user.rpg.stamina -= staminaCost;
  await m.react("🤲");
  await m.reply(`Señor, señora, dénme un poquito de limosna... 🥺\nEsperando que un benefactor pase por esta esquina... 🚶‍♂️`);
  await new Promise(r => setTimeout(r, 3000));

  const gacha = Math.random();

  if (gacha < 0.3) {
    const heal = Math.floor(Math.random() * 20) + 10;
    user.rpg.stamina = Math.min(100, user.rpg.stamina + heal);
    await m.react("🍱");
    return m.reply(`¡ALABADO SEA DIOS, ME DIERON ARROZ PADANG! 🍱✨\n\n¡Un señor de buen corazón te dio un paquete de arroz sobrante de la reunión!\n💖 Stamina aumentó: *+${heal}*\n💵 Dinero obtenido: 0\n\n¡Barriga llena, corazón contento! 🥰`);
  }

  if (gacha > 0.9) {
    await m.react("💢");
    return m.reply(`¡EXPULSADO POR LOS DELINCUENTES DEL MERCADO! 💢\n\n"¡Oye, este es mi puesto! ¡Lárgate!"\nHuyes aterrorizado sin ganar ni un centavo...\n⚡ Stamina: -${staminaCost}\n\n¡Es tan difícil encontrar un buen lugar para mendigar! 😭`);
  }

  const earning = Math.floor(Math.random() * 3000) + 500;
  user.koin = (user.koin || 0) + earning;
  const expGain = Math.floor(earning / 10);
  await addExpWithLevelCheck(sock, m, db, user, expGain);

  await m.react("✅");
  m.reply(`RESULTADO DEL MENDIGO HOY! 🤲✨\n\n💵 Ingreso de monedas: *+Rp ${earning.toLocaleString("id-ID")}*\n📈 EXP: *+${expGain}*\n⚡ Stamina: -${staminaCost}\n\n¡Agradece por las bendiciones del día, aunque sea moneditas, lo importante es que es lícito! 🙏`);
}

export { pluginConfig as config, handler };
