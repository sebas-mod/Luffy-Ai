import fs from 'fs'
import path from 'path'
import te from '../../src/lib/luffy-error.js'
import { updateAssetUrl } from '../../src/lib/luffy-uploader.js'
const pluginConfig = {
    name: 'cambiar_pp_vacio',
    alias: ["configurar_foto_vacia"],
    category: 'owner',
    description: 'Cambiar la imagen pp-kosong.jpg',
    usage: '.cambiar_pp_vacio (responde/envía imagen)',
    example: '.cambiar_pp_vacio',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    carne: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const isImage = m.isImage || (m.quoted && m.quoted.type === 'imageMessage')
    if (!isImage) return m.reply(`🖼️ *ᴄᴀᴍʙɪᴀʀ PP-KOSONG.JPG*\n\n> Envía/responde una imagen para reemplazarla\n> Archivo: assets/images/pp-kosong.jpg`)
    try {
        let buffer = m.quoted && m.quoted.isMedia ? await m.quoted.download() : await m.download()
        if (!buffer) return m.reply('❌ Error al descargar la imagen')
        await m.reply(`⏳ Subiendo la imagen...`)
        try {
            const newUrl = await updateAssetUrl('pp-kosong', buffer, 'pp-kosong.jpg')
            m.reply(`✅ *ᴇxɪᴛᴏsᴏ*\n\n> La imagen pp-kosong.jpg fue reemplazada por la nueva URL:\n> ${newUrl}\n> ¡La config se actualizó en tiempo real!`)
        } catch (e) {
            m.reply(`❌ Error al subir la imagen: ${e.message}`)
        }
    } catch (error) {
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }