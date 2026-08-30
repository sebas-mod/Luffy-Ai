import axios from 'axios'
import { uploadImage } from '../../src/lib/luffy-uploader.js'
import { f } from '../../src/lib/luffy-http.js'
import te from '../../src/lib/luffy-error.js'
const pluginConfig = {
    name: 'tomekah',
    alias: ['mekah', 'mecca', 'tomecca'],
    category: 'ai',
    description: 'Cambiar el fondo de la imagen a La Meca',
    usage: '.tomekah (responde una imagen)',
    example: '.tomekah',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 30,
    carne: 2,
    isEnabled: true
}

async function handler(m, { sock }) {
    const isImage = m.isImage || (m.quoted && m.quoted.type === 'imageMessage')
    
    if (!isImage) {
        return m.reply(`☽◯☾ ╭━ ♰ ✦ ♰ ━╮ ☽◯☾\n\n🕋 *ᴍᴇᴋᴀʜ sᴛʏʟᴇ*\n\n> Envía/responde una imagen\n\n\`${m.prefix}tomekah\`\n\n╰━ ⊱༺༒༻⊰ ━╯`)
    }
    
    m.react('🕕')
    
    try {
        let buffer
        if (m.quoted && m.quoted.isMedia) {
            buffer = await m.quoted.download()
        } else if (m.isMedia) {
            buffer = await m.download()
        }
        
        if (!buffer) {
            m.react('❌')
            return m.reply(`✧ ❌ No se pudo descargar la imagen`)
        }
        
        const imageUrl = await uploadImage(buffer, 'image.jpg')
        
        const url = `https://api-faa.my.id/faa/tomekah?url=${encodeURIComponent(imageUrl)}`
        const res = await f(url, 'arrayBuffer')
        
        m.react('✅')
        
        await sock.sendMedia(m.chat, Buffer.from(res), null, m, {
            type: 'image',
        })
        
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }