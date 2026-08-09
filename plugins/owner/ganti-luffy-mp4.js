import fs from 'fs'
import path from 'path'
import te from '../../src/lib/luffy-error.js'
import { updateAssetUrl } from '../../src/lib/luffy-uploader.js'
const pluginConfig = {
    name: 'ganti-luffy.mp4',
    alias: ['gantiluffyvideo', 'setluffyvideo'],
    category: 'owner',
    description: 'Cambiar el video luffy.mp4',
    usage: '.ganti-luffy.mp4 (responde/envía video)',
    example: '.ganti-luffy.mp4',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    carne: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const isVideo = m.type === 'videoMessage' || (m.quoted && m.quoted.type === 'videoMessage')
    
    if (!isVideo) {
        return m.reply(`🎬 *ᴄᴀᴍʙɪᴀʀ ᴏᴜʀɪɴ.ᴍᴘ4*\n\n> Envía/responde un video para reemplazarlo\n> Archivo: assets/video/luffy.mp4`)
    }
    
    try {
        let buffer
        if (m.quoted && m.quoted.isMedia) {
            buffer = await m.quoted.download()
        } else if (m.isMedia) {
            buffer = await m.download()
        }
        
        if (!buffer) {
            return m.reply(`❌ Error al descargar el video`)
        }
        
        await m.reply(`⏳ Subiendo el video...`)
        try {
            const newUrl = await updateAssetUrl('luffy-mp4', buffer, 'luffy.mp4')
            m.reply(`✅ *ᴇxɪᴛᴏsᴏ*\n\n> El archivo luffy.mp4 fue reemplazado por la nueva URL:\n> ${newUrl}\n> ¡La config se actualizó en tiempo real!`)
        } catch (e) {
            m.reply(`❌ Error al subir el archivo: ${e.message}`)
        }
    } catch (error) {
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }