import fs from 'fs'
import path from 'path'
import te from '../../src/lib/ourin-error.js'
import { updateAssetUrl } from '../../src/lib/ourin-uploader.js'
const pluginConfig = {
    name: 'ganti-pp-kosong.jpg',
    alias: ['gantippkosong', 'setppkosong'],
    category: 'owner',
    description: 'Cambia la imagen pp-kosong.jpg',
    usage: '.ganti-pp-kosong.jpg (reply/envía imagen)',
    example: '.ganti-pp-kosong.jpg',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const isImage = m.isImage || (m.quoted && m.quoted.type === 'imageMessage')
    if (!isImage) return m.reply(`🖼️ *ɢᴀɴᴛɪ PP-KOSONG.JPG*\n\n> Envía/reply imagen para cambiar\n> File: assets/images/pp-kosong.jpg`)
    try {
        let buffer = m.quoted && m.quoted.isMedia ? await m.quoted.download() : await m.download()
        if (!buffer) return m.reply('❌ Error al descargar imagen')
        await m.reply(`⏳ Está subiendo imagen...`)
        try {
            const newUrl = await updateAssetUrl('pp-kosong', buffer, 'pp-kosong.jpg')
            m.reply(`✅ *ÉXITO*\n\n> Imagen pp-kosong.jpg ha sido cambiado a una nueva URL:\n> ${newUrl}\n> Config ha sido actualizado en tiempo real!`)
        } catch (e) {
            m.reply(`❌ Error al subir imagen: ${e.message}`)
        }
    } catch (error) {
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
