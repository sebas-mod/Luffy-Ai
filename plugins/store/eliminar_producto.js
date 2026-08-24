import { getDatabase } from "../../src/lib/luffy-database.js";

const pluginConfig = {
  name: "eliminar_producto",
  alias: ["delproduk", "delproduct", "deleteproduk"],
  category: "store",
  description: "🗑️ Eliminar producto de la tienda",
  usage: ".hapusproduk <numero>",
  example: ".hapusproduk 1",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  carne: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const products = db.setting("storeProducts") || [];

  if (products.length === 0) {
    return m.reply(
      `📭 *Aún no hay productos.*\n\nAgrega primero un producto con \`${m.prefix}agregar_producto\` ➕`,
    );
  }

  const idx = parseInt(m.text?.trim()) - 1;

  if (isNaN(idx) || idx < 0 || idx >= products.length) {
    let txt = `╭━━〔 🗑️ PRODUCTOS 〕━━╮\n\n🗑️ *Elige el Producto a Eliminar*\n\nEscribe \`${m.prefix}eliminar_producto <numero>\`\n\n`;
    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      const typeIcon = p.type === "fisik" ? "📦" : "🔑";
      const stockDisplay =
        p.type === "fisik"
          ? p.stock === -1
            ? "♾️"
            : `${p.stock} pcs`
          : `${p.stockItems?.length || 0} cuentas`;
      txt += `${typeIcon} *${i + 1}.* ${p.name} — Rp ${p.price.toLocaleString("id-ID")} (${stockDisplay})\n`;
    }
    return m.reply(txt);
  }

  const deleted = products.splice(idx, 1)[0];
  db.setting("storeProducts", products);

  const typeIcon = deleted.type === "fisik" ? "📦" : "🔑";

  await m.react("✅");
  return m.reply(
    `╭━━━〔 ✦ 〕━━━╮\n🗑️ *PRODUCTO ELIMINADO*\n\n` +
      `${typeIcon} Nombre: *${deleted.name}*\n` +
      `💰 Precio: *Rp ${deleted.price.toLocaleString("id-ID")}*\n` +
      `📊 Stock eliminado: *${deleted.type === "fisik" ? deleted.stock + " pcs" : (deleted.stockItems?.length || 0) + " cuentas"}*\n\n` +
      `╰━━━━━━━━━━━━╯\n\n` +
      `⚠️ _El producto fue eliminado permanentemente y no se puede recuperar._`,
  );
}

export { pluginConfig as config, handler };
