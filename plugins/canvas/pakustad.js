import { f } from '../../src/lib/luffy-http.js'
import te from '../../src/lib/luffy-error.js'
const pluginConfig = {
    name: ['pakustad', 'pak-ustad', 'tanyaustad'],
    alias: [],
    category: 'fun',
    description: 'Pregúntale al maestro (ustad) (imagen)',
    usage: '.pakustad <pregunta>',
    example: '.pakustad por qué soy guapo',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    carne: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const text = m.text || m.quoted?.text
    
    if (!text) {
        return m.reply(
            `⚠️ *ᴄᴏᴍᴏ ᴜꜱᴀʀʟᴏ*\n\n` +
            `> \`${m.prefix}pakustad <pregunta>\`\n\n` +
            `> Ejemplo: \`${m.prefix}pakustad por qué soy guapo\``
        )
    }
    
    await m.react('🕕')
    
    try {
        const apiUrl = `https://api.cuki.biz.id/api/canvas/ustadz?apikey=cuki-x&text=${encodeURIComponent(text)}`
        const { results } = await f(apiUrl)
        await sock.sendMedia(m.chat, results.url, text, m, {
            type: 'image'
        })
        
        m.react('✅')
        
    } catch (err) {
        m.react('☢')
        return m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }