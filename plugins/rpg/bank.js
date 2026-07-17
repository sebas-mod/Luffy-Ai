import { getDatabase } from "../../src/lib/ourin-database.js";

const pluginConfig = {
  name: "bank",
  alias: ["atm", "nabung", "deposit", "tarik", "withdraw"],
  category: "rpg",
  description: "Sistema bancario para guardar dinero a salvo de los ladrones",
  usage: ".bank <deposit/withdraw> <cantidad>",
  example: ".bank deposit 10000",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const cleanJid = m.sender.replace(/@.+/g, "");

  let user = db.getUser(m.sender);
  if (!user) {
    user = db.setUser(m.sender, {});
  }

  if (!db.db.data.users[cleanJid].rpg) {
    db.db.data.users[cleanJid].rpg = {};
  }
  if (typeof db.db.data.users[cleanJid].rpg.bank !== "number") {
    db.db.data.users[cleanJid].rpg.bank = 0;
  }

  const currentBalance = db.db.data.users[cleanJid].belly || 0;
  const currentBank = db.db.data.users[cleanJid].rpg.bank || 0;

  const args = m.args || [];
  const action = args[0]?.toLowerCase();
  const amountStr = args[1];

  if (action === "deposit" || action === "depo") {
    let amount = 0;
    if (amountStr === "all") {
      amount = currentBalance;
    } else {
      amount = parseInt(amountStr);
    }

    if (!amount || amount <= 0) return m.reply(`¡Oye, ingresa un número de monedas válido! ¿Vas a guardar aire? 😂💸`);
    if (currentBalance < amount) return m.reply(`¡Eh, no tienes suficiente dinero en efectivo! 😭\nEn tu billetera solo hay *Belly ${currentBalance.toLocaleString("es-ES")}*. ¡Ve a buscar más! 🏃💨`);

    db.db.data.users[cleanJid].belly = currentBalance - amount;
    db.db.data.users[cleanJid].rpg.bank = currentBank + amount;

    await db.save();

    const newBank = db.db.data.users[cleanJid].rpg.bank;
    return m.reply(`¡Gracias por depositar en el Banco RPG! 🏦💖\n\n✅ Depósito exitoso: *Belly ${amount.toLocaleString("es-ES")}*\n💳 Saldo Ahorrado: *Belly ${newBank.toLocaleString("es-ES")}*\n\n¡Tu dinero está a salvo! 🔒✨`);
  }

  if (action === "withdraw" || action === "tarik") {
    let amount = 0;
    if (amountStr === "all") {
      amount = currentBank;
    } else {
      amount = parseInt(amountStr);
    }

    if (!amount || amount <= 0) return m.reply(`¡Oye, ingresa un número válido! ¿Vas a retirar viento? 😂💸`);
    if (currentBank < amount) return m.reply(`¡No tienes suficiente en tu cuenta! 😭\nSolo hay *Belly ${currentBank.toLocaleString("es-ES")}*. ¡No pidas lo imposible! 🫣`);

    db.db.data.users[cleanJid].rpg.bank = currentBank - amount;
    db.db.data.users[cleanJid].belly = currentBalance + amount;

    await db.save();

    const newBalance = db.db.data.users[cleanJid].belly;
    return m.reply(`¡Dinero retirado con éxito! 🏧💸\n\n✅ Retiro: *Belly ${amount.toLocaleString("es-ES")}*\n💰 Efectivo: *Belly ${newBalance.toLocaleString("es-ES")}*\n\n¡No lo gastes todo de una vez! 🛍️✨`);
  }

  let txt = `¡Hola! Bienvenido al Banco RPG! 🏦✨\n¿Quieres verificar tu saldo o necesitas algo?\n\n`;
  txt += `💰 Dinero en Billetera: *Belly ${currentBalance.toLocaleString("es-ES")}*\n`;
  txt += `💳 Saldo Ahorrado: *Belly ${currentBank.toLocaleString("es-ES")}*\n\n`;
  txt += `*Servicios del Banco:* 💁‍♀️\n`;
  txt += `Ahorrar: \`.bank deposit <cantidad>\`\n`;
  txt += `Retirar: \`.bank withdraw <cantidad>\`\n\n`;
  txt += `*(¡Usa 'all' si quieres ahorrar/retirar todo de una vez!)* 🚀`;

  await m.reply(txt);
}

export { pluginConfig as config, handler };
