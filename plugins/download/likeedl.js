import likee from '../../src/scraper/likee.js'
import te from '../../src/lib/luffy-error.js'
const pluginConfig = {
    name: 'likeedl',
    alias: ['lkdl', 'likee', 'lk'],
    category: 'download',
    description: 'Descarga videos de Likee',
    usage: '.lkdl <url>',
    example: '.lkdl https://likee.video/@xxx',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    carne: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const url = m.text?.trim()
    
    if (!url) {
        return m.reply(
            `⚠️ *ᴄᴏᴍᴏ ᴜsᴀʀ*\n\n` +
            `> \`${m.prefix}lkdl <url>\`\n\n` +
            `> Ejemplo:\n` +
            `> \`${m.prefix}lkdl https://likee.video/@xxx\``
        )
    }
    
    if (!url.match(/likee\.(video|com)/i)) {
        return m.reply(`✦ • ─── • ✦\n❌ URL no válida. Usa un enlace de Likee.`)
    }
    
    await m.react('🕕')
    
    try {
        const data = await likee(url)
        
        if (!data) {
            return m.reply(`✦ • ─── • ✦\n❌ Error al obtener el video. Prueba con otro enlace.`)
        }
        
        const videoUrl = data.without_watermark || data.with_watermark
        
        if (!videoUrl) {
            return m.reply(`✦ • ─── • ✦\n❌ Video no encontrado.`)
        }
        
        await sock.sendMedia(m.chat, videoUrl, null, m, {
            type: 'video',
            contextInfo: {
                forwardingScore: 99,
                isForwarded: true
            }
        })
        
        await m.react('✅')
        
    } catch (err) {
        return m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }