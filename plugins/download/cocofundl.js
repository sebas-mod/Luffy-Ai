import { cocofun } from 'btch-downloader'
import te from '../../src/lib/luffy-error.js'
import { card, fail, usage } from '../../src/lib/luffy-dl-ui.js'
const pluginConfig = {
    name: 'cocofundl',
    alias: ['cfdl', 'cocofun', 'cf'],
    category: 'download',
    description: 'Descarga videos de CocoFun',
    usage: '.cfdl <url>',
    example: '.cfdl https://www.cocofun.com/share/post/xxx',
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
            `✦ • ─── • ✦\n🎥 *𝗖 𝗢 𝗖 𝗢 𝗙 𝗨 𝗡*\n──────────\n` +
            `> Descarga el video de *CocoFun* sin marca de agua.\n\n` +
            usage(m.prefix, m.command, 'https://www.cocofun.com/share/post/xxx')
        )
    }
    
    if (!url.match(/cocofun\.com/i)) {
        return m.reply(fail('COCOFUN', 'URL no válida. Usa un enlace de CocoFun.'))
    }
    
    await m.react('🕕')
    
    try {
        const data = await cocofun(url)
        
        if (!data?.status || !data?.result) {
            await m.react('❌')
            return m.reply(fail('COCOFUN', 'Error al obtener el video. Prueba con otro enlace.'))
        }
        
        const result = data.result
        const videoUrl = result.no_watermark || result.watermark
        
        if (!videoUrl) {
            await m.react('❌')
            return m.reply(fail('COCOFUN', 'Video no encontrado.'))
        }

        const caption = card({
            emoji: '🎥',
            title: '𝗖𝗢𝗖𝗢𝗙𝗨𝗡',
            fields: [
                ['Tema', result.topic],
                ['Descripción', result.caption],
                ['Duración', result.duration + 's'],
                ['Reproducciones', result.play],
                ['Me gusta', result.like],
                ['Compartidos', result.share],
            ],
            footer: '¡Video listo sin marca de agua! ✨',
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