import { getDatabase } from '../../src/lib/luffy-database.js'

const pluginConfig = {
    name: 'lista_stock',
    alias: ['liststock', 'stok', 'stock'],
    category: 'store',
    description: '📋 Ver la lista de artículos de stock del producto',
    usage: '.lista_stock <numero_producto>',
    example: '.lista_stock 1',
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
        return m.reply(`📭 *Aún no hay productos.*\n\nAgrega primero un producto: \`${m.prefix}agregar_producto\` ➕`)
    }

    const idx = parseInt(m.text?.trim()) - 1

    if (isNaN(idx) || idx < 0 || idx >= products.length) {
        let txt = `☽◯☾ ╭━ ♰ 📊 STOCK ♰ ━╮ ☽◯☾\n\n📋 *LISTA DE STOCK DE PRODUCTOS*\nElige un producto para ver su stock:\n\n`
        for (let i = 0; i < products.length; i++) {
            const p = products[i]
            const typeIcon = p.type === 'fisik' ? '📦' : '🔑'
            const stockDisplay = p.type === 'fisik'
                ? (p.stock === -1 ? '♾️' : `${p.stock} pcs`)
                : `${p.stockItems?.length || 0} cuentas`
            const icon = (p.type === 'fisik' ? (p.stock > 0 || p.stock === -1) : (p.stockItems?.length > 0 || p.stock === -1)) ? '✅' : '⚠️'
            txt += `${typeIcon} *${i + 1}.* ${p.name} — ${stockDisplay} ${icon}\n`
        }
        txt += `\n☽◯☾ ♰ Escribe \`${m.prefix}lista_stock <numero>\` para ver el detalle del stock 📊\n╰━ ⊱༺༒༻⊰ ━╯`
        return m.reply(txt)
    }

    const product = products[idx]
    const typeIcon = product.type === 'fisik' ? '📦' : '🔑'

    if (product.type === 'fisik') {
        return m.reply(
            `☽◯☾ ╭━ ♰ 📦 STOCK ♰ ━╮ ☽◯☾\n\n📦 *${product.name}*\n\n` +
            `📊 Tipo: *Físico*\n` +
            `📦 Total: *${product.stock === -1 ? '♾️ Unlimited' : product.stock + ' pcs'}*\n\n` +
            `*Administrar stock:*\n` +
            `• Agregar: \`${m.prefix}agregar_stock ${idx + 1} <cantidad>\`\n` +
            `• Editar: \`${m.prefix}editar_producto ${idx + 1} stok <cantidad>\`\n\n` +
            `_El stock físico se gestiona por cantidad, no por artículo_ 📦\n\n` +
            `╰━ ⊱༺༒༻⊰ ━╯`
        )
    }

    const stockItems = product.stockItems || []

    if (stockItems.length === 0) {
        return m.reply(
            `☽◯☾ ╭━ ♰ 🔑 STOCK ♰ ━╮ ☽◯☾\n\n🔑 *${product.name}*\n\n` +
            `📭 Aún no se han agregado artículos de stock.\n\n` +
            `*Agregar stock:*\n` +
            `• Manual: \`${m.prefix}agregar_stock ${idx + 1}|<detalle>\`\n` +
            `• Importar: \`${m.prefix}agregar_stock ${idx + 1}\` (responde un archivo .txt 📄)\n\n` +
            `_Los artículos de stock son confidenciales 🔒 y solo se envían al comprador después de confirmar el pago_\n\n` +
            `╰━ ⊱༺༒༻⊰ ━╯`
        )
    }

    let txt = `☽◯☾ ╭━ ♰ 🔑 STOCK ♰ ━╮ ☽◯☾\n\n🔑 *${product.name}*\n\n`
    txt += `📊 Total: *${stockItems.length}* cuentas\n\n`

    const showItems = stockItems.slice(0, 30)
    for (let i = 0; i < showItems.length; i++) {
        const preview = showItems[i].detail.replace(/\n/g, ' ').substring(0, 40)
        txt += `\`${i + 1}.\` ${preview}${showItems[i].detail.length > 40 ? '...' : ''}\n`
    }

    if (stockItems.length > 30) {
        txt += `\n_y ${stockItems.length - 30} artículos más..._ 📋`
    }

    txt += `\n\n╰━ ⊱༺༒༻⊰ ━╯\n\n🛠️ *Administrar stock:*\n`
    txt += `🗑️ Eliminar: \`${m.prefix}eliminar_stock ${idx + 1} <numero_item>\`\n`
    txt += `✏️ Editar: \`${m.prefix}editar_stock ${idx + 1} <numero_item>|<detalle_nuevo>\`\n`
    txt += `➕ Agregar: \`${m.prefix}agregar_stock ${idx + 1}|<detalle>\``

    return m.reply(txt)
}

export { pluginConfig as config, handler }
