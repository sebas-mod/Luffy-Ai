import config from '../../config.js'
import { f } from '../../src/lib/luffy-http.js'
import te from '../../src/lib/luffy-error.js'
import { card, fail, usage } from '../../src/lib/luffy-dl-ui.js'
const pluginConfig = {
    name: 'sfiledl',
    alias: ['sfile', 'sfiledownload'],
    category: 'download',
    description: 'Descarga archivos de Sfile.mobi',
    usage: '.sfiledl <url>',
    example: '.sfiledl https://sfile.mobi/xxx',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 15,
    carne: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const url = m.text?.trim()

    if (!url) {
        return m.reply(
            `🗂️ *𝗦𝗙𝗜𝗟𝗘*\n──────────\n` +
            `> Descarga archivos directamente desde Sfile.mobi\n\n` +
            usage(m.prefix, 'sfiledl', 'https://sfile.mobi/xxxxx')
        )
    }

    if (!url.includes('sfile.mobi') && !url.includes('sfile.co')) {
        m.react('❌')
        return m.reply(fail('SFILE', 'La URL debe ser de sfile.mobi o sfile.co!'))
    }

    m.react('🕕')

    try {
        const { data } = await f(`https://api.neoxr.eu/api/sfile?url=${encodeURIComponent(url)}&apikey=${config.APIkey.neoxr}`)

        if (!data.url) {
            m.react('❌')
            return m.reply(fail('SFILE', 'Error al obtener el enlace de descarga. Es posible que el archivo no esté disponible.'))
        }

        const caption = card({
            emoji: '🗂️',
            title: '𝗦𝗙𝗜𝗟𝗘',
            fields: [
                ['Archivo', data.filename],
                ['Tipo', data.mime],
                ['Enlace', data.url],
            ],
            footer: 'Descarga lista, buen provecho! 📦',
        })

        await sock.sendMedia(m.chat, data.url, null, m, {
            type: 'document',
            fileName: data.filename,
            mimetype: data.mime,
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