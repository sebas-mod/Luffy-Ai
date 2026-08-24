import { getDatabase } from '../../src/lib/luffy-database.js'
import axios from 'axios'
import FormData from 'form-data'

const pluginConfig = {
    name: 'editar_producto',
    alias: ['editproduct'],
    category: 'store',
    description: '✏️ Editar producto de la tienda (solo en chat privado)',
    usage: '.editar_producto <numero> <campo> <valor>',
    example: '.editar_producto 1 precio 30000',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: true,
    cooldown: 3,
    carne: 0,
    isEnabled: true
}

async function uploadToCatbox(buffer, filename = 'file.jpg') {
    try {
        const form = new FormData()
        form.append('fileToUpload', buffer, { filename })
        form.append('reqtype', 'fileupload')
        const res = await axios.post('https://catbox.moe/user/api.php', form, {
            headers: form.getHeaders(),
            timeout: 30000
        })
        return res.data?.startsWith('http') ? res.data : null
    } catch {
        return null
    }
}

async function handler(m, { sock }) {
    if (m.isGroup) {
        return m.reply(
            `🚫 *Acceso Denegado*\n\n` +
            `Para proteger la privacidad 🛡️, la edición de productos solo se puede hacer en el *chat privado*.\n\n` +
            `Contacta al bot directamente 📱`
        )
    }

    const db = getDatabase()
    const products = db.setting('storeProducts') || []

    if (products.length === 0) {
        return m.reply(`📭 *Aún no hay productos.*\n\nAgrega primero un producto: \`${m.prefix}agregar_producto\` ➕`)
    }

    const text = m.text?.trim() || ''
    const match = text.match(/^(\d+)\s+(nombre|precio|descuento|stock|descripcion|detalle|imagen|video|tipo)\s*(.*)/i)

    if (!match) {
        return m.reply(
            `╭━━〔 🛒 TIENDA 〕━━╮\n\n` +
            `✏️ *EDITAR PRODUCTO*\n\n` +
            `📋 Formato: \`${m.prefix}editar_producto <numero> <campo> <valor>\`\n\n` +
            `📌 *Campos editables:*\n` +
            `• *nombre* 🏷️ — Nombre del producto\n` +
            `• *precio* 💰 — Precio de venta (número)\n` +
            `• *descuento* 🏷️ — Precio original/tachado (número, 0 para quitar)\n` +
            `• *stock* 📊 — Cantidad de stock o \`unlimited\`\n` +
            `• *tipo* 🔑📦 — \`digital\` o \`fisico\`\n` +
            `• *descripcion* 📝 — Descripción del producto\n` +
            `• *detalle* 🔒 — Información secreta (se envía tras la compra)\n` +
            `• *imagen* 🖼️ — Subir nueva imagen (responde una imagen)\n` +
            `• *video* 🎬 — Subir nuevo video (responde un video)\n\n` +
            `📝 *Ejemplos:*\n` +
            `\`${m.prefix}editar_producto 1 precio 30000\`\n` +
            `\`${m.prefix}editar_producto 1 descuento 40000\`\n` +
            `\`${m.prefix}editar_producto 1 tipo fisico\`\n` +
            `\`${m.prefix}editar_producto 1 nombre Netflix Premium\`\n` +
            `\`${m.prefix}editar_producto 1 descripcion Cuenta compartida 1 mes\`\n` +
            `\`${m.prefix}editar_producto 1 imagen\` (responde una imagen 🖼️)\n\n` +
            `🏷️ _El precio de descuento se mostrará como ~~precio original~~ en el catálogo_\n\n` +
            `╰━━━━━━━━━━━━╯`
        )
    }

    const idx = parseInt(match[1]) - 1
    const field = match[2].toLowerCase()
    let value = match[3]?.trim() || ''

    if (idx < 0 || idx >= products.length) {
        return m.reply(`❌ *Número de producto no válido.*\n\nRango: 1-${products.length} 📋`)
    }

    const product = products[idx]

    switch (field) {
        case 'nombre': {
            if (!value || value.length < 2) return m.reply(`❌ *Nombre demasiado corto.* Mínimo 2 caracteres 🏷️`)
            product.name = value
            break
        }
        case 'precio': {
            const price = parseInt(value)
            if (isNaN(price) || price < 1000) return m.reply(`❌ *Precio no válido.* Mínimo Rp 1.000 💰`)
            product.price = price
            break
        }
        case 'descuento': {
            const origPrice = parseInt(value)
            if (isNaN(origPrice) || origPrice === 0) {
                product.originalPrice = null
            } else {
                if (origPrice <= product.price) return m.reply(`❌ *El precio de descuento debe ser mayor que el precio de venta.*\n\nPrecio de venta actual: Rp ${product.price.toLocaleString('id-ID')} 💰`)
                product.originalPrice = origPrice
            }
            break
        }
        case 'stock': {
            product.stock = value.toLowerCase() === 'unlimited' ? -1 : parseInt(value)
            if (isNaN(product.stock)) return m.reply(`❌ *Stock no válido.* Usa un número o \`unlimited\` 📊`)
            break
        }
        case 'tipo': {
            const newType = value.toLowerCase()
            if (newType !== 'digital' && newType !== 'fisik' && newType !== 'fisico' && newType !== 'physical') {
                return m.reply(`❌ *Tipo no válido.* Usa \`digital\` 🔑 o \`fisico\` 📦`)
            }
            const normalizedType = newType === 'fisik' || newType === 'fisico' || newType === 'physical' ? 'fisik' : 'digital'
            if (normalizedType === 'fisik' && product.type === 'digital' && product.stockItems?.length > 0) {
                return m.reply(
                    `⚠️ *No se puede cambiar a Físico*\n\n` +
                    `Este producto tiene *${product.stockItems.length}* datos de cuentas 🔑\n` +
                    `Elimina todos los artículos de stock antes de cambiar el tipo a Físico.\n\n` +
                    `🗑️ Eliminar todos: \`${m.prefix}editar_producto ${idx + 1} stock 0\``
                )
            }
            product.type = normalizedType
            if (normalizedType === 'fisik' && !product.stock) product.stock = 0
            break
        }
        case 'descripcion': {
            product.description = value.replace(/;;/g, '\n')
            break
        }
        case 'detalle': {
            product.detail = value.replace(/;;/g, '\n')
            break
        }
        case 'imagen': {
            const hasMedia = m.quoted?.isMedia && (m.quoted?.isImage || m.quoted?.type === 'imageMessage')
            const isDirectImage = m.isImage
            if (!hasMedia && !isDirectImage) return m.reply(`🖼️ *Responde o envía una imagen nueva.*\n\nEnvía la imagen y respóndela con este comando.`)
            await m.reply(`⏳ _Subiendo imagen..._`)
            try {
                const buffer = hasMedia ? await m.quoted.download() : await m.download()
                if (buffer) {
                    const url = await uploadToCatbox(buffer, 'image.jpg')
                    if (url) product.image = url
                    else return m.reply(`❌ *Error al subir la imagen.* Inténtalo de nuevo más tarde 🖼️`)
                }
            } catch {
                return m.reply(`❌ *Error al subir la imagen.* Inténtalo de nuevo más tarde 🖼️`)
            }
            break
        }
        case 'video': {
            const hasMedia = m.quoted?.isMedia && (m.quoted?.isVideo || m.quoted?.type === 'videoMessage')
            const isDirectVideo = m.isVideo
            if (!hasMedia && !isDirectVideo) return m.reply(`🎬 *Responde o envía un video nuevo.*\n\nEnvía el video y respóndelo con este comando.`)
            await m.reply(`⏳ _Subiendo video..._`)
            try {
                const buffer = hasMedia ? await m.quoted.download() : await m.download()
                if (buffer) {
                    const url = await uploadToCatbox(buffer, 'video.mp4')
                    if (url) product.video = url
                    else return m.reply(`❌ *Error al subir el video.* Inténtalo de nuevo más tarde 🎬`)
                }
            } catch {
                return m.reply(`❌ *Error al subir el video.* Inténtalo de nuevo más tarde 🎬`)
            }
            break
        }
        default:
            return m.reply(`❌ *Campo no reconocido.*\n\nUsa: nombre, precio, descuento, stock, tipo, descripcion, detalle, imagen, video 📋`)
    }

    db.setting('storeProducts', products)
    await m.react('✅')

    const typeIcon = product.type === 'fisik' ? '📦' : '🔑'
    const typeLabel = product.type === 'fisik' ? 'Físico' : 'Digital'

    let reply = `╭━━━〔 ✦ ÉXITO 〕━━━╮\n✅ *PRODUCTO ACTUALIZADO*\n\n`
    reply += `🏷️ Nombre: *${product.name}*\n`
    reply += `💰 Precio: *Rp ${product.price.toLocaleString('id-ID')}*`
    if (product.originalPrice) reply += ` ~~Rp ${product.originalPrice.toLocaleString('id-ID')}~~`
    reply += `\n`
    reply += `${typeIcon} Tipo: *${typeLabel}*\n`
    reply += `📊 Stock: *${product.stock === -1 ? '♾️ Unlimited' : product.stock}*\n`
    if (field === 'imagen') reply += `🖼️ Imagen: ✅\n`
    if (field === 'video') reply += `🎬 Video: ✅\n`
    reply += `\n╰━━━━━━━━━━━━╯\n\n👀 _Ver los cambios: \`${m.prefix}lista_productos\`_`

    return m.reply(reply)
}

export { pluginConfig as config, handler }
