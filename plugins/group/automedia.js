import config from '../../config.js'
import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'automedia',
    alias: ['automedi', 'am'],
    category: 'group',
    description: 'Alternar auto media - convertir stickers en imagenes/videos automáticamente',
    usage: '.automedia on/off',
    example: '.automedia on',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.args || []
    const groupData = db.getGroup(m.chat) || {}
    const current = groupData.automedia ?? false
    const arg = args[0]?.toLowerCase()
    
    if (!arg) {
        const status = current ? '✅ Activo' : '❌ Inactivo'
        return m.reply(
            `🎬 *ᴀᴜᴛᴏᴍᴇᴅɪᴀ*\n\n` +
            `> Estado: ${status}\n\n` +
            `> Usa:\n` +
            `> \`${m.prefix}automedia on\` - activar\n` +
            `> \`${m.prefix}automedia off\` - desactivar\n\n` +
            `> _Convierte stickers en imágenes automáticamente_\n` +
            `> ¡No convierte videos, shishishi!`
        )
    }
    
    if (arg === 'on' || arg === '1' || arg === 'aktif') {
        if (current) {
            return m.reply(`🎬 *ᴀᴜᴛᴏᴍᴇᴅɪᴀ*\n\n> ¡Ya está activo!`)
        }
        db.setGroup(m.chat, { automedia: true })
        await db.save()
        return m.reply(`🎬 *ᴀᴜᴛᴏᴍᴇᴅɪᴀ*\n\n> ✅ ¡Activado con éxito!\n> Los stickers se convertirán automáticamente en imágenes/videos ¡Shishishi!`)
    }
    
    if (arg === 'off' || arg === '0' || arg === 'nonaktif') {
        if (!current) {
            return m.reply(`🎬 *ᴀᴜᴛᴏᴍᴇᴅɪᴀ*\n\n> ¡Ya está desactivado!`)
        }
        db.setGroup(m.chat, { automedia: false })
        await db.save()
        return m.reply(`🎬 *ᴀᴜᴛᴏᴍᴇᴅɪᴀ*\n\n> ❌ ¡Desactivado con éxito!`)
    }
    
    return m.reply(`❌ Usa: \`${m.prefix}automedia on/off\``)
}

async function autoMediaHandler(m, sock) {
    try {
        if (!m) return false
        if (!m.isGroup) return false
        if (m.isCommand) return false
        if (m.fromMe === true) return false
        
        const db = getDatabase()
        const groupData = db.getGroup(m.chat) || {}
        
        if (!groupData.automedia) return false
        
        const msg = m.message
        if (!msg) return false
        
        const hasSticker = msg.stickerMessage
        if (!hasSticker) return false
        
        if (hasSticker.isAnimated) return false
        
        const buffer = await m.download()
        if (!buffer || buffer.length === 0) return false
        
        await sock.sendMedia(m.chat, buffer, null, m, { 
            type: 'image',
        })
        
        return true
    } catch (err) {
        return false
    }
}

export { pluginConfig as config, handler, autoMediaHandler }