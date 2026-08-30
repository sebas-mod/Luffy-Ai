import axios from 'axios'
import { f } from '../../src/lib/luffy-http.js'
import te from '../../src/lib/luffy-error.js'
const pluginConfig = {
    name: 'balogo',
    alias: ['bluearchivelogo', 'ba'],
    category: 'canvas',
    description: 'Crea logo estilo Blue Archive',
    usage: '.balogo <texto1> & <texto2>',
    example: '.balogo Blue & Archive',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    carne: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const input = m.text?.trim() || ''
    const parts = input.split(/[&,]/).map(s => s.trim()).filter(s => s)

    if (parts.length < 2) {
        return m.reply(`☽◯☾ ╭ ♰ 🎨 CANVAS ♰ ━╮ ☽◯☾\n🎨 *ʟᴏɢᴏ ʙʟᴜᴇ ᴀʀᴄʜɪᴠᴇ*\n╰━ ⊱༺༒༻⊰ ━╯\n\n> Ingresa 2 textos para el logo\n\n☽◯☾ ♰ Ejemplo: ${m.prefix}balogo Blue & Archive`)
    }

    const textL = parts[0]
    const textR = parts[1]

    m.react('🕕')

    try {

        await sock.sendMedia(m.chat, `https://api.nexray.web.id/maker/balogo?text=${encodeURIComponent(textL)} ${encodeURIComponent(textR)}`, null, m, {
            type: 'image',
        })

        m.react('✅')

    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }