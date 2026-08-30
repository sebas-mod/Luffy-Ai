import { f } from '../../src/lib/luffy-http.js'
import config from '../../config.js'
import te from '../../src/lib/luffy-error.js'
const pluginConfig = {
    name: 'anime-gen',
    alias: ['animegen', 'aianimegen', 'genai-anime'],
    category: 'ai',
    description: 'Generar arte anime con IA a partir de un prompt',
    usage: '.anime-gen <prompt>',
    example: '.anime-gen girl, vibrant color, smilling',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 30,
    carne: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const prompt = m.text
    
    if (!prompt) {
        return m.reply(
            `☽◯☾ ╭━ ♰ ✦ ♰ ━╮ ☽◯☾\n\n` +
            `🎨 *ᴀɴɪᴍᴇ ᴀʀᴛ ɢᴇɴᴇʀᴀᴛᴏʀ*\n\n` +
            `> ¡Genera imágenes de anime con IA a partir de un prompt!\n\n` +
            `*ᴄᴏᴍᴏ ᴜꜱᴀʀʟᴏ:*\n` +
            `> \`${m.prefix}anime-gen <descripción>\`\n\n` +
            `*ᴇᴊᴇᴍᴘʟᴏ:*\n` +
            `> \`${m.prefix}anime-gen girl, vibrant color, smilling, yellow pink gradient hair\`\n` +
            `> \`${m.prefix}anime-gen boy, dark aesthetic, silver hair, red eyes\`\n\n` +
            `*ᴄᴏɴsᴇᴊᴏs:*\n` +
            `> • Usa inglés\n` +
            `> • Cuanto más detallado sea el prompt, mejor será el resultado\n` +
            `> • Añade estilo: vibrant, dark, pastel, etc\n\n` +
            `╰━ ⊱༺༒༻⊰ ━╯`
        )
    }
    
    m.react('🕕')

    try {
        const NEOXR_APIKEY = config.APIkey?.neoxr || 'Milik-Bot-Luffy-Ai'
        const apiUrl = `https://api.neoxr.eu/api/ai-anime?q=${encodeURIComponent(prompt)}&apikey=${NEOXR_APIKEY}`
        
        const data = await f(apiUrl)
        
        if (!data?.status || !data?.data?.url) {
            m.react('❌')
            return m.reply('❌ *ᴇʀʀᴏʀ*\n✧────────✧\n> Error al generar la imagen. ¡Inténtalo más tarde!')
        }
        
        const result = data.data  
        await sock.sendMedia(m.chat, result.url, null, m, {
            type: 'image'
        })
        m.react('✅')
    } catch (error) {
        m.react('☢')
        if (error.code === 'ECONNABORTED') {
            m.reply('⏱️ *ᴛɪᴇᴍᴘᴏ ᴀɢᴏᴛᴀᴅᴏ*\n✧────────✧\n> La solicitud tardó demasiado. ¡Inténtalo de nuevo!')
        } else {
            m.reply(te(m.prefix, m.command, m.pushName))
        }
    }
}

export { pluginConfig as config, handler }