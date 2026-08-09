import fs from 'fs'
import path from 'path'
import te from '../../src/lib/luffy-error.js'
import { updateAssetUrl } from '../../src/lib/luffy-uploader.js'
const pluginConfig = {
    name: 'ganti-luffy.mp3',
    alias: ['gantiluffyaudio', 'setluffyaudio'],
    category: 'owner',
    description: 'Cambiar el audio luffy.mp3',
    usage: '.ganti-luffy.mp3 (responde/envía audio)',
    example: '.ganti-luffy.mp3',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    carne: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const isAudio = m.type === 'audioMessage' || (m.quoted && m.quoted.type === 'audioMessage')
    
    if (!isAudio) {
        return m.reply(`🎵 *ᴄᴀᴍʙɪᴀʀ ᴏᴜʀɪɴ.ᴍᴘ3*\n\n> Envía/responde un audio para reemplazarlo\n> Archivo: assets/audio/luffy.mp3`)
    }
    
    try {
        let buffer
        if (m.quoted && m.quoted.isMedia) {
            buffer = await m.quoted.download()
        } else if (m.isMedia) {
            buffer = await m.download()
        }
        
        if (!buffer) {
            return m.reply(`❌ Error al descargar el audio`)
        }
        
        await m.reply(`⏳ Subiendo el audio...`)
        try {
            const newUrl = await updateAssetUrl('luffy-mp3', buffer, 'luffy.mp3')
            m.reply(`✅ *ᴇxɪᴛᴏsᴏ*\n\n> El archivo luffy.mp3 fue reemplazado por la nueva URL:\n> ${newUrl}\n> ¡La config se actualizó en tiempo real!`)
        } catch (e) {
            m.reply(`❌ Error al subir el archivo: ${e.message}`)
        }
    } catch (error) {
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }