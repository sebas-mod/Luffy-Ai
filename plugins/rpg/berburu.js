import { getDatabase } from "../../src/lib/luffy-database.js";
import { addExpWithLevelCheck } from "../../src/lib/luffy-level.js";

const pluginConfig = {
  name: "berburu",
  alias: ["huntanimal", "buru"],
  category: "rpg",
  description: "Cazar animales para obtener ítems",
  usage: ".berburu",
  example: ".berburu",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 120,
  carne: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};
  if (!user.inventory) user.inventory = {};

  const staminaCost = 25;
  user.rpg.stamina = user.rpg.stamina ?? 100;

  if (user.rpg.stamina < staminaCost) {
    return m.reply(`Uy bro, ¡tu resistencia se agotó! 😭⚡\n\nPara cazar necesitas *${staminaCost} de Resistencia*, pero solo te quedan *${user.rpg.stamina}*.\n¡Descansa un poco para recuperarte! 🛌💤`);
  }

  user.rpg.stamina -= staminaCost;

  await m.react("🏹");
  await m.reply(`Avanzando sigilosamente por el bosque... 🤫🌳\n¡Prepara la flecha y apunta con precisión! 🏹👀`);
  await new Promise((r) => setTimeout(r, 3000));

  const animals = [
    { name: "🐰 Conejo", item: "daging_kelinci", chance: 80, min: 1, max: 3, exp: 50, money: 500 },
    { name: "🦌 Ciervo", item: "daging_rusa", chance: 50, min: 1, max: 2, exp: 100, money: 1500 },
    { name: "🐗 Jabalí", item: "daging_babi", chance: 40, min: 1, max: 2, exp: 150, money: 2000 },
    { name: "🦊 Zorro", item: "bulu_rubah", chance: 30, min: 1, max: 1, exp: 200, money: 3000 },
    { name: "🐻 Oso", item: "cakar_beruang", chance: 15, min: 1, max: 1, exp: 500, money: 10000 },
    { name: "🦁 León", item: "taring_singa", chance: 5, min: 1, max: 1, exp: 1000, money: 25000 },
  ];

  const caught = animals.filter((a) => Math.random() * 100 <= a.chance);

  if (caught.length === 0) {
    await m.react("😢");
    db.save();
    return m.reply(`Vaya, ¡qué mala suerte hoy bro! 😭😭\n\nLos animales se escaparon todos, no conseguiste nada.\nY tu resistencia ya se redujo *-${staminaCost}* ⚡. Ten paciencia, ¡inténtalo más tarde! 🥺🌿`);
  }

  let results = [];
  let totalExp = 0;
  let totalMoney = 0;

  for (const animal of caught.slice(0, 3)) {
    const qty = Math.floor(Math.random() * (animal.max - animal.min + 1)) + animal.min;
    user.inventory[animal.item] = (user.inventory[animal.item] || 0) + qty;
    totalExp += animal.exp * qty;
    totalMoney += animal.money * qty;
    results.push({ name: animal.name, qty, money: animal.money * qty });
  }

  user.berry = (user.berry || 0) + totalMoney;
  const levelResult = await addExpWithLevelCheck(sock, m, db, user, totalExp);

  db.save();

  await m.react("✅");

  let txt = `¡CROOT! ¡Diste en el blanco bro! 🎯🏹\n\nVolviste a casa con estos trofeos de caza:\n`;
  for (const r of results) {
    txt += `• ${r.name}: *+${r.qty} unidades*\n`;
  }
  txt += `\n¡Los trofeos se vendieron automáticamente! 🎉\n`;
  txt += `💸 Berry: *+Rp ${totalMoney.toLocaleString("id-ID")}*\n`;
  txt += `📈 EXP: *+${totalExp}*\n`;
  txt += `⚡ Resistencia usada: *-${staminaCost}*\n\n`;
  txt += `¡Excelente, vuelve a cazar otro día bro! 🔥🥩`;

  m.reply(txt);
}

export { pluginConfig as config, handler };
