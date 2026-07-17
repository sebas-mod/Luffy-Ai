import { getDatabase } from "../../src/lib/ourin-database.js";
import { addExpWithLevelCheck } from "../../src/lib/ourin-level.js";

const pluginConfig = {
  name: "crime",
  alias: ["curi", "jahat"],
  category: "rpg",
  description: "Cometer un crimen asaltando un ATM (alto riesgo)",
  usage: ".crime",
  example: ".crime",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 300,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};

  await m.react("💣");
  await m.reply("Instalando dispositivo de hacking en el ATM de enfrente... 💣💻");
  await new Promise((r) => setTimeout(r, 2500));

  const successRate = 0.5;
  const isSuccess = Math.random() < successRate;

  if (isSuccess) {
    const stolen = Math.floor(Math.random() * 15000) + 5000;
    const expGain = Math.floor(stolen / 20);

    user.belly = (user.belly || 0) + stolen;
    await addExpWithLevelCheck(sock, m, db, user, expGain);

    db.save();

    let txt = `¡¡HACKING EXITOSO!! 💻💵\n\n`;
    txt += `¡El cajero automático expulsa dinero como una cascada! Huyes rápidamente con un maletín lleno.\n\n`;
    txt += `💰 Ganancia del Robo: *+Belly ${stolen.toLocaleString("es-ES")}*\n`;
    txt += `📈 EXP Criminal: *+${expGain}*`;

    await m.reply(txt);
  } else {
    const fine = Math.floor(Math.random() * 10000) + 5000;
    const actualFine = Math.min(fine, user.belly || 0);

    user.belly = Math.max(0, (user.belly || 0) - actualFine);
    user.rpg.health = Math.max(0, (user.rpg.health || 100) - 15);

    db.save();

    let txt = `¡¡PIIII PIIII!! ¡¡SUENA LA ALARMA!! 🚨🚓\n\n`;
    txt += `¡Maldita sea, la máquina dio error y la policía te rodea desde todas partes!\n`;
    txt += `Te golpean con un bastón policial y te obligan a pagar una multa.\n\n`;
    txt += `💸 Multa Penal: *-Belly ${actualFine.toLocaleString("es-ES")}*\n`;
    txt += `🤕 Moretón por Porrazo: *-15 HP*`;

    await m.reply(txt);
  }
}

export { pluginConfig as config, handler };
