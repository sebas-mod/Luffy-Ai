import { getDatabase } from "../../src/lib/luffy-database.js";
import { addExpWithLevelCheck } from "../../src/lib/luffy-level.js";

const pluginConfig = {
  name: "ngamen",
  alias: ["nyanyi", "konser"],
  category: "rpg",
  description: "Cantar en la calle para ganar monedas",
  usage: ".ngamen",
  example: ".ngamen",
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
    return m.reply(`¡Voz ronca, garganta seca! 🥵\n\nCantar en la calle necesita *${staminaCost} de Resistencia*, solo te quedan *${user.rpg.stamina}*. ¡Tómate un té helado! ☕`);
  }

  user.rpg.stamina -= staminaCost;

  await m.react("🎸");

  const locations = [
    { name: "Semáforo del Cruce", min: 3000, max: 10000 },
    { name: "Cafetería Local", min: 5000, max: 15000 },
    { name: "Frente al Minimarket", min: 4000, max: 12000 },
    { name: "Café Moderno", min: 8000, max: 25000 },
    { name: "Puesto Callejero", min: 2000, max: 8000 }
  ];

  const loc = locations[Math.floor(Math.random() * locations.length)];
  const earning = Math.floor(Math.random() * (loc.max - loc.min + 1)) + loc.min;

  await m.reply(`Comenzando a rasguear la guitarra en *${loc.name}*... 🎶\n¡Ojalá hoy muchos den monedas! 💸`);
  await new Promise((resolve) => setTimeout(resolve, 3000));

  user.berry = (user.berry || 0) + earning;

  const expGain = Math.floor(earning / 20);
  await addExpWithLevelCheck(sock, m, db, user, expGain);

  await m.react("✅");

  let txt = `¡RESULTADO DE CANTAR EN LA CALLE! 🎸✨\n\n`;
  txt += `Lugar: *${loc.name}*\n`;
  txt += `💵 Ingreso: *+Rp ${earning.toLocaleString("id-ID")}*\n`;
  txt += `📈 EXP: *+${expGain}*\n`;
  txt += `⚡ Resistencia: *-${staminaCost}*\n\n`;
  txt += `¡Nada mal para comprar la comida del día! 🤤`;

  m.reply(txt);
}

export { pluginConfig as config, handler };
