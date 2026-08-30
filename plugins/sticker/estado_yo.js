import config from '../../config.js'
import te from '../../src/lib/luffy-error.js'
import { addExifToWebp, isAnimatedWebp, DEFAULT_METADATA } from '../../src/lib/luffy-exif.js'

const pluginConfig = {
    name: 'estado_yo',
    alias: ['wm', 'stickerwm', 'stickermark', 'colong'],
    category: 'sticker',
    description: 'Cambia el packname y el autor de un sticker',
    usage: '.swm <packname> o .swm <packname>|<autor>',
    example: '.swm BotName',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    carne: 1,
    isEnabled: true
}

async function handler(m, { sock, config: botConfig }) {
    const quoted = m.quoted
    
    if (!quoted) {
        return m.reply(
            `🖼️ *sᴛɪᴄᴋᴇʀ ᴡᴀᴛᴇʀᴍᴀʀᴋ*\n\n` +
            `> Responde un sticker con el caption:\n` +
            `> \`${m.prefix}estado_yo packname\`\n\n` +
            `*ᴇᴊᴇᴍᴘʟᴏ:*\n` +
            `> \`${m.prefix}estado_yo Luffy-Ai\`\n` +
            `> \`${m.prefix}estado_yo Luffy-Ai|LuckyArchz\` _(packname + author)_`
        )
    }
    
    const isSticker = quoted.type === 'stickerMessage' || quoted.isSticker
    if (!isSticker) {
        return m.reply(`♰ ┄ ── ☽◯☾ ── ┄ ♰\n❌ *ꜰᴀʟʟᴏ*\n\n> Responde un mensaje de sticker, no ${quoted.type?.replace('Message', '') || 'otro medio'}`)
    }
    
    const input = m.text?.trim()
    if (!input) {
        return m.reply(
            `❌ *ꜰᴀʟʟᴏ*\n\n` +
            `> Ingresa el packname\n\n` +
            `*ᴇᴊᴇᴍᴘʟᴏ:*\n` +
            `> \`${m.prefix}estado_yo Luffy-Ai\`\n` +
            `> \`${m.prefix}estado_yo Luffy-Ai|LuckyArchz\` _(+ author)_`
        )
    }
    
    let packname, author
    
    if (input.includes('|')) {
        const parts = input.split('|')
        packname = parts[0]?.trim() || ''
        author = parts[1]?.trim() || ''
    } else {
        packname = input
        author = ''
    }
    
    m.react('🕕')
    
    try {
        const buffer = await quoted.download()
        
        if (!buffer || buffer.length === 0) {
            m.react('❌')
            return m.reply(`♰ ┄ ── ☽◯☾ ── ┄ ♰\n❌ *ꜰᴀʟʟᴏ*\n\n> No se pudo descargar el sticker`)
        }
        
        const exifOpts = { packname, author, emojis: ['🤖'] }
        const riff = buffer.slice(0, 4).toString('ascii')
        const webpSig = buffer.length >= 12 ? buffer.slice(8, 12).toString('ascii') : ''
        const isWebp = riff === 'RIFF' && webpSig === 'WEBP'
        
        if (isWebp) {
            const stickerBuffer = await addExifToWebp(buffer, exifOpts)
            await sock.sendMessage(m.chat, {
                sticker: stickerBuffer,
                contextInfo: { isForwarded: true, forwardingScore: 1 }
            }, { quoted: m })
        } else {
            const isVideo = buffer.slice(0, 3).toString('hex') === '000000' ||
                            buffer.slice(4, 8).toString('ascii') === 'ftyp'
            
            if (isVideo) {
                await sock.sendVideoAsSticker(m.chat, buffer, m, exifOpts)
            } else {
                await sock.sendImageAsSticker(m.chat, buffer, m, exifOpts)
            }
        }
        
        m.react('✅')
        
    } catch (error) {
        console.error('[SWM] Error:', error.message)
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }