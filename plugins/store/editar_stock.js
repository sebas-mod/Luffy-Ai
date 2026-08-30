import { getDatabase } from '../../src/lib/luffy-database.js'

const pluginConfig = {
    name: 'editar_stock',
    alias: ['editstock'],
    category: 'store',
    description: '✏️ Editar artículo de stock del producto (solo en chat privado)',
    usage: '.editar_stock <numero_producto> <numero_item>|<detalle_nuevo>',
    example: '.editar_stock 1 3|Email: nuevo@mail.com;;Password: newpass',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: true,
    cooldown: 3,
    carne: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    if (m.isGroup) {
        return m.reply(
            `🚫 *Acceso Denegado*\n\n` +
            `Para proteger la privacidad 🛡️, la edición de stock solo se puede hacer en el *chat privado*.\n\n` +
            `Contacta al bot directamente 📱`
        )
    }

    const db = getDatabase()
    const products = db.setting('storeProducts') || []

    if (products.length === 0) {
        return m.reply(`📭 *Aún no hay productos.*\n\nAgrega primero un producto: \`${m.prefix}agregar_producto\` ➕`)
    }

    const text = m.text?.trim() || ''
    const firstPipe = text.indexOf('|')

    if (firstPipe === -1) {
        return m.reply(
            `☽◯☾ ╭ ♰ 📦 STOCK ♰ ━╮ ☽◯☾\n\n` +
            `✏️ *EDITAR STOCK*\n\n` +
            `📋 Formato: \`${m.prefix}editar_stock <numero_producto> <numero_item>|<detalle_nuevo>\`\n\n` +
            `📝 *Ejemplo:*\n` +
            `\`${m.prefix}editar_stock 1 3|Email: nuevo@mail.com;;Password: newpass\`\n\n` +
            `• Usa \`;;\` para nueva línea en el detalle 🔑\n` +
            `📋 Ver el número de artículo: \`${m.prefix}lista_stock <numero_producto>\`\n\n` +
            `⚠️ _El stock ya enviado al comprador no cambiará_ 🔒\n\n` +
            `╰━ ⊱༺༒༻⊰ ━╯`
        )
    }

    const before = text.substring(0, firstPipe).trim()
    const newDetail = text.substring(firstPipe + 1).trim().replace(/;;/g, '\n')

    const parts = before.split(/\s+/)
    const productNo = parseInt(parts[0]) - 1
    const itemNo = parseInt(parts[1]) - 1

    if (isNaN(productNo) || productNo < 0 || productNo >= products.length) {
        return m.reply(`❌ *Número de producto no válido.*\n\nRango: 1-${products.length} 📋`)
    }

    const product = products[productNo]

    if (product.type === 'fisik') {
        return m.reply(
            `📦 *Producto Físico*\n\n` +
            `El producto físico no tiene datos por artículo 🔑\n` +
            `Para cambiar el stock, usa:\n` +
            `\`${m.prefix}editar_producto ${productNo + 1} stok <cantidad>\``
        )
    }

    const stockItems = product.stockItems || []

    if (isNaN(itemNo) || itemNo < 0 || itemNo >= stockItems.length) {
        return m.reply(`❌ *Número de artículo no válido.*\n\nRango: 1-${stockItems.length}\n\n📋 Ver la lista: \`${m.prefix}lista_stock ${productNo + 1}\``)
    }

    if (!newDetail || newDetail.length < 3) {
        return m.reply(`❌ *Detalle demasiado corto.*\n\nSe necesitan al menos 3 caracteres 🔑`)
    }

    const oldDetail = stockItems[itemNo].detail
    stockItems[itemNo].detail = newDetail
    stockItems[itemNo].updatedAt = new Date().toISOString()

    db.setting('storeProducts', products)
    await m.react('✅')

    return m.reply(
        `☽◯☾ ╭━ ♰ ✦ ÉXITO ♰ ━╮ ☽◯☾\n✅ *STOCK ACTUALIZADO*\n\n` +
        `🏷️ Producto: *${product.name}*\n` +
        `🔑 Artículo #${itemNo + 1}\n\n` +
        `❌ Antes:\n\`${oldDetail.replace(/\n/g, ' ').substring(0, 50)}\`\n\n` +
        `✅ Después:\n\`${newDetail.replace(/\n/g, ' ').substring(0, 50)}\`\n\n` +
        `╰━ ⊱༺༒༻⊰ ━╯\n\n` +
        `⚠️ _El cambio solo aplica a los artículos aún no enviados al comprador_ 🔒`
    )
}

export { pluginConfig as config, handler }
