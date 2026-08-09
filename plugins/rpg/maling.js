import { getDatabase } from "../../src/lib/luffy-database.js";
import { addExpWithLevelCheck } from "../../src/lib/luffy-level.js";
import { sendRpgPreview } from "../../src/lib/luffy-context.js";

const pluginConfig = {
  name: "maling",
  alias: ["copet", "pickpocket"],
  category: "rpg",
  description: "Mencopet orang di pasar (lebih berisiko dari crime)",
  usage: ".maling",
  example: ".maling",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 180,
  carne: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};
  user.rpg.health = user.rpg.health || 100;

  if (user.rpg.health < 40) {
    return m.reply(`¡Tu respiración ni te da para robar! 🤒\nNecesitas mínimo *40 HP* jefe, solo tienes *${user.rpg.health} HP*. ¡Mejor ve a dormir!`);
  }

  await sendRpgPreview(sock, m.chat, "Escabulléndose entre la multitud del mercado... Apuntando a la bolsa de una señora... 🦹‍♂️🤏", "🦹 CARTERISTA", "¡En acción!", { quoted: m });
  await new Promise((r) => setTimeout(r, 2500));

  const outcomes = [
    { success: true, type: "big", money: 20000, exp: 500, msg: "¡¡LOCO!! Conseguiste una cartera con *Tarjeta Black* y un fajo de billetes! 🤑" },
    { success: true, type: "medium", money: 8000, exp: 200, msg: "Nada mal, te tocó una cartera de cuero original con varios miles. 😏" },
    { success: true, type: "small", money: 2000, exp: 50, msg: "Qué mala suerte, conseguiste la cartera de un señor con su DNI y un ticket de tienda! 😑 Pero había un poco de dinero escondido." },
    { success: false, type: "caught", fine: 15000, health: 30, msg: "¡¡OYE LADRÓN!!! 😱 La señora gritó y *la gente te linchó* hasta que se te cayeron los dientes!" },
    { success: false, type: "police", fine: 25000, health: 10, msg: "Estabas a punto de robar la cartera, ¡y un *policía de incógnito* te agarró la mano! 👮‍♂️ ¡Atrapado!" },
    { success: false, type: "fail", fine: 0, health: 0, msg: "¡Maldición! El objetivo sintió que le tocaban la bolsa y huyó entre la multitud! 😤 Fracasado bro." },
  ];

  const weights = [5, 20, 30, 15, 10, 20];
  const rand = Math.random() * 100;
  let cumulative = 0;
  let outcome = outcomes[5];

  for (let i = 0; i < outcomes.length; i++) {
    cumulative += weights[i];
    if (rand <= cumulative) {
      outcome = outcomes[i];
      break;
    }
  }

  let txt = "";

  if (outcome.success) {
    user.berry = (user.berry || 0) + outcome.money;
    await addExpWithLevelCheck(sock, m, db, user, outcome.exp);

    txt = `¡OPERACIÓN LIMPIA! 🦹‍♂️✨\n\n`;
    txt += `${outcome.msg}\n\n`;
    txt += `💰 Berry Ilegales: *+Rp ${outcome.money.toLocaleString("id-ID")}*\n`;
    txt += `📈 EXP de Carterista: *+${outcome.exp}*`;
  } else {
    const actualFine = Math.min(outcome.fine, user.berry || 0);
    user.berry = Math.max(0, (user.berry || 0) - actualFine);
    user.rpg.health = Math.max(0, user.rpg.health - outcome.health);

    txt = `¡¡UN DESASTRE!! 🚨🤬\n\n`;
    txt += `${outcome.msg}\n\n`;
    if (outcome.fine > 0) txt += `💸 Soborno/Robo: *-Rp ${actualFine.toLocaleString("id-ID")}*\n`;
    if (outcome.health > 0) txt += `🤕 Sangre Derramada: *-${outcome.health} HP*`;

    if (user.rpg.health <= 0) {
      user.rpg.health = 0;
      user.exp = Math.floor((user.exp || 0) / 2);
      txt += `\n\n💀 *POR DIOS... ¡MORISTE POR LA PALIZA DE LA MULTITUD!*\n¡Tu EXP se redujo al 50%! 😭`;
    }
  }

  db.save();
  await sendRpgPreview(sock, m.chat, txt, "🦹 RESULTADO DEL CARTERISTA", "Result!", { quoted: m });
}

export { pluginConfig as config, handler };
