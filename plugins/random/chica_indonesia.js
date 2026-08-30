import axios from 'axios'
import config from '../../config.js'
import te from '../../src/lib/luffy-error.js'
const pluginConfig = {
    name: 'chica_indonesia',
    alias: ['cewekindo', 'cewekindonesia'],
    category: 'cecan',
    description: 'Imagen aleatoria de chica hermosa de Indonesia',
    usage: '.chica_indonesia',
    example: '.chica_indonesia',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    carne: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const api = 'https://api.nexray.web.id/random/cecan/indonesia'
    await m.react('🇮🇩')
    try {
        await sock.sendMedia(m.chat, api, null, m, {
            type: 'image'
        })
        await m.react('✅')
    } catch (e) {
        await m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }