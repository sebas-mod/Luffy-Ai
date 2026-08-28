import { getDatabase } from "../../src/lib/luffy-database.js";
import config from "../../config.js";

const pluginConfig = {
  name: "lista_productos",
  alias: ["producto", "catalogo", "catalog"],
  category: "store",
  description: "🛍️ Ver la lista de productos disponibles",
  usage: ".lista_productos",
  example: ".lista_productos",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
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
      `🏪 *Productos Aún No Disponibles*\n\n` +
        `Actualmente no hay productos agregados por el admin 😔\n\n` +
        `Vuelve a revisar más tarde o contacta al admin para más información.\n\n` +
        `_Gracias por tu interés_ 🙏`,
    );
  }

  let txt = `╭━━〔 💎 TIENDA 〕━━╮\n\n🛍️ *LISTA DE PRODUCTOS*\n\n`;
  txt += `Estos son los productos disponibles actualmente 🎉\n`;
  txt += `Para comprar, escribe \`${m.prefix}comprar <numero>\`\n\n`;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const type = p.type || "digital";
    const typeIcon = type === "digital" ? "🔑" : "📦";
    const typeLabel = type === "digital" ? "Digital" : "Físico";

    let stockDisplay;
    if (type === "digital") {
      const count = p.stockItems?.length || 0;
      stockDisplay = p.stock === -1 ? "♾️ Unlimited" : `${count} cuentas`;
    } else {
      stockDisplay = p.stock === -1 ? "♾️ Unlimited" : `${p.stock} pcs`;
    }

    const isAvailable =
      type === "digital"
        ? p.stockItems?.length > 0 || p.stock === -1
        : p.stock > 0 || p.stock === -1;
    const statusIcon = isAvailable ? "✅" : "❌";

    const priceStr = formatPrice(p.price);
    const originalPriceStr = p.originalPrice
      ? `~~${formatPrice(p.originalPrice)}~~ `
      : "";

    txt += `*${String(i + 1).padStart(2, "0")} ›* ${typeIcon} ${p.name}\n`;
    txt += `   💰 ${originalPriceStr}${priceStr}\n`;
    txt += `   📊 Stock: ${stockDisplay} ${statusIcon}\n`;
    txt += `   🏷️ Tipo: ${typeLabel}\n`;
    if (p.description)
      txt += `   📝 _${p.description.substring(0, 60)}${p.description.length > 60 ? "..." : ""}_\n`;
    txt += `\n`;
  }

  txt += `╰━━━━━━━━━━━━╯\n\n💡 _Escribe \`${m.prefix}comprar <numero>\` para pedir el producto_`;

  if (m.isGroup) {
    const saluranId = config.saluran?.canalId || "120363400911374213@newsletter";
    const saluranName = config.saluran?.name || config.bot?.name || "Luffy-Ai";
    await sock.sendMessage(
      m.chat,
      {
        text: txt,
        contextInfo: {
          forwardingScore: 9999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: saluranId,
            newsletterName: saluranName,
            serverMessageId: 127,
          },
        },
      },
      { quoted: m },
    );
  } else {
    await m.reply(txt);
  }
}

export { pluginConfig as config, handler };
