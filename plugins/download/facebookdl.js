import { fbdown } from '../../src/scraper/fbdown.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'facebookdl',
    alias: ['fbdown', 'fb', 'facebook', 'fbdl'],
    category: 'download',
    description: 'Descargar video de Facebook',
    usage: '.facebookdl <url>',
    example: '.facebookdl https://www.facebook.com/watch?v=xxx',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const url = m.text?.trim()
    
    if (!url) {
        return m.reply(
            `⚠️ *CÓMO USAR*\n\n` +
            `- \`${m.prefix}facebookdl <url>\`\n\n` +
            `*Ejemplo:*\n` +
            `- \`${m.prefix}fbdown https://www.facebook.com/watch?v=xxx\``
        )
    }
    
    if (!url.match(/facebook\.com|fb\.watch|fb\.com/i)) {
        return m.reply(`❌ URL no válido. Usa un enlace de Facebook.`)
    }
    
    await m.react('🕕')
    
    try {
        const data = await fbdown(url)
        
        if (!data?.status || !data.result || !data.result.medias || data.result.medias.length === 0) {
            await m.react('❌')
            return m.reply(`❌ Error al obtener el video. Prueba con otro enlace o asegúrate de que la publicación sea pública.\n\n_Nota: El sistema actualmente no soporta la descarga de fotos de Facebook, solo videos._`)
        }
        
        // Find HD if available, else SD, else first item
        let video = data.result.medias.find(m => m.quality === "hd") || 
                    data.result.medias.find(m => m.quality === "sd") || 
                    data.result.medias[0];
        
        if (!video || !video.url) {
            await m.react('❌')
            return m.reply(`❌ Video no encontrado en ese enlace.\n\n_Nota: El sistema actualmente no soporta la descarga de fotos de Facebook, solo videos._`)
        }
        
        let caption = `🎥 *FACEBOOK DESCARGADOR*\n\n`
        caption += `*Título:* ${data.result.title || "Video de Facebook"}\n`
        caption += `*Calidad:* ${video.quality ? video.quality.toUpperCase() : "Normal"}\n`
        if (video.formattedSize) {
            caption += `*Tamaño:* ${video.formattedSize}\n`
        }
        caption += `\n_Nota: Esta función no soporta publicaciones de fotos._`

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
