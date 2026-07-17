import { getDatabase } from "../../src/lib/ourin-database.js";

const pluginConfig = {
  name: "transfer",
  alias: ["tf", "kirim", "pay"],
  category: "rpg",
  description: "Transferir dinero u objetos a otro usuario",
  usage: ".transfer <money/nombre_item> <cantidad> @user",
  example: ".transfer money 10000 @tag",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

function handler(m, { sock }) {
  const db = getDatabase();
  const sender = db.getUser(m.sender);

  const args = m.args || [];
  if (args.length < 3) {
    let txt = `🏦 *BANK SENTRAL RPG* 🏦\n\n`;
    txt += `Layanan pengiriman Belly & Barang Antar-Player!\n\n`;
    txt += `*Format Pengiriman:*\n`;
    txt += `👉 \`.transfer money 10000 @user\` (Untuk Belly)\n`;
    txt += `👉 \`.transfer potion 5 @user\` (Untuk Item)\n`;
    return m.reply(txt);
  }

  const type = args[0].toLowerCase();
  const amount = parseInt(args[1]);
  const target = m.mentionedJid?.[0] || m.quoted?.sender;

  if (!target) {
    return m.reply(`¡Dirección del paquete no clara, jefe! ¡Etiqueta al usuario primero! 📦🔍`);
  }

  if (target === m.sender) {
    return m.reply(`¿Transferir a tu propia bolsa? ¡Tienes demasiado tiempo libre! 😂❌`);
  }

  if (!amount || amount <= 0) {
    return m.reply(`¡Oye jefe! ¿Enviar solo viento? ¡La cantidad debe ser mayor a *0*! 🌬️`);
  }

  const recipient = db.getUser(target) || db.setUser(target);

  if (type === "money" || type === "balance" || type === "belly") {
    if ((sender.belly || 0) < amount) {
      return m.reply(`¡TRANSACCIÓN RECHAZADA! ❌\nSaldo insuficiente. Saldo: *Belly ${(sender.belly || 0).toLocaleString("es-ES")}* | Envío: *Belly ${amount.toLocaleString("es-ES")}* 💸`);
    }

    sender.belly -= amount;
    recipient.belly = (recipient.belly || 0) + amount;

    db.setUser(m.sender, sender);
    db.setUser(target, recipient);
    db.save();
    
    let txt = `💸 *¡TRANSFERENCIA EXITOSA!* 💸\n\n`;
    txt += `El Banco Central ha enviado los fondos:\n`;
    txt += `💳 Monto: *Belly ${amount.toLocaleString("es-ES")}*\n`;
    txt += `👤 Destinatario: @${target.split("@")[0]}\n\n`;
    txt += `> _"¡Gracias por usar el servicio del Banco Bot!"_ 🏦✨`;

    return m.reply(txt, { mentions: [target] });
  } else {
    sender.inventory = sender.inventory || {};
    recipient.inventory = recipient.inventory || {};

    if ((sender.inventory[type] || 0) < amount) {
      return m.reply(`¡Paquete fallido! ❌\nSolo tienes *${sender.inventory[type] || 0}* piezas de *${type}* en tu inventario. ¿De dónde sacas *${amount}* para enviar? 📦`);
    }

    sender.inventory[type] -= amount;
    recipient.inventory[type] = (recipient.inventory[type] || 0) + amount;

    db.setUser(m.sender, sender);
    db.setUser(target, recipient);
    db.save();

    let txt = `📦 *¡¡PAQUETE ENTREGADO!!* 📦\n\n`;
    txt += `El repartidor entregó el paquete:\n`;
    txt += `🎁 Contenido: *${type}* (x${amount})\n`;
    txt += `👤 Destinatario: @${target.split("@")[0]}\n\n`;
    txt += `> _"¡¡Paqueteeeee!!" - Repartidor Bot_ 🛵💨`;

    return m.reply(txt, { mentions: [target] });
  }
}

export { pluginConfig as config, handler };
