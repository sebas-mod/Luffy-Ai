import { getDatabase } from "../../src/lib/ourin-database.js";
import { addExpWithLevelCheck } from "../../src/lib/ourin-level.js";

const pluginConfig = {
  name: "ngamen",
  alias: ["nyanyi", "konser"],
  category: "rpg",
  description: "Cantar en las calles para ganar monedas",
  usage: ".ngamen",
  example: ".ngamen",
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
    return m.reply(`¡Voz ronca, garganta seca! 🥵\n\nCantar requiere *${staminaCost} Stamina*, te quedan *${user.rpg.stamina}*. ¡Toma un té helado primero! ☕`);
  }

  user.rpg.stamina -= staminaCost;

  await m.react("🎸");

  const locations = [
    { name: "Cruce de Semáforos", min: 3000, max: 10000 },
    { name: "Cafetería", min: 5000, max: 15000 },
    { name: "Frente al Minimarket", min: 4000, max: 12000 },
    { name: "Café Moderno", min: 8000, max: 25000 },
    { name: "Puesto Callejero", min: 2000, max: 8000 }
  ];

  const loc = locations[Math.floor(Math.random() * locations.length)];
  const earning = Math.floor(Math.random() * (loc.max - loc.min + 1)) + loc.min;

  await m.reply(`Comienzas a rasguear la guitarra en *${loc.name}*... 🎶\n¡Espera que hoy te den buenas propinas! 💸`);
  await new Promise((resolve) => setTimeout(resolve, 3000));

  user.belly = (user.belly || 0) + earning;

  const expGain = Math.floor(earning / 20);
  await addExpWithLevelCheck(sock, m, db, user, expGain);

  await m.react("✅");

  let txt = `¡ALABADO SEA DIOS, RESULTADO DEL CANTO! 🎸✨\n\n`;
  txt += `Ubicación: *${loc.name}*\n`;
  txt += `💵 Ingreso: *+Belly ${earning.toLocaleString("es-ES")}*\n`;
  txt += `📈 EXP: *+${expGain}*\n`;
  txt += `⚡ Stamina: *-${staminaCost}*\n\n`;
  txt += `¡Sirve para comprar arroz hoy! 🤤`;

  m.reply(txt);
}

export { pluginConfig as config, handler };
