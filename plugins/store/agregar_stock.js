import { getDatabase } from "../../src/lib/luffy-database.js";

const pluginConfig = {
  name: "agregar_stock",
  alias: ["addstock", "importstok", "importstock"],
  category: "store",
  description: "📦 Agregar stock de artículos al producto (solo en chat privado)",
  usage:
    ".addstok <numero_producto>|<detalle> o .addstok <numero> <cantidad> (físico)",
  example: ".addstok 1|Email: user@mail.com;;Password: pass123",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: true,
  cooldown: 3,
  carne: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  if (m.isGroup) {
    return m.reply(
      `🚫 *Acceso Denegado*\n\n` +
        `Para proteger la privacidad de los datos de stock 🛡️, solo se puede agregar stock en el *chat privado*.\n\n` +
        `Contacta al bot directamente 📱`,
    );
  }

  const db = getDatabase();
  const products = db.setting("storeProducts") || [];

  if (products.length === 0) {
    return m.reply(
      `📭 *Aún no hay productos.*\n\nAgrega primero un producto: \`${m.prefix}agregar_producto\` ➕`,
    );
  }

  const text = m.text?.trim() || "";
  const pipeIdx = text.indexOf("|");

  if (pipeIdx === -1) {
    const productNo = parseInt(text.split(/\s+/)[0]) - 1;

    if (!isNaN(productNo) && productNo >= 0 && productNo < products.length) {
      const product = products[productNo];

      if (product.type === "fisik") {
        const addCount = parseInt(text.split(/\s+/)[1]);
        if (!isNaN(addCount) && addCount > 0) {
          product.stock = (product.stock === -1 ? 0 : product.stock) + addCount;
          db.setting("storeProducts", products);
          await m.react("✅");
          return m.reply(
            `📦 *STOCK FÍSICO AGREGADO*\n\n` +
              `🏷️ Producto: *${product.name}*\n` +
              `➕ Agregados: *${addCount} pcs*\n` +
              `📊 Stock total: *${product.stock} pcs*\n\n` +
              `_Agregar más: \`${m.prefix}agregar_stock ${productNo + 1} <cantidad>\`_`,
          );
        }

        return m.reply(
          `📦 *AGREGAR STOCK FÍSICO*\n\n` +
            `El producto *${product.name}* es de tipo **Físico** 📦\n\n` +
            `Formato: \`${m.prefix}agregar_stock ${productNo + 1} <cantidad>\`\n\n` +
            `📝 *Ejemplo:*\n` +
            `\`${m.prefix}agregar_stock ${productNo + 1} 8\` — Agregar 8 pcs\n\n` +
            `Stock actual: *${product.stock === -1 ? "♾️ Unlimited" : product.stock + " pcs"}*`,
        );
      }

      if (m.quoted) {
        const quotedType = m.quoted.type || m.quoted.mtype;
        const isDocument =
          quotedType === "documentMessage" ||
          quotedType === "documentWithCaptionMessage";
        const fileName =
          m.quoted.fileName ||
          m.quoted.message?.documentMessage?.fileName ||
          "";

        if (isDocument && fileName.toLowerCase().endsWith(".txt")) {
          await m.reply(`⏳ _Procesando archivo..._`);
          let fileBuffer;
          try {
            fileBuffer = await m.quoted.download();
          } catch {
            return m.reply(
              `❌ *Error al leer el archivo.*\n\nAsegúrate de que el archivo no esté vacío y se pueda descargar 📄`,
            );
          }
          if (!fileBuffer || fileBuffer.length === 0)
            return m.reply(`❌ *Archivo vacío.* 📄`);

          const fileContent = fileBuffer.toString("utf-8").trim();
          const lines = [];
          if (fileContent.includes(";;")) {
            const rawLines = fileContent
              .split(/[\n\r]+/)
              .map((l) => l.trim())
              .filter((l) => l.length > 0);
            for (const raw of rawLines) {
              const subItems = raw
                .split(/\s{2,}/)
                .map((s) => s.trim())
                .filter((s) => s.length >= 3);
              if (subItems.length > 1) lines.push(...subItems);
              else lines.push(raw);
            }
          } else {
            const tokens = fileContent
              .split(/[\s\n\r]+/)
              .map((t) => t.trim())
              .filter((t) => t.length >= 3);
            lines.push(...tokens);
          }
          if (lines.length === 0)
            return m.reply(`❌ *El archivo no contiene datos válidos.* 📄`);
          if (lines.length > 1000)
            return m.reply(
              `❌ *Demasiados artículos.* Máximo 1.000 por importación 📄`,
            );

          if (!product.stockItems) product.stockItems = [];
          const existingDetails = new Set(
            product.stockItems.map((item) => item.detail),
          );
          let added = 0,
            skipped = 0;

          for (let i = 0; i < lines.length; i++) {
            const detail = lines[i].replace(/;;/g, "\n");
            if (detail.length < 3) continue;
            if (existingDetails.has(detail)) {
              skipped++;
              continue;
            }
            product.stockItems.push({
              id: Date.now() + i,
              detail,
              addedAt: new Date().toISOString(),
            });
            existingDetails.add(detail);
            added++;
          }

          product.stock = product.stockItems.length;
          db.setting("storeProducts", products);
          await m.react("✅");
          return m.reply(
            `✅ *IMPORTACIÓN DE STOCK COMPLETADA*\n\n` +
              `🏷️ Producto: *${product.name}*\n` +
              `➕ Agregados: *${added}* cuentas 🔑\n` +
              (skipped > 0 ? `⏭️ Duplicados omitidos: *${skipped}*\n` : "") +
              `\n📊 Stock total: *${product.stockItems.length}* cuentas\n\n` +
              `_Ver la lista de stock: \`${m.prefix}lista_stock ${productNo + 1}\`_`,
          );
        }
      }
    }

    return m.reply(
      `📦 *AGREGAR STOCK*\n\n` +
        `🔑 *Producto Digital* — Agregar datos de cuenta/key:\n` +
        `\`${m.prefix}agregar_stock <numero_producto>|<detalle>\`\n\n` +
        `📄 *Importar desde archivo .txt:*\n` +
        `\`${m.prefix}agregar_stock <numero_producto>\` (responde el archivo .txt)\n\n` +
        `📦 *Producto Físico* — Agregar cantidad de stock:\n` +
        `\`${m.prefix}agregar_stock <numero_producto> <cantidad>\`\n\n` +
        `📝 *Ejemplo digital:*\n` +
        `\`${m.prefix}agregar_stock 1|Email: user@mail.com;;Password: pass123\`\n\n` +
        `📝 *Ejemplo físico:*\n` +
        `\`${m.prefix}agregar_stock 2 8\` — Agregar 8 pcs al producto #2\n\n` +
        `• Usa \`;;\` para nueva línea en el detalle 🔑\n` +
        `• Cada línea del archivo .txt = 1 artículo de stock 📄\n` +
        `• Máximo 1.000 artículos por importación 📊\n\n` +
        `_Los datos del stock digital son confidenciales 🔒 y solo se envían al comprador después de confirmar el pago_`,
    );
  }

  const productNo = parseInt(text.substring(0, pipeIdx).trim()) - 1;
  const detail = text
    .substring(pipeIdx + 1)
    .trim()
    .replace(/;;/g, "\n");

  if (isNaN(productNo) || productNo < 0 || productNo >= products.length) {
    return m.reply(
      `❌ *Número de producto no válido.*\n\nVer la lista de productos: \`${m.prefix}lista_stock\` 📋`,
    );
  }

  const product = products[productNo];

  if (product.type === "fisik") {
    const addCount = parseInt(detail);
    if (isNaN(addCount) || addCount <= 0) {
      return m.reply(
        `📦 *Este producto es de tipo Físico*\n\n` +
          `Usa el formato: \`${m.prefix}agregar_stock ${productNo + 1} <cantidad>\`\n\n` +
          `📝 Ejemplo: \`${m.prefix}agregar_stock ${productNo + 1} 8\` — Agregar 8 pcs`,
      );
    }
    product.stock = (product.stock === -1 ? 0 : product.stock) + addCount;
    db.setting("storeProducts", products);
    await m.react("✅");
    return m.reply(
      `📦 *STOCK FÍSICO AGREGADO*\n\n` +
        `🏷️ Producto: *${product.name}*\n` +
        `➕ Agregados: *${addCount} pcs*\n` +
        `📊 Stock total: *${product.stock} pcs*`,
    );
  }

  if (!detail || detail.length < 3) {
    return m.reply(
      `❌ *Detalle de stock demasiado corto.*\n\nSe necesitan al menos 3 caracteres para que los datos de stock sean utilizables 🔑`,
    );
  }

  if (!product.stockItems) product.stockItems = [];

  const isDuplicate = product.stockItems.some((item) => item.detail === detail);
  if (isDuplicate) {
    return m.reply(
      `⚠️ *El dato de stock ya existe.*\n\nUn artículo con el mismo detalle ya está registrado en el producto *${product.name}* 🔑`,
    );
  }

  product.stockItems.push({
    id: Date.now(),
    detail,
    addedAt: new Date().toISOString(),
  });
  product.stock = product.stockItems.length;
  db.setting("storeProducts", products);

  await m.react("✅");
  return m.reply(
    `✅ *STOCK AGREGADO*\n\n` +
      `🏷️ Producto: *${product.name}*\n` +
      `🔑 Stock total actual: *${product.stockItems.length}* cuentas\n\n` +
      `_Agregar más: \`${m.prefix}agregar_stock ${productNo + 1}|<detalle>\`_`,
  );
}

export { pluginConfig as config, handler };
