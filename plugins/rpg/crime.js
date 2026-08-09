import { getDatabase } from "../../src/lib/luffy-database.js";
import { addExpWithLevelCheck } from "../../src/lib/luffy-level.js";

const pluginConfig = {
  name: "crime",
  alias: ["curi", "jahat"],
  category: "rpg",
  description: "Melakukan kejahatan membobol ATM (risiko tinggi)",
  usage: ".crime",
  example: ".crime",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 300,
  carne: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};

  await m.react("💣");
  await m.reply("Colocando el dispositivo de hackeo en el cajero de enfrente... 💣💻");
  await new Promise((r) => setTimeout(r, 2500));

  const successRate = 0.5;
  const isSuccess = Math.random() < successRate;

  if (isSuccess) {
    const stolen = Math.floor(Math.random() * 15000) + 5000;
    const expGain = Math.floor(stolen / 20);

    user.berry = (user.berry || 0) + stolen;
    await addExpWithLevelCheck(sock, m, db, user, expGain);

    db.save();

    let txt = `¡¡HACKEO EXITOSO!! 💻💵\n\n`;
    txt += `El cajero expulsó dinero como cascada! Huiste con una maleta llena de billetes.\n\n`;
    txt += `💰 Resultado del Robo: *+Rp ${stolen.toLocaleString("id-ID")}*\n`;
    txt += `📈 EXP Criminal: *+${expGain}*`;

    await m.reply(txt);
  } else {
    const fine = Math.floor(Math.random() * 10000) + 5000;
    const actualFine = Math.min(fine, user.berry || 0);

    user.berry = Math.max(0, (user.berry || 0) - actualFine);
    user.rpg.health = Math.max(0, (user.rpg.health || 100) - 15);

    db.save();

    let txt = `¡¡NGIIING NGIING!! ¡¡SUENA LA ALARMA!! 🚨🚓\n\n`;
    txt += `Maldita sea, la máquina falló y la policía te rodeó por todos lados!\n`;
    txt += `Te golpearon con la porra y te obligaron a pagar una multa.\n\n`;
    txt += `💸 Multa Penal: *-Rp ${actualFine.toLocaleString("id-ID")}*\n`;
    txt += `🤕 Moretones por la Porra: *-15 HP*`;

    await m.reply(txt);
  }
}

export { pluginConfig as config, handler };
