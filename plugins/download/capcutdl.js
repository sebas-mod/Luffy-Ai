import { capcut } from 'btch-downloader'
import te from '../../src/lib/luffy-error.js'
const pluginConfig = {
    name: 'capcutdl',
    alias: ['ccdl', 'capcut', 'cc'],
    category: 'download',
    description: 'Descarga videos de CapCut',
    usage: '.ccdl <url>',
    example: '.ccdl https://www.capcut.com/t/xxx',
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
            `> \`${m.prefix}ccdl <url>\`\n\n` +
            `> Ejemplo:\n` +
            `> \`${m.prefix}ccdl https://www.capcut.com/t/xxx\``
        )
    }

    if (!url.match(/capcut\.com/i)) {
        return m.reply(`✦ • ─── • ✦\n❌ URL no válida. Usa un enlace de CapCut.`)
    }

    await m.react('🕕')

    try {
        const data = await capcut(url)

        if (!data?.status || !data?.originalVideoUrl) {
            return m.reply(`✦ • ─── • ✦\n❌ Error al obtener el video. Prueba con otro enlace.`)
        }

        await sock.sendMedia(m.chat, data.originalVideoUrl, null, m, {
            type: 'video',
            contextInfo: {
                forwardingScore: 99,
                isForwarded: true
            }
        })

    } catch (err) {
        return m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }