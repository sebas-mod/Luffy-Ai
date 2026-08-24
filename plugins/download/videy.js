import axios from 'axios'
import config from '../../config.js'
import { f } from '../../src/lib/luffy-http.js'
import te from '../../src/lib/luffy-error.js'
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
            `🎬 *ᴠɪᴅᴇʏ ᴅᴏᴡɴʟᴏᴀᴅ*\n\n` +
            `> Ingresa la URL de videy.co\n\n` +
            `\`Ejemplo: ${m.prefix}videy https://videy.co/v?id=7ZH1ZRIF\``
        )
    }
    
    if (!url.match(/videy\.co/i)) {
        return m.reply(`✦ • ─── • ✦\n❌ URL no válida. Usa un enlace de videy.co`)
    }
    
    m.react('🕕')
    
    try {
        const data = await f(`https://api.neoxr.eu/api/videy?url=${encodeURIComponent(url)}&apikey=${NEOXR_APIKEY}`)
        
        if (!data?.status || !data?.data?.url) {
            m.react('❌')
            return m.reply(`✦ • ─── • ✦\n❌ Error al obtener el video. Enlace no válido o caducado.`)
        }
        
        const videoUrl = data.data.url
        
        await sock.sendMedia(m.chat, videoUrl, null, m, {
            type: 'video',
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