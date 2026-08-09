import { getDatabase } from '../../src/lib/luffy-database.js'

const pluginConfig = {
    name: 'hapusstok',
    alias: ['delstok', 'delstock', 'deletestok'],
    category: 'store',
    description: '🗑️ Eliminar artículo de stock del producto',
    usage: '.hapusstok <numero_producto> <numero_item>',
    example: '.hapusstok 1 3',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    carne: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const products = db.setting('storeProducts') || []

    if (products.length === 0) {
        return m.reply(`📭 *Aún no hay productos.*\n\nAgrega primero un producto: \`${m.prefix}addproduk\` ➕`)
    }

    const args = m.text?.trim().split(/\s+/) || []
    const productNo = parseInt(args[0]) - 1
    const itemNo = parseInt(args[1]) - 1

    if (args.length < 2 || isNaN(productNo) || isNaN(itemNo)) {
        return m.reply(
            `🗑️ *ELIMINAR STOCK*\n\n` +
            `Formato: \`${m.prefix}hapusstok <numero_producto> <numero_item>\`\n\n` +
            `📝 *Ejemplo:*\n` +
            `\`${m.prefix}hapusstok 1 3\` — Eliminar el artículo 3 del producto 1\n\n` +
            `📋 Ver el número de artículo: \`${m.prefix}liststok <numero_producto>\``
        )
    }

    if (productNo < 0 || productNo >= products.length) {
        return m.reply(`❌ *Número de producto no válido.*\n\nRango: 1-${products.length} 📋`)
    }

    const product = products[productNo]

    if (product.type === 'fisik') {
        const reduceCount = parseInt(args[1])
        if (isNaN(reduceCount) || reduceCount <= 0) {
            return m.reply(
                `📦 *Producto Físico*\n\n` +
                `Para reducir el stock físico, usa:\n` +
                `\`${m.prefix}editproduk ${productNo + 1} stok <cantidad_nueva>\`\n\n` +
                `Stock actual: *${product.stock === -1 ? '♾️ Unlimited' : product.stock + ' pcs'}*`
            )
        }
        if (product.stock !== -1) {
            product.stock = Math.max(0, product.stock - reduceCount)
            db.setting('storeProducts', products)
            await m.react('✅')
            return m.reply(
                `📦 *STOCK FÍSICO REDUCIDO*\n\n` +
                `🏷️ Producto: *${product.name}*\n` +
                `➖ Reducidos: *${reduceCount} pcs*\n` +
                `📊 Stock restante: *${product.stock} pcs*`
            )
        }
        return m.reply(`♾️ *El stock unlimited no se puede reducir.*\n\nCambia el tipo de stock primero: \`${m.prefix}editproduk ${productNo + 1} stok <cantidad>\``)
    }

    const stockItems = product.stockItems || []

    if (itemNo < 0 || itemNo >= stockItems.length) {
        return m.reply(`❌ *Número de artículo no válido.*\n\nRango: 1-${stockItems.length}\n\n📋 Ver la lista: \`${m.prefix}liststok ${productNo + 1}\``)
    }

    const deleted = stockItems.splice(itemNo, 1)[0]
    product.stock = stockItems.length
    db.setting('storeProducts', products)

    await m.react('✅')
    return m.reply(
        `🗑️ *STOCK ELIMINADO*\n\n` +
        `🏷️ Producto: *${product.name}*\n` +
        `🔑 Artículo: \`${deleted.detail.replace(/\n/g, ' ').substring(0, 50)}\`\n` +
        `📊 Stock restante: *${stockItems.length}* cuentas`
    )
}

export { pluginConfig as config, handler }
