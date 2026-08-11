import { getDatabase } from "../../src/lib/luffy-database.js";
import config from "../../config.js";

const pluginConfig = {
  name: "comprar",
  alias: ["order", "pesan", "buy"],
  category: "store",
  description: "🛒 Pedir un producto y obtener número de transacción",
  usage: ".comprar <numero_producto>",
  example: ".comprar 1",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  carne: 0,
  isEnabled: true,
};

function formatPrice(n) {
  return "Rp " + n.toLocaleString("id-ID");
}

async function handler(m, { sock }) {
  const db = getDatabase();
  const products = db.setting("storeProducts") || [];

  if (products.length === 0) {
    return m.reply(
      `📭 *Aún no hay productos disponibles.*\n\nEscribe \`${m.prefix}lista_productos\` para ver la lista de productos 🛍️`,
    );
  }

  const args = m.text?.trim().split(/\s+/) || [];
  const idx = parseInt(args[0]) - 1;

  if (isNaN(idx) || idx < 0 || idx >= products.length) {
    let txt = `🛒 *Elige Producto*\n\nEscribe \`${m.prefix}comprar <numero>\` para pedir.\n\n`;
    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      const typeIcon = p.type === "fisik" ? "📦" : "🔑";
      const isAvailable =
        p.type === "fisik"
          ? p.stock > 0 || p.stock === -1
          : p.stockItems?.length > 0 || p.stock === -1;
      txt += `${typeIcon} *${i + 1}.* ${p.name} — ${formatPrice(p.price)} ${isAvailable ? "✅" : "❌"}\n`;
    }
    return m.reply(txt);
  }

  const product = products[idx];
  const typeIcon = product.type === "fisik" ? "📦" : "🔑";
  const typeLabel = product.type === "fisik" ? "Físico" : "Digital";

  const isAvailable =
    product.type === "fisik"
      ? product.stock > 0 || product.stock === -1
      : product.stockItems?.length > 0 || product.stock === -1;

  if (!isAvailable) {
    return m.reply(
      `❌ *Stock Agotado*\n\n` +
        `${typeIcon} El producto *${product.name}* no está disponible actualmente 😔\n\n` +
        `Contacta al admin o vuelve a revisar más tarde.\n\n` +
        `_Repondremos el stock pronto_ 🙏`,
    );
  }

  const transactions = db.setting("storeTransactions") || {};
  let trxCounter = db.setting("storeTrxCounter") || 0;
  trxCounter++;
  const trxId = `TRX-${String(trxCounter).padStart(3, "0")}`;
  db.setting("storeTrxCounter", trxCounter);

  transactions[trxId] = {
    trxId,
    buyerJid: m.sender,
    buyerName: m.pushName || m.sender.split("@")[0],
    purchaseChat: m.chat,
    purchaseIsGroup: m.isGroup,
    productIndex: idx,
    productId: product.id,
    productName: product.name,
    productType: product.type,
    price: product.price,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  db.setting("storeTransactions", transactions);

  const ownerNumbers = config.owner?.number || [];
  const ownerJid =
    ownerNumbers.length > 0
      ? `${String(ownerNumbers[0]).replace(/[^0-9]/g, "")}@s.whatsapp.net`
      : null;

  let txt = `🛒 *PEDIDO CREADO*\n\n`;
  txt += `🧾 Número de Transacción: \`${trxId}\`\n\n`;
  txt += `📦 *Detalle del Pedido:*\n`;
  txt += `${typeIcon} Producto: *${product.name}*\n`;
  txt += `🏷️ Tipo: *${typeLabel}*\n`;
  txt += `💰 Precio: *${formatPrice(product.price)}*\n`;
  if (product.originalPrice)
    txt += `🏷️ ~~${formatPrice(product.originalPrice)}~~\n`;
  if (product.description) txt += `📝 _${product.description}_\n`;
  txt += `\n`;

  if (product.image) {
    await sock.sendMessage(
      m.chat,
      { image: { url: product.image }, caption: txt },
      { quoted: m },
    );
  } else if (product.video) {
    await sock.sendMessage(
      m.chat,
      { video: { url: product.video }, caption: txt },
      { quoted: m },
    );
  } else {
    await m.reply(txt);
  }

  let paymentTxt = `💳 *INSTRUCCIONES DE PAGO*\n\n`;
  paymentTxt += `1️⃣ Transfiere *${formatPrice(product.price)}* al número del admin 💰\n`;

  if (config.store?.payment?.length) {
    for (const p of config.store.payment) {
      paymentTxt += `   🏦 ${p.name}: \`${p.number}\` a nombre de ${p.holder}\n`;
    }
  }
  if (config.store?.qris) {
    paymentTxt += `   📱 QRIS: Disponible\n`;
  }

  paymentTxt += `\n2️⃣ Después de transferir, envía el *comprobante de pago* al admin 📸\n`;
  paymentTxt += `3️⃣ El admin verificará y enviará los datos del producto ✅\n\n`;
  paymentTxt += `🧾 Tu número de transacción: \`${trxId}\`\n`;
  paymentTxt += `_Guarda este número como referencia_ 📌`;

  if (ownerJid) {
    paymentTxt += `\n\n📞 Contacta al admin: wa.me/${ownerJid.split("@")[0]}`;
  }

  await m.reply(paymentTxt);

  if (ownerJid) {
    const buyerNum = m.sender.split("@")[0];
    await sock.sendMessage(ownerJid, {
      text:
        `🛒 *NUEVO PEDIDO*\n\n` +
        `🧾 TRX: \`${trxId}\`\n` +
        `👤 Comprador: *${m.pushName || buyerNum}*\n` +
        `📱 Número: \`${buyerNum}\`\n` +
        `${typeIcon} Producto: *${product.name}*\n` +
        `💰 Precio: *${formatPrice(product.price)}*\n\n` +
        `_Después de recibir el comprobante de transferencia 📸, responde el mensaje del comprador y escribe \`${m.prefix}done ${trxId}\`_ ✅`,
    });
  }
}

export { pluginConfig as config, handler };
