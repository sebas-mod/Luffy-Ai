import axios from 'axios'
import config from '../../config.js'
import { f } from '../../src/lib/luffy-http.js'
import te from '../../src/lib/luffy-error.js'
import { card, fail, usage } from '../../src/lib/luffy-dl-ui.js'
const NEOXR_APIKEY = config.APIkey?.neoxr || 'Milik-Bot-Luffy-Ai'

const pluginConfig = {
    name: 'videy',
    alias: ['vdl', 'videydownload', 'videydl'],
    category: 'download',
    description: 'Descarga videos de videy.co',
    usage: '.videy <url>',
    example: '.videy https://videy.co/v?id=7ZH1ZRIF',
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
            `🎬 *𝗩𝗜𝗗𝗘𝗬*\n──────────\n` +
            `> Descarga videos de videy.co directamente\n\n` +
            usage(m.prefix, 'videy', 'https://videy.co/v?id=7ZH1ZRIF')
        )
    }
    
    if (!url.match(/videy\.co/i)) {
        m.react('❌')
        return m.reply(fail('VIDEY', 'URL no válida. Usa un enlace de videy.co'))
    }
    
    m.react('🕕')
    
    try {
        const data = await f(`https://api.neoxr.eu/api/videy?url=${encodeURIComponent(url)}&apikey=${NEOXR_APIKEY}`)
        
        if (!data?.status || !data?.data?.url) {
            m.react('❌')
            return m.reply(fail('VIDEY', 'Error al obtener el video. Enlace no válido o caducado.'))
        }
        
        const videoUrl = data.data.url

        const caption = card({
            emoji: '🎬',
            title: '𝗩𝗜𝗗𝗘𝗬',
            fields: [
                ['Formato', 'Video (.mp4)'],
                ['Origen', 'videy.co'],
            ],
            footer: 'Descarga lista, a disfrutar! 🚀',
        })
        
        await sock.sendMedia(m.chat, videoUrl, null, m, {
            type: 'video',
            caption,
            contextInfo: {
                forwardingScore: 99,
                isForwarded: true
            }
        })
        
        m.react('✅')
        
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }