import { fbdown } from '../../src/scraper/fbdown.js'
import te from '../../src/lib/luffy-error.js'
import { card, fail, usage } from '../../src/lib/luffy-dl-ui.js'

const pluginConfig = {
    name: 'facebookdl',
    alias: ['fbdown', 'fb', 'facebook', 'fbdl'],
    category: 'download',
    description: 'Descarga videos de Facebook',
    usage: '.facebookdl <url>',
    example: '.facebookdl https://www.facebook.com/watch?v=xxx',
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
            `🎥 *𝗙𝗔𝗖𝗘𝗕𝗢𝗢𝗞*\n──────────\n` +
            `> Descarga videos de Facebook en alta calidad\n\n` +
            usage(m.prefix, 'facebookdl', 'https://www.facebook.com/watch?v=xxx')
        )
    }
    
    if (!url.match(/facebook\.com|fb\.watch|fb\.com/i)) {
        m.react('❌')
        return m.reply(fail('FACEBOOK', 'URL no válida. Usa un enlace de Facebook.'))
    }
    
    await m.react('🕕')
    
    try {
        const data = await fbdown(url)
        
        if (!data?.status || !data.result || !data.result.medias || data.result.medias.length === 0) {
            await m.react('❌')
            return m.reply(fail('FACEBOOK', 'Error al obtener el video. Prueba con otro enlace o asegúrate de que la publicación sea pública.') + `\n☽◯☾ ♰ _Nota: El sistema aún no soporta descargar fotos de Facebook, solo videos._`)
        }
        
        // Find HD if available, else SD, else first item
        let video = data.result.medias.find(m => m.quality === "hd") || 
                    data.result.medias.find(m => m.quality === "sd") || 
                    data.result.medias[0];
        
        if (!video || !video.url) {
            await m.react('❌')
            return m.reply(fail('FACEBOOK', 'No se encontró ningún video en ese enlace.') + `\n☽◯☾ ♰ _Nota: El sistema aún no soporta descargar fotos de Facebook, solo videos._`)
        }
        
        let caption = card({
            emoji: '🎥',
            title: '𝗙𝗔𝗖𝗘𝗕𝗢𝗢𝗞',
            fields: [
                ['Título', data.result.title || 'Video de Facebook'],
                ['Calidad', video.quality ? video.quality.toUpperCase() : 'Normal'],
                ['Tamaño', video.formattedSize],
            ],
            footer: 'Descarga sin marca de agua, listo! 🚀',
        })

        await sock.sendMedia(m.chat, video.url, caption, m, {
            type: 'video',
            contextInfo: {
                forwardingScore: 99,
                isForwarded: true
            }
        })
        
        await m.react('✅')
    } catch (err) {
        await m.react('❌')
        return m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }