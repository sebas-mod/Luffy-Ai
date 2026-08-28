import likee from '../../src/scraper/likee.js'
import te from '../../src/lib/luffy-error.js'
import { card, fail, usage } from '../../src/lib/luffy-dl-ui.js'
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
            `🎬 *𝗟𝗜𝗞𝗘𝗘*\n──────────\n` +
            `> Descarga videos de *Likee* sin marca de agua.\n\n` +
            usage(m.prefix, m.command, 'https://likee.video/@xxx')
        )
    }
    
    if (!url.match(/likee\.(video|com)/i)) {
        return m.reply(fail('LIKEE', 'URL no válida. Usa un enlace de Likee.'))
    }
    
    await m.react('🕕')
    
    try {
        const data = await likee(url)
        
        if (!data) {
            await m.react('❌')
            return m.reply(fail('LIKEE', 'Error al obtener el video. Prueba con otro enlace.'))
        }
        
        const videoUrl = data.without_watermark || data.with_watermark
        
        if (!videoUrl) {
            await m.react('❌')
            return m.reply(fail('LIKEE', 'Video no encontrado.'))
        }

        const caption = card({
            emoji: '🎬',
            title: '𝗟𝗜𝗞𝗘𝗘',
            fields: [
                ['Calidad', data.with_watermark ? 'Sin marca de agua' : 'Con marca de agua'],
            ],
            footer: '¡Disfruta tu video! 🚀',
        })
        
        await sock.sendMedia(m.chat, videoUrl, caption, m, {
            type: 'video',
            contextInfo: {
                forwardingScore: 99,
                isForwarded: true
            }
        })
        
        await m.react('✅')
        
    } catch (err) {
        m.react('❌')
        return m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }