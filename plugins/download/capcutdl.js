import { capcut } from 'btch-downloader'
import te from '../../src/lib/luffy-error.js'
import { card, fail, usage } from '../../src/lib/luffy-dl-ui.js'
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
            `✦ • ─── • ✦\n🎬 *𝗖 𝗔 𝗣 𝗖 𝗨 𝗧*\n──────────\n` +
            `> Descarga el video de *CapCut* que quieras sin marca de agua.\n\n` +
            usage(m.prefix, m.command, 'https://www.capcut.com/t/xxx')
        )
    }

    if (!url.match(/capcut\.com/i)) {
        return m.reply(fail('CAPCUT', 'URL no válida. Usa un enlace de CapCut.'))
    }

    await m.react('🕕')

    try {
        const data = await capcut(url)

        if (!data?.status || !data?.originalVideoUrl) {
            await m.react('❌')
            return m.reply(fail('CAPCUT', 'Error al obtener el video. Prueba con otro enlace.'))
        }

        const caption = card({
            emoji: '🎬',
            title: '𝗖𝗔𝗣𝗖𝗨𝗧',
            fields: [
                ['Título', data.title],
                ['Autor', data.authorName],
            ],
            footer: 'Video listo sin marca de agua ✨',
        })

        await sock.sendMedia(m.chat, data.originalVideoUrl, caption, m, {
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