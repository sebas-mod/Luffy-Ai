import { getDatabase } from '../../src/lib/luffy-database.js'
import axios from 'axios'
import FormData from 'form-data'

const pluginConfig = {
    name: 'agregar_lista',
    alias: ['addinfo'],
    category: 'store',
    description: '➕ Agregar nueva información a la tienda (solo en chat privado)',
    usage: '.addlist <nombre>|<contenido>',
    example: '.addlist Términos y Condiciones|1. Las compras no se pueden cancelar;;2. Garantía 7 días',
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
            `Para proteger la seguridad de los datos 🛡️, solo se puede agregar información en el *chat privado*.\n\n` +
            `Contacta al bot directamente 📱 y escribe:\n` +
            `\`${m.prefix}agregar_lista <nombre>|<contenido>\``
        )
    }

    const db = getDatabase()
    const text = m.text?.trim() || ''
    const pipeIdx = text.indexOf('|')

    if (pipeIdx === -1) {
        return m.reply(
            `➕ *AGREGAR INFORMACIÓN DE LA TIENDA*\n\n` +
            `📋 Formato:\n` +
            `\`${m.prefix}agregar_lista <nombre>|<contenido>\`\n\n` +
            `📌 *Parámetros:*\n` +
            `• *nombre* — Título de la información (mín. 2 caracteres)\n` +
            `• *contenido* — Contenido de la información (usa \`;;\` para nueva línea)\n\n` +
            `📝 *Ejemplos:*\n` +
            `\`${m.prefix}agregar_lista Términos y Condiciones|1. Las compras no se pueden cancelar;;2. Garantía 7 días;;3. Contacta al admin para reclamar\`\n` +
            `\`${m.prefix}agregar_lista Cómo Pedir|1. Escribe .listproduk;;2. Elige producto;;3. Escribe .beli <numero>\`\n\n` +
            `🖼️ *Consejos:*\n` +
            `• Envía una imagen/video primero, luego responde ese medio con el comando para agregar el medio 📸\n` +
            `• Usa \`;;\` para crear una nueva línea en el contenido de la información ✍️\n` +
            `• Todos pueden ver esta información mediante \`${m.prefix}list\` 👥`
        )
    }

    const name = text.substring(0, pipeIdx).trim()
    const content = text.substring(pipeIdx + 1).trim().replace(/;;/g, '\n')

    if (!name || name.length < 2) {
        return m.reply(`❌ *Nombre demasiado corto.*\n\nSe necesitan al menos 2 caracteres para que sea fácil de reconocer 📝`)
    }
    if (!content || content.length < 3) {
        return m.reply(`❌ *Contenido de la información demasiado corto.*\n\nSe necesitan al menos 3 caracteres ✍️`)
    }

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
            console.error('[AddList] Upload error:', e.message)
        }
    }

    const lists = db.setting('storeLists') || []
    const newList = {
        id: `L${Date.now()}`,
        name,
        content,
        description: content.substring(0, 80).replace(/\n/g, ' '),
        image: imageUrl,
        video: videoUrl,
        createdAt: new Date().toISOString()
    }

    lists.push(newList)
    db.setting('storeLists', lists)

    await m.react('✅')

    let reply = `✅ *INFORMACIÓN AGREGADA*\n\n`
    reply += `🏷️ Nombre: *${name}*\n`
    if (imageUrl) reply += `🖼️ Medio: ✅ Imagen\n`
    if (videoUrl) reply += `🎬 Medio: ✅ Video\n`
    reply += `📝 Contenido:\n${content}\n\n`
    reply += `📋 _Ver la lista: \`${m.prefix}list\`_\n`
    reply += `✏️ _Editar: \`${m.prefix}editar_lista ${lists.length}\`_`

    return m.reply(reply)
}

export { pluginConfig as config, handler }
