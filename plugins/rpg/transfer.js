import { getDatabase } from "../../src/lib/luffy-database.js";

const pluginConfig = {
  name: "transfer",
  alias: ["tf", "kirim", "pay"],
  category: "rpg",
  description: "Transferir dinero u objetos a otro usuario",
  usage: ".transfer <money/nama_item> <jumlah> @user",
  example: ".transfer money 10000 @tag",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  carne: 0,
  isEnabled: true,
};

function handler(m, { sock }) {
  const db = getDatabase();
  const sender = db.getUser(m.sender);

  const args = m.args || [];
  if (args.length < 3) {
    let txt = `🏦 *BANCO CENTRAL RPG* 🏦\n\n`;
    txt += `Servicio de envío de Berry y Objetos entre Jugadores!\n\n`;
    txt += `*Formato de Envío:*\n`;
    txt += `👉 \`.transfer money 10000 @user\` (Para Berry)\n`;
    txt += `👉 \`.transfer potion 5 @user\` (Para Ítems)\n`;
    return m.reply(txt);
  }

  const type = args[0].toLowerCase();
  const amount = parseInt(args[1]);
  const target = m.mentionedJid?.[0] || m.quoted?.sender;

  if (!target) {
    return m.reply(`¡La dirección del paquete no está clara jefe! ¡Etiqueta al usuario que quiere recibirlo! 📦🔍`);
  }

  if (target === m.sender) {
    return m.reply(`¿Transferir a tu propio bolsillo? ¿No tienes nada mejor que hacer? 😂❌`);
  }

  if (!amount || amount <= 0) {
    return m.reply(`¡Oye jefe! ¿Vas a enviar puro aire? El monto debe ser mayor que *0*! 🌬️`);
  }

  const recipient = db.getUser(target) || db.setUser(target);

  if (type === "money" || type === "balance" || type === "berry") {
    if ((sender.berry || 0) < amount) {
      return m.reply(`¡Transacción RECHAZADA! ❌\nTu saldo no alcanza. Saldo: *Rp ${(sender.berry || 0).toLocaleString("id-ID")}* | Quieres transferir: *Rp ${amount.toLocaleString("id-ID")}* 💸`);
    }

    sender.berry -= amount;
    recipient.berry = (recipient.berry || 0) + amount;

    db.setUser(m.sender, sender);
    db.setUser(target, recipient);
    db.save();
    
    let txt = `💸 *¡TRANSFERENCIA EXITOSA!* 💸\n\n`;
    txt += `El Banco Central ha enviado los fondos:\n`;
    txt += `💳 Monto: *Rp ${amount.toLocaleString("id-ID")}*\n`;
    txt += `👤 Destinatario: @${target.split("@")[0]}\n\n`;
    txt += `> _"¡Gracias por usar los servicios del Banco Bot!"_ 🏦✨`;

    return m.reply(txt, { mentions: [target] });
  } else {
    sender.inventory = sender.inventory || {};
    recipient.inventory = recipient.inventory || {};

    if ((sender.inventory[type] || 0) < amount) {
      return m.reply(`¡El paquete no pudo procesarse! ❌\nEl ítem *${type}* en tu almacén solo tiene *${sender.inventory[type] || 0}* pcs. ¿De dónde vas a sacar los *${amount}*? 📦`);
    }

    sender.inventory[type] -= amount;
    recipient.inventory[type] = (recipient.inventory[type] || 0) + amount;

    db.setUser(m.sender, sender);
    db.setUser(target, recipient);
    db.save();

    let txt = `📦 *¡PAQUETE ENTREGADO!* 📦\n\n`;
    txt += `El mensajero logró entregar el artículo:\n`;
    txt += `🎁 Contenido: *${type}* (x${amount})\n`;
    txt += `👤 Destinatario: @${target.split("@")[0]}\n\n`;
    txt += `> _"¡Paqueeeeete!!" - El Mensajero Bot_ 🛵💨`;

    return m.reply(txt, { mentions: [target] });
  }
}

export { pluginConfig as config, handler };
