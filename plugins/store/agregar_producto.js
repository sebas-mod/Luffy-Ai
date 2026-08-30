import { getDatabase } from '../../src/lib/luffy-database.js'
import axios from 'axios'
import FormData from 'form-data'

const pluginConfig = {
    name: 'agregar_producto',
    alias: ['addproduct'],
    category: 'store',
    description: '➕ Agregar un producto nuevo a la tienda (solo en chat privado)',
    usage: '.agregar_producto <nombre>|<precio>|<tipo>|<stock>|<descripcion>',
    example: '.agregar_producto Spotify Premium|25000|digital|10|Cuenta Premium 1 Mes',
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
            `Para proteger la privacidad y seguridad de los datos del producto 🛡️, solo se puede agregar productos en el *chat privado*.\n\n` +
            `Contacta al bot directamente 📱 y escribe:\n` +
            `\`${m.prefix}agregar_producto <nombre>|<precio>|<tipo>|<stock>|<descripcion>\``
        )
    }

    const db = getDatabase()
    const text = m.text?.trim() || ''
    const parts = text.split('|').map(p => p.trim())

    if (parts.length < 2) {
        return m.reply(
            `☽◯☾ ╭ ♰ 🛒 TIENDA ♰ ━╮ ☽◯☾\n\n` +
            `➕ *AGREGAR PRODUCTO NUEVO*\n\n` +
            `📋 Formato:\n` +
            `\`${m.prefix}agregar_producto <nombre>|<precio>|<tipo>|<stock>|<descripcion>\`\n\n` +
            `📌 *Parámetros:*\n` +
            `• *nombre* — Nombre del producto (mín. 2 caracteres)\n` +
            `• *precio* — Precio en Rupias (mín. 1.000)\n` +
            `• *tipo* — \`digital\` 🔑 o \`fisik\` 📦 (opcional, por defecto: digital)\n` +
            `• *stock* — Cantidad de stock o \`unlimited\` (opcional, por defecto: 999)\n` +
            `• *descripcion* — Descripción corta (opcional)\n\n` +
            `🔑 *Digital* = Producto con cuenta/clave/datos únicos por artículo\n` +
            `📦 *Físico* = Producto físico, el stock es la cantidad\n\n` +
            `📝 *Ejemplos:*\n` +
            `\`${m.prefix}agregar_producto Spotify Premium|25000|digital|10|Cuenta Premium 1 Mes\`\n` +
            `\`${m.prefix}agregar_producto Camiseta|65000|fisik|8|Camiseta Lisa Cotton 30s\`\n` +
            `\`${m.prefix}agregar_producto Netflix|35000|digital|unlimited|Cuenta Compartida\`\n\n` +
            `🖼️ *Consejos:*\n` +
            `• Envía la imagen/video primero y luego responde ese medio con el comando para agregar la miniatura 📸\n` +
            `• Para productos *digitales*, usa \`${m.prefix}agregar_stock\` después de crear el producto para agregar los datos de cuenta/clave 🔑\n` +
            `• Para productos *físicos*, el stock se ajusta automáticamente con el número indicado 📦\n` +
            `• El precio de descuento se puede configurar luego con \`${m.prefix}editar_producto\` 🏷️\n\n` +
            `╰━ ⊱༺༒༻⊰ ━╯`
        )
    }

    const name = parts[0]
    const price = parseInt(parts[1])
    const typeStr = (parts[2] || 'digital').toLowerCase()
    const stockStr = parts[3] || ''
    const description = (parts[4] || '').replace(/;;/g, '\n')

    if (!name || name.length < 2) {
        return m.reply(`❌ *Nombre del producto demasiado corto.*\n\nSe necesitan al menos 2 caracteres para que los clientes lo reconozcan fácilmente 📝`)
    }
    if (isNaN(price) || price < 1000) {
        return m.reply(`❌ *Precio no válido.*\n\nEl precio mínimo es *Rp 1.000* 💰 Asegúrate de ingresar el número correcto.`)
    }

    const type = typeStr === 'fisik' || typeStr === 'physical' ? 'fisik' : 'digital'
    const stock = stockStr.toLowerCase() === 'unlimited' ? -1 : (parseInt(stockStr) || 999)

    let imageUrl = null
    let videoUrl = null

    const hasQuotedMedia = m.quoted?.isMedia
    const isDirectMedia = m.isMedia && (m.isImage || m.isVideo)

    if (hasQuotedMedia || isDirectMedia) {
        await m.reply(`⏳ _Subiendo el medio..._`)
        try {
            const buffer = hasQuotedMedia ? await m.quoted.download() : await m.download()
            if (buffer) {
                const isImage = m.quoted?.isImage || m.quoted?.type === 'imageMessage' || m.isImage
                const isVideo = m.quoted?.isVideo || m.quoted?.type === 'videoMessage' || m.isVideo
                const url = await uploadToCatbox(buffer, isVideo ? 'video.mp4' : 'image.jpg')
                if (url) {
                    if (isVideo) videoUrl = url
                    else imageUrl = url
                }
            }
        } catch (e) {
            console.error('[AddProduk] Upload error:', e.message)
        }
    }

    const products = db.setting('storeProducts') || []
    const newProduct = {
        id: `P${Date.now()}`,
        name,
        price,
        originalPrice: null,
        type,
        stock,
        stockItems: [],
        description,
        detail: '',
        image: imageUrl,
        video: videoUrl,
        createdAt: new Date().toISOString()
    }

    products.push(newProduct)
    db.setting('storeProducts', products)

    await m.react('✅')

    const typeIcon = type === 'digital' ? '🔑' : '📦'
    const typeLabel = type === 'digital' ? 'Digital' : 'Físico'

    let reply = `☽◯☾ ╭━ ♰ ✦ ÉXITO ♰ ━╮ ☽◯☾\n✅ *PRODUCTO AGREGADO*\n\n`
    reply += `🏷️ Nombre: *${name}*\n`
    reply += `💰 Precio: *Rp ${price.toLocaleString('id-ID')}*\n`
    reply += `${typeIcon} Tipo: *${typeLabel}*\n`
    reply += `📊 Stock: *${stock === -1 ? 'Unlimited ♾️' : stock}*\n`
    if (description) reply += `📝 Descripción: _${description}_\n`
    if (imageUrl) reply += `🖼️ Miniatura: ✅ Imagen\n`
    if (videoUrl) reply += `🎬 Miniatura: ✅ Video\n`
    reply += `\n╰━ ⊱༺༒༻⊰ ━╯\n\n📌 *Siguientes pasos:*\n`

    if (type === 'digital') {
        reply += `1️⃣ Agregar datos de cuenta/clave: \`${m.prefix}agregar_stock ${products.length}|<detalle>\`\n`
        reply += `2️⃣ O importar desde archivo .txt: \`${m.prefix}agregar_stock ${products.length}\` (responde el archivo 📄)\n`
    } else {
        reply += `1️⃣ El stock ya se configuró automáticamente (${stock} pcs) 📦\n`
        reply += `2️⃣ Agregar stock: \`${m.prefix}editar_producto ${products.length} stok <cantidad>\`\n`
    }
    reply += `3️⃣ Ver el producto: \`${m.prefix}lista_productos\` 🛍️\n\n`
    reply += `_Los clientes verán este producto mediante \`${m.prefix}lista_productos\`_ 🎉`

    return m.reply(reply)
}

export { pluginConfig as config, handler }
