import { getDatabase } from "../../src/lib/luffy-database.js";
import config from "../../config.js";

const pluginConfig = {
  name: "done",
  alias: ["terminado", "enviar", "confirm"],
  category: "store",
  description:
    "✅ Confirmar transacción completada y enviar datos al comprador (responde el mensaje del comprador)",
  usage: ".done <numero_trx> (responde el mensaje del comprador)",
  example: ".done TRX-001",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  carne: 0,
  isEnabled: true,
};

function formatPrice(n) {
  return "Rp " + n.toLocaleString("id-ID");
}

async function handler(m, { sock }) {
  const db = getDatabase();
  const trxId = m.text?.trim();

  if (!trxId) {
    return m.reply(
      `✅ *CONFIRMACIÓN DE TRANSACCIÓN*\n\n` +
        `📋 Formato: \`${m.prefix}done <numero_trx>\`\n\n` +
        `📌 *Cómo usarlo:*\n` +
        `1️⃣ Responde el mensaje del comprador (el que ya pagó 💰)\n` +
        `2️⃣ Escribe \`${m.prefix}done TRX-001\`\n\n` +
        `🤖 El bot automáticamente:\n` +
        `• Enviará los datos del producto al número del comprador 📤\n` +
        `• Marcará la transacción como completada ✅\n` +
        `• Enviará notificación al comprador 🔔\n\n` +
        `🧾 *El número de transacción* se obtiene cuando el comprador usa \`${m.prefix}comprar <numero_producto>\`\n\n` +
        `⚠️ _Asegúrate de haber recibido el comprobante de pago antes de confirmar_ 📸`,
    );
  }

  const transactions = db.setting("storeTransactions") || {};
  const trx = transactions[trxId];

  if (!trx) {
    const allTrx = Object.values(transactions);
    const pending = allTrx.filter((t) => t.status === "pending");

    if (pending.length > 0) {
      let txt = `❌ *Transacción \`${trxId}\` no encontrada.*\n\n`;
      txt += `⏳ *Transacciones pendientes actuales:*\n\n`;
      for (const t of pending) {
        const typeIcon = t.productType === "fisik" ? "📦" : "🔑";
        const time = new Date(t.createdAt).toLocaleString("id-ID", {
          timeZone: "Asia/Jakarta",
        });
        txt += `• 🧾 \`${t.trxId}\` — ${typeIcon} ${t.productName} (${formatPrice(t.price)}) por ${t.buyerName}\n`;
        txt += `  🕐 _${time}_\n\n`;
      }
      txt += `📌 Responde el mensaje del comprador y escribe: \`${m.prefix}done <numero_trx>\``;
      return m.reply(txt);
    }

    return m.reply(
      `❌ *Transacción \`${trxId}\` no encontrada.*\n\n` +
        `📭 No hay transacciones pendientes actualmente.\n\n` +
        `_El comprador puede hacer un pedido con \`${m.prefix}comprar <numero_producto>\`_ 🛒`,
    );
  }

  if (trx.status === "completed") {
    return m.reply(
      `⚠️ *La transacción ya está completada.*\n\n` +
        `🧾 TRX: \`${trxId}\`\n` +
        `${trx.productType === "fisik" ? "📦" : "🔑"} Producto: *${trx.productName}*\n` +
        `👤 Comprador: ${trx.buyerName}\n` +
        `✅ Completada el: ${new Date(trx.completedAt).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}\n\n` +
        `_Esta transacción ya fue confirmada anteriormente_ 🔒`,
    );
  }

  let buyerJid = trx.buyerJid;

  if (m.quoted && m.isGroup) {
    const quotedSender = m.quoted.sender || m.quotedSender;
    if (quotedSender && quotedSender !== m.sender) {
      buyerJid = quotedSender;
    }
  }

  if (!buyerJid) {
    return m.reply(
      `❌ *No se pudo encontrar el número del comprador.*\n\nEsta transacción no tiene datos de comprador válidos 📱`,
    );
  }

  const buyerNum = buyerJid.split("@")[0];
  const products = db.setting("storeProducts") || [];
  const productIdx = products.findIndex((p) => p.id === trx.productId);
  const product = productIdx !== -1 ? products[productIdx] : null;

  let stockItemDetail = null;

  if (product && trx.productType !== "fisik") {
    if (product.stockItems?.length > 0) {
      const item = product.stockItems.shift();
      stockItemDetail = item.detail;
      product.stock = product.stockItems.length;
      db.setting("storeProducts", products);
    } else if (product?.detail) {
      stockItemDetail = product.detail;
    }
  }

  if (product && trx.productType === "fisik") {
    if (product.stock !== -1 && product.stock > 0) {
      product.stock -= 1;
      db.setting("storeProducts", products);
    }
  }

  trx.status = "completed";
  trx.completedAt = new Date().toISOString();
  trx.buyerJid = buyerJid;
  trx.stockItemDetail = stockItemDetail;
  transactions[trxId] = trx;
  db.setting("storeTransactions", transactions);

  const now = new Date();
  const timeStr = now.toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const saluranId = config.saluran?.id || "120363400911374213@newsletter";
  const saluranName = config.saluran?.name || config.bot?.name || "Luffy-Ai";

  const typeIcon = trx.productType === "fisik" ? "📦" : "🔑";
  const typeLabel = trx.productType === "fisik" ? "Físico" : "Digital";

  let invoiceTxt = `🎉 *TRANSACCIÓN EXITOSA*\n\n`;
  invoiceTxt += `🕐 Hora: \`${timeStr}\`\n`;
  invoiceTxt += `✅ Estado: *Exitosa*\n\n`;
  invoiceTxt += `📦 *Detalle del Pedido:*\n`;
  invoiceTxt += `${typeIcon} Producto: *${trx.productName}*\n`;
  invoiceTxt += `🏷️ Tipo: *${typeLabel}*\n`;
  invoiceTxt += `💰 Precio: *${formatPrice(trx.price)}*\n\n`;

  if (stockItemDetail) {
    invoiceTxt += `🔑 *Datos del Producto:*\n\`\`\`\n${stockItemDetail}\n\`\`\`\n\n`;
    invoiceTxt += `⚠️ _Guarda bien los datos anteriores. No los compartas con nadie_ 🔒\n\n`;
  } else if (trx.productType === "fisik") {
    invoiceTxt += `📦 _El producto físico será enviado por el admin. Confirma la dirección de envío._\n\n`;
  }

  invoiceTxt += `🙏 ¡Gracias por comprar! _Hasta el próximo pedido_ ✨`;

  try {
    await sock.sendMessage(buyerJid, {
      text: invoiceTxt,
      contextInfo: {
        forwardingScore: 9999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: saluranId,
          newsletterName: saluranName,
          serverMessageId: 127,
        },
      },
    });
  } catch (e) {
    console.error("[Done] Failed to send to buyer:", buyerJid, e.message);
    await m.reply(
      `❌ *Error al enviar al comprador.*\n\n📱 Número: \`${buyerNum}\`\n\n_Probablemente el comprador aún no guarda el número del bot. Envía manualmente los siguientes datos:_\n\n${invoiceTxt}`,
    );
  }

  if (trx.purchaseIsGroup && trx.purchaseChat) {
    try {
      const buyerMention = `@${buyerNum}`;
      await sock.sendMessage(trx.purchaseChat, {
        text:
          `🎉 *¡Pedido Completado!*\n\n` +
          `${buyerMention} tu compra de *${trx.productName}* ya fue confirmada ✅\n` +
          `💰 Precio: *${formatPrice(trx.price)}*\n\n` +
          `📦 Los datos del producto ya fueron enviados a tu chat privado. ¡Revisa el mensaje del bot! 📱\n\n` +
          `🙏 ¡Gracias por comprar!`,
        mentions: [buyerJid],
      });
    } catch (e) {
      console.error(
        "[Done] Failed to notify group:",
        trx.purchaseChat,
        e.message,
      );
    }
  }

  await m.react("✅");

  let confirmTxt = `✅ *TRANSACCIÓN CONFIRMADA*\n\n`;
  confirmTxt += `🧾 TRX: \`${trxId}\`\n`;
  confirmTxt += `${typeIcon} Producto: *${trx.productName}*\n`;
  confirmTxt += `👤 Comprador: *${trx.buyerName}*\n`;
  confirmTxt += `📱 Número: \`${buyerNum}\`\n`;
  confirmTxt += `💰 Precio: *${formatPrice(trx.price)}*\n`;
  if (product) {
    const stockDisplay =
      product.type === "fisik"
        ? `${product.stock === -1 ? "♾️ Unlimited" : product.stock + " pcs"}`
        : `${product.stockItems?.length || 0} cuentas`;
    confirmTxt += `📊 Stock restante: *${stockDisplay}*\n`;
  }
  confirmTxt += `\n📤 _Los datos fueron enviados al número del comprador_ ✅`;

  return m.reply(confirmTxt);
}

export { pluginConfig as config, handler };
