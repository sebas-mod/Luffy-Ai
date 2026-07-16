import fs from 'fs'
import path from 'path'
import te from '../../src/lib/ourin-error.js'
import { updateAssetUrl } from '../../src/lib/ourin-uploader.js'
const pluginConfig = {
    name: 'ganti-ourin-v8.jpg',
    alias: ['gantiourinv8', 'setourinv8'],
    category: 'owner',
    description: 'Cambia la imagen ourin-v8.jpg (mestoatura de bienvenida)',
    usage: '.ganti-ourin-v8.jpg (reply/envía imagen)',
    example: '.ganti-ourin-welcome.jpg',
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
        return m.reply(`🖼️ *ɢᴀɴᴛɪ ᴏᴜʀɪɴ-ᴠ8.ᴊᴘɢ*\n\n> Envía/reply imagen para mengganti\n> File: assets/images/ourin-v9.jpg`)
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
            const newUrl = await updateAssetUrl('ourin-v8', buffer, 'ourin-v8.jpg')
            m.reply(`✅ *ʙᴇʀʜᴀsɪʟ*\n\n> Imagen ourin-v8.jpg ha sido cambiado a una nueva URL:\n> ${newUrl}\n> Config ha sido actualizado en tiempo real!`)
        } catch (e) {
            m.reply(`❌ Error al subir imagen: ${e.message}`)
        }
    } catch (error) {
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
