import { snackvideo } from 'btch-downloader'
import te from '../../src/lib/luffy-error.js'
import { card, fail, usage } from '../../src/lib/luffy-dl-ui.js'
const pluginConfig = {
    name: 'snackvideodl',
    alias: ['svdl', 'snackvideo', 'sv'],
    category: 'download',
    description: 'Descarga videos de SnackVideo',
    usage: '.svdl <url>',
    example: '.svdl https://www.snackvideo.com/@xxx/video/xxx',
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
            `🍿 *𝗦𝗡𝗔𝗖𝗞𝗩𝗜𝗗𝗘𝗢*\n──────────\n` +
            `> Descarga videos de SnackVideo sin complicaciones\n\n` +
            usage(m.prefix, 'svdl', 'https://www.snackvideo.com/@xxx/video/xxx')
        )
    }
    
    if (!url.match(/snackvideo\.com/i)) {
        m.react('❌')
        return m.reply(fail('SNACKVIDEO', 'URL no válida. Usa un enlace de SnackVideo.'))
    }
    
    await m.react('🕕')
    
    try {
        const data = await snackvideo(url)
        
        if (!data?.status || !data?.result?.videoUrl) {
            m.react('❌')
            return m.reply(fail('SNACKVIDEO', 'Error al obtener el video. Prueba con otro enlace.'))
        }
        
        const result = data.result
        const it = result.interaction || {}
        const creator = result.creator || {}

        const caption = card({
            emoji: '🍿',
            title: '𝗦𝗡𝗔𝗖𝗞𝗩𝗜𝗗𝗘𝗢',
            fields: [
                ['Título', result.title || result.description],
                ['Autor', creator.name || creator.username],
                ['Duración', result.duration ? result.duration + 's' : undefined],
                ['Publicado', result.uploadDate],
                ['Vistas', it.views],
                ['Me gusta', it.likes],
                ['Compartidos', it.shares],
            ],
            footer: 'Video sin marca de agua, listo! 🚀',
        })
        
        await sock.sendMedia(m.chat, result.videoUrl, null, m, {
            type: 'video',
            caption,
            contextInfo: {
                forwardingScore: 99,
                isForwarded: true
            }
        })

        m.react('✅')
        
    } catch (err) {
        m.react('☢')
        return m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }