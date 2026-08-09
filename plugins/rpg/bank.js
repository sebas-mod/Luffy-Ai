import { getDatabase } from "../../src/lib/luffy-database.js";

const pluginConfig = {
  name: "bank",
  alias: ["atm", "nabung", "deposit", "tarik", "withdraw"],
  category: "rpg",
  description: "Bank system untuk menyimpan uang aman dari rampok",
  usage: ".bank <deposit/withdraw> <jumlah>",
  example: ".bank deposit 10000",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  carne: 0,
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

  const currentBalance = db.db.data.users[cleanJid].berry || 0;
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

    if (!amount || amount <= 0) return m.reply(`¡Oye bro, ingresa una cantidad de berry válida! No vas a ahorrar una cifra fantasma 😂💸`);
    if (currentBalance < amount) return m.reply(`¡Ey, tu dinero en *efectivo* no alcanza bro! 😭\nEn tu cartera solo hay *Rp ${currentBalance.toLocaleString("id-ID")}*. ¡Ve a buscar dinero! 🏃💨`);

    db.db.data.users[cleanJid].berry = currentBalance - amount;
    db.db.data.users[cleanJid].rpg.bank = currentBank + amount;

    await db.save();

    const newBank = db.db.data.users[cleanJid].rpg.bank;
    return m.reply(`¡Gracias por ahorrar en el Banco RPG! 🏦💖\n\n✅ Depósito exitoso: *Rp ${amount.toLocaleString("id-ID")}*\n💳 Saldo de Ahorros: *Rp ${newBank.toLocaleString("id-ID")}*\n\n¡Guardamos tu dinero de forma segura! 🔒✨`);
  }

  if (action === "withdraw" || action === "tarik") {
    let amount = 0;
    if (amountStr === "all") {
      amount = currentBank;
    } else {
      amount = parseInt(amountStr);
    }

    if (!amount || amount <= 0) return m.reply(`¡Oye bro, ingresa una cantidad de berry válida! ¿Quieres retirar viento? 😂💸`);
    if (currentBank < amount) return m.reply(`Vaya bro, tu saldo de ahorros no alcanza! 😭\nEn tu cuenta solo hay *Rp ${currentBank.toLocaleString("id-ID")}*. ¡No inventes! 🫣`);

    db.db.data.users[cleanJid].rpg.bank = currentBank - amount;
    db.db.data.users[cleanJid].berry = currentBalance + amount;

    await db.save();

    const newBalance = db.db.data.users[cleanJid].berry;
    return m.reply(`¡El dinero fue retirado con éxito bro! 🏧💸\n\n✅ Retiro: *Rp ${amount.toLocaleString("id-ID")}*\n💰 Dinero en Efectivo: *Rp ${newBalance.toLocaleString("id-ID")}*\n\n¡No lo gastes de más! 🛍️✨`);
  }

  let txt = `¡Hola bro! ¡Bienvenido al Banco RPG! 🏦✨\n¿Quieres revisar tu saldo o necesitas algo más?\n\n`;
  txt += `💰 Dinero en Cartera: *Rp ${currentBalance.toLocaleString("id-ID")}*\n`;
  txt += `💳 Saldo de Ahorros: *Rp ${currentBank.toLocaleString("id-ID")}*\n\n`;
  txt += `*Servicios del Banco:* 💁‍♀️\n`;
  txt += `Ahorrar: \`.bank deposit <cantidad>\`\n`;
  txt += `Retiro en efectivo: \`.bank withdraw <cantidad>\`\n\n`;
  txt += `*(¡Usa la palabra 'all' para ahorrar/retirar todo de una vez!)* 🚀`;

  await m.reply(txt);
}

export { pluginConfig as config, handler };
