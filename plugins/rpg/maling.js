import { getDatabase } from "../../src/lib/ourin-database.js";
import { addExpWithLevelCheck } from "../../src/lib/ourin-level.js";
import { sendRpgPreview } from "../../src/lib/ourin-context.js";

const pluginConfig = {
  name: "maling",
  alias: ["copet", "pickpocket"],
  category: "rpg",
  description: "Robar carteras en el mercado (más riesgoso que crime)",
  usage: ".maling",
  example: ".maling",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 180,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};
  user.rpg.health = user.rpg.health || 100;

  if (user.rpg.health < 40) {
    return m.reply(`¡Estás jadeando solo de intentar robar! 🤒\nMínimo *40 HP*, jefe. Tu salud actual: *${user.rpg.health} HP*. ¡Duérmete primero!`);
  }

  await sendRpgPreview(sock, m.chat, "Metiéndote en la multitud del mercado... Apuntando al bolso de las señoras... 🦹‍♂️🤏", "🦹 CARTERO", "¡A actuar!", { quoted: m });
  await new Promise((r) => setTimeout(r, 2500));

  const outcomes = [
    { success: true, type: "big", money: 20000, exp: 500, msg: "¡¡INCREÍBLE! ¡Encontraste un monedero con una *Black Card del ATM* y billetes apilados! 🤑" },
    { success: true, type: "medium", money: 8000, exp: 200, msg: "No está mal, encontraste un monedero de cuero con varios billetes de 10k. 😏" },
    { success: true, type: "small", money: 2000, exp: 50, msg: "Mala suerte, ¡encontraste el monedero de un señor con solo su DNI y un recibo! 😑 Pero se resbaló algo de dinero." },
    { success: false, type: "caught", fine: 15000, health: 30, msg: "¡¡HEY LADRÓN!!! 😱 ¡Una señora gritó y te *lincharon a puñetazos* hasta sacarte los dientes!" },
    { success: false, type: "police", fine: 25000, health: 10, msg: "Mientras revisabas el monedero, ¡una mano de detective se cerró sobre la tuya! 👮‍♂️ ¡Atrapado!" },
    { success: false, type: "fail", fine: 0, health: 0, msg: "¡Maldita sea! El objetivo sintió que le revisaban la bolsa y huyó entre la multitud. 😤 Fallaste." },
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
    user.koin = (user.koin || 0) + outcome.money;
    await addExpWithLevelCheck(sock, m, db, user, outcome.exp);

    txt = `¡¡OPERACIÓN LIMPIA!! 🦹‍♂️✨\n\n`;
    txt += `${outcome.msg}\n\n`;
    txt += `💰 Belly Haram: *+Rp ${outcome.money.toLocaleString("id-ID")}*\n`;
    txt += `📈 EXP Copet: *+${outcome.exp}*`;
  } else {
    const actualFine = Math.min(outcome.fine, user.koin || 0);
    user.koin = Math.max(0, (user.koin || 0) - actualFine);
    user.rpg.health = Math.max(0, user.rpg.health - outcome.health);

    txt = `¡¡DESASTRE!! 🚨🤬\n\n`;
    txt += `${outcome.msg}\n\n`;
    if (outcome.fine > 0) txt += `💸 Duit Damai/Rampasan: *-Rp ${actualFine.toLocaleString("id-ID")}*\n`;
    if (outcome.health > 0) txt += `🤕 Darah Bercucuran: *-${outcome.health} HP*`;

    if (user.rpg.health <= 0) {
      user.rpg.health = 0;
      user.exp = Math.floor((user.exp || 0) / 2);
      txt += `\n\n💀 *¡¡DESCANSA EN PAZ... MORISTE A PALAZOS POR LA MULTITUD!!*\n¡Tu EXP se redujo 50%! 😭`;
    }
  }

  db.save();
  await sendRpgPreview(sock, m.chat, txt, "🦹 RESULTADO DEL BOLSERO", "¡Resultado!", { quoted: m });
}

export { pluginConfig as config, handler };
