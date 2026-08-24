import axios from 'axios'
import config from '../../config.js'
import { f } from '../../src/lib/luffy-http.js'
import te from '../../src/lib/luffy-error.js'
const pluginConfig = {
    name: 'bratanime',
    alias: ['animebrat'],
    category: 'sticker',
    description: 'Crea sticker brat',
    usage: '.animebrat <texto>',
    example: '.animebrat Hola a todos',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    carne: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const text = m.args.join(' ')
    if (!text) {
        return m.reply(`✦ • ─── • ✦\n🖼️ *ʙʀᴀᴛ ᴀɴɪᴍᴇ sᴛɪᴄᴋᴇʀ*\n\n> Ingresa el texto\n\n\`╰┈➤ Ejemplo: ${m.prefix}animebrat Hola a todos\``)
    }
    
    m.react('🕕')
    
    try {
        const url = `https://api.nexray.web.id/maker/bratanime?text=${encodeURIComponent(text)}`
        await sock.sendImageAsSticker(m.chat, url, m, {
            packname: config.sticker.packname,
            author: config.sticker.author
        })
        m.react('✅')
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }