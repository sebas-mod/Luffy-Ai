import axios from 'axios'
import { uploadImage } from '../../src/lib/luffy-uploader.js'
import { f } from '../../src/lib/luffy-http.js'
import te from '../../src/lib/luffy-error.js'
const pluginConfig = {
    name: 'tofigure',
    alias: ['figure', 'figurestyle'],
    category: 'ai',
    description: 'Convertir la imagen a estilo Figure/Action',
    usage: '.tofigure (responde una imagen)',
    example: '.tofigure',
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
        return m.reply(`╭━━━〔 ✦ 〕━━━╮\n\n🎭 *ꜰɪɢᴜʀᴇ sᴛʏʟᴇ*\n\n> Envía/responde una imagen para convertirla a estilo Figure\n\n\`${m.prefix}tofigure\`\n\n╰━━━━━━━━━━━━╯`)
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
        
        const apiUrl = `https://api-faa.my.id/faa/tofigura?url=${encodeURIComponent(imageUrl)}`
        const res = await axios.get(apiUrl, { responseType: 'arraybuffer' })
        
        m.react('✅')
        
        await sock.sendMedia(m.chat, Buffer.from(res.data), null, m, {
            type: 'image',
        })
        
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }