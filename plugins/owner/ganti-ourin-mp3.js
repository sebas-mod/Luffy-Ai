import fs from 'fs'
import path from 'path'
import te from '../../src/lib/ourin-error.js'
import { updateAssetUrl } from '../../src/lib/ourin-uploader.js'
const pluginConfig = {
    name: 'ganti-ourin.mp3',
    alias: ['gantiourinaudio', 'setourinaudio'],
    category: 'owner',
    description: 'Cambia el audio ourin.mp3',
    usage: '.ganti-ourin.mp3 (reply/envía audio)',
    example: '.ganti-ourin.mp3',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const isAudio = m.type === 'audioMessage' || (m.quoted && m.quoted.type === 'audioMessage')
    
    if (!isAudio) {
        return m.reply(`🎵 *ɢᴀɴᴛɪ ᴏᴜʀɪɴ.ᴍᴘ3*\n\n> Envía/reply audio para mengganti\n> File: assets/audio/ourin.mp3`)
    }
    
    try {
        let buffer
        if (m.quoted && m.quoted.isMedia) {
            buffer = await m.quoted.download()
        } else if (m.isMedia) {
            buffer = await m.download()
        }
        
        if (!buffer) {
            return m.reply(`❌ Error al descargar audio`)
        }
        
        await m.reply(`⏳ Está subiendo imagen...`)
        try {
            const newUrl = await updateAssetUrl('ourin-mp3', buffer, 'ourin.mp3')
            m.reply(`✅ *ʙᴇʀʜᴀsɪʟ*\n\n> File ourin.mp3 ha sido cambiado a una nueva URL:\n> ${newUrl}\n> Config ha sido actualizado en tiempo real!`)
        } catch (e) {
            m.reply(`❌ Error al subir file: ${e.message}`)
        }
    } catch (error) {
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
