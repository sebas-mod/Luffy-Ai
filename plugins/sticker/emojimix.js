import config from '../../config.js'
import { f } from './../../src/lib/luffy-http.js'
import te from '../../src/lib/luffy-error.js'
const pluginConfig = {
    name: 'emojimix',
    alias: ['mixemoji', 'emix'],
    category: 'sticker',
    description: 'Combina 2 emojis en 1',
    usage: '.emojimix <emoji1><emoji2>',
    example: '.emojimix 😂🔥',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    carne: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const text = m.text?.trim()

    if (!text) {
        return m.reply(
            `🎭 *ᴇᴍᴏᴊɪ ᴍɪx*\n\n` +
            `> Combina 2 emojis en 1\n\n` +
            `> Ejemplo: \`${m.prefix}emojimix 😂🔥\``
        )
    }

    const emojiRegex = /\p{Extended_Pictographic}/gu
    const emojis = text.match(emojiRegex)

    if (!emojis || emojis.length < 2) {
        return m.reply(`✦ • ─── • ✦\n❌ ¡Ingresa al menos 2 emojis!\n──────────\n╰┈➤ Ejemplo: ${m.prefix}emojimix 😂🔥`)
    }

    const emoji1 = emojis[0]
    const emoji2 = emojis[1]

    m.react('🕕')

    try {
        const apiUrl = `https://api.neoxr.eu/api/emoji?q=${encodeURIComponent(emoji1 + '_' + emoji2)}&apikey=${config.APIkey.neoxr}`

        const data = await f(apiUrl)

        if (!data.status || !data.data?.url) {
            return m.reply(`✦ • ─── • ✦\n❌ ¡No se encontró la combinación de emojis!\n\n╰┈➤ Prueba con otros emojis.`)
        }

        const imageUrl = data.data.url

        await sock.sendImageAsSticker(m.chat, imageUrl, m, {
            packname: config.sticker.packname,
            author: config.sticker.author
        })

        m.react('✅')

    } catch (err) {
        console.log(err)
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }