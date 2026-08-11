import fs from 'fs'
import path from 'path'
import te from '../../src/lib/luffy-error.js'
import { updateAssetUrl } from '../../src/lib/luffy-uploader.js'
const pluginConfig = {
    name: 'ganti-luffy2.jpg',
    alias: ["gantiluffy2", "configurar_luffy2"],
    category: 'owner',
    description: 'Cambiar la imagen luffy2.jpg',
    usage: '.ganti-luffy2.jpg (responde/envía imagen)',
    example: '.ganti-luffy2.jpg',
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
    
    if (!isImage) {
        return m.reply(`🖼️ *ᴄᴀᴍʙɪᴀʀ ᴏᴜʀɪɴ2.ᴊᴘɢ*\n\n> Envía/responde una imagen para reemplazarla\n> Archivo: assets/images/luffy2.jpg`)
    }
    
    try {
        let buffer
        if (m.quoted && m.quoted.isMedia) {
            buffer = await m.quoted.download()
        } else if (m.isMedia) {
            buffer = await m.download()
        }
        
        if (!buffer) {
            return m.reply(`❌ Error al descargar la imagen`)
        }
        
        await m.reply(`⏳ Subiendo la imagen...`)
        try {
            const newUrl = await updateAssetUrl('luffy2', buffer, 'luffy2.jpg')
            m.reply(`✅ *ᴇxɪᴛᴏsᴏ*\n\n> La imagen luffy2.jpg fue reemplazada por la nueva URL:\n> ${newUrl}\n> ¡La config se actualizó en tiempo real!`)
        } catch (e) {
            m.reply(`❌ Error al subir la imagen: ${e.message}`)
        }
    } catch (error) {
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }