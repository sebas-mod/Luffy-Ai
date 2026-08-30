import { uploadImage } from '../../src/lib/luffy-uploader.js'
import { f } from '../../src/lib/luffy-http.js'
import te from '../../src/lib/luffy-error.js'
import { live3d } from '../../src/scraper/seaart.js'
const pluginConfig = {
    name: 'tochibi',
    alias: ['chibi', 'chibistyle'],
    category: 'ai',
    description: 'Convertir la imagen a estilo Chibi',
    usage: '.tochibi (responde una imagen)',
    example: '.tochibi',
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
        return m.reply(`☽◯☾ ╭━ ♰ ✦ ♰ ━╮ ☽◯☾\n\n🎀 *ᴄʜɪʙɪ sᴛʏʟᴇ*\n\n> Envía/responde una imagen para convertirla a estilo Chibi\n\n\`${m.prefix}tochibi\`\n\n╰━ ⊱༺༒༻⊰ ━╯`)
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

        const PROMPT = `Transform into chibi style, big head and small body proportions, cute expression, big sparkling eyes, smooth shading, soft lighting, highly detailed, high quality`
        
        const result = await live3d(buffer, PROMPT)
        
        m.react('✅')
        
        await sock.sendMedia(m.chat, result.image, null, m, {
            type: 'image'
        })
        
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }