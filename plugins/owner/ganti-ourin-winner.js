import fs from 'fs'
import path from 'path'
import te from '../../src/lib/ourin-error.js'
import { updateAssetUrl } from '../../src/lib/ourin-uploader.js'
const pluginConfig = {
    name: 'ganti-ourin-winner.jpg',
    alias: ['gantiourinwinner', 'setourinwinner'],
    category: 'owner',
    description: 'Cambia la imagen ourin-winner.jpg (mestoatura del ganador)',
    usage: '.ganti-ourin-winner.jpg (reply/envía imagen)',
    example: '.ganti-ourin-winner.jpg',
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
    
    if (!isImage) {
        return m.reply(`🏆 *ɢᴀɴᴛɪ ᴏᴜʀɪɴ-ᴡɪɴɴᴇʀ.ᴊᴘɢ*\n\n> Envía/reply imagen para cambiar\n> File: assets/images/ourin-winner.jpg`)
    }
    
    try {
        let buffer
        if (m.quoted && m.quoted.isMedia) {
            buffer = await m.quoted.download()
        } else if (m.isMedia) {
            buffer = await m.download()
        }
        
        if (!buffer) {
            return m.reply(`❌ Error al descargar imagen`)
        }
        
        await m.reply(`⏳ Está subiendo imagen...`)
        try {
            const newUrl = await updateAssetUrl('ourin-winner', buffer, 'ourin-winner.jpg')
            m.reply(`✅ *ʙᴇʀʜᴀsɪʟ*\n\n> Imagen ourin-winner.jpg ha sido cambiado a una nueva URL:\n> ${newUrl}\n> Config ha sido actualizado en tiempo real!`)
        } catch (e) {
            m.reply(`❌ Error al subir imagen: ${e.message}`)
        }
    } catch (error) {
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
