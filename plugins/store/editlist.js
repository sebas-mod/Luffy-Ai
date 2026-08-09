import { getDatabase } from '../../src/lib/luffy-database.js'
import axios from 'axios'
import FormData from 'form-data'

const pluginConfig = {
    name: 'editlist',
    alias: ['editinfo'],
    category: 'store',
    description: '✏️ Editar información de la tienda (solo en chat privado)',
    usage: '.editlist <numero> <campo> <valor>',
    example: '.editlist 1 isi Contenido nuevo aquí',
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
            `Para proteger la seguridad de los datos 🛡️, la edición de información solo se puede hacer en el *chat privado*.\n\n` +
            `Contacta al bot directamente 📱`
        )
    }

    const db = getDatabase()
    const lists = db.setting('storeLists') || []

    if (lists.length === 0) {
        return m.reply(`📭 *Aún no hay información.*\n\nAgrega primero información: \`${m.prefix}addlist\` ➕`)
    }

    const text = m.text?.trim() || ''
    const match = text.match(/^(\d+)\s+(nama|isi|deskripsi|gambar|video)\s*(.*)/i)

    if (!match) {
        return m.reply(
            `✏️ *EDITAR INFORMACIÓN DE LA TIENDA*\n\n` +
            `📋 Formato: \`${m.prefix}editlist <numero> <campo> <valor>\`\n\n` +
            `📌 *Campos editables:*\n` +
            `• *nama* 🏷️ — Título de la información\n` +
            `• *isi* 📝 — Contenido de la información (usa \`;;\` para nueva línea)\n` +
            `• *deskripsi* 📋 — Descripción corta (vista previa en la lista)\n` +
            `• *gambar* 🖼️ — Subir nueva imagen (responde una imagen)\n` +
            `• *video* 🎬 — Subir nuevo video (responde un video)\n\n` +
            `📝 *Ejemplos:*\n` +
            `\`${m.prefix}editlist 1 isi Términos nuevos: blablabla;;Condiciones: blablabla\`\n` +
            `\`${m.prefix}editlist 1 nama FAQ de Pago\`\n` +
            `\`${m.prefix}editlist 1 gambar\` (responde una imagen 🖼️)\n\n` +
            `_Usa \`;;\` para nueva línea en el contenido_ ✍️`
        )
    }

    const idx = parseInt(match[1]) - 1
    const field = match[2].toLowerCase()
    let value = match[3]?.trim() || ''

    if (idx < 0 || idx >= lists.length) {
        return m.reply(`❌ *Número no válido.*\n\nRango: 1-${lists.length} 📋`)
    }

    const item = lists[idx]

    switch (field) {
        case 'nama': {
            if (!value || value.length < 2) return m.reply(`❌ *Nombre demasiado corto.* Mínimo 2 caracteres 🏷️`)
            item.name = value
            break
        }
        case 'isi': {
            if (!value || value.length < 3) return m.reply(`❌ *Contenido demasiado corto.* Mínimo 3 caracteres 📝`)
            item.content = value.replace(/;;/g, '\n')
            item.description = item.content.substring(0, 80).replace(/\n/g, ' ')
            break
        }
        case 'deskripsi': {
            item.description = value.replace(/;;/g, ' ')
            break
        }
        case 'gambar': {
            const hasMedia = m.quoted?.isMedia && (m.quoted?.isImage || m.quoted?.type === 'imageMessage')
            const isDirectImage = m.isImage
            if (!hasMedia && !isDirectImage) return m.reply(`🖼️ *Responde o envía una imagen nueva.*\n\nEnvía la imagen y respóndela con este comando.`)
            await m.reply(`⏳ _Subiendo imagen..._`)
            try {
                const buffer = hasMedia ? await m.quoted.download() : await m.download()
                if (buffer) {
                    const url = await uploadToCatbox(buffer, 'image.jpg')
                    if (url) item.image = url
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
                    if (url) item.video = url
                    else return m.reply(`❌ *Error al subir el video.* Inténtalo de nuevo más tarde 🎬`)
                }
            } catch {
                return m.reply(`❌ *Error al subir el video.* Inténtalo de nuevo más tarde 🎬`)
            }
            break
        }
        default:
            return m.reply(`❌ *Campo no reconocido.*\n\nUsa: nama, isi, deskripsi, gambar, video 📋`)
    }

    db.setting('storeLists', lists)
    await m.react('✅')

    let reply = `✅ *INFORMACIÓN ACTUALIZADA*\n\n`
    reply += `🏷️ Nombre: *${item.name}*\n`
    if (field === 'isi') reply += `📝 Contenido:\n${item.content}\n\n`
    if (field === 'gambar') reply += `🖼️ Imagen: ✅\n`
    if (field === 'video') reply += `🎬 Video: ✅\n`
    reply += `\n👀 _Ver los cambios: \`${m.prefix}list\`_`

    return m.reply(reply)
}

export { pluginConfig as config, handler }
