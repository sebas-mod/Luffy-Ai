import axios from 'axios'
import config from '../../config.js'
import { f } from '../../src/lib/luffy-http.js'
import te from '../../src/lib/luffy-error.js'
const NEOXR_APIKEY = config.APIkey?.neoxr || 'Milik-Bot-Luffy-Ai'

const pluginConfig = {
    name: 'senja',
    alias: ["palabras_amor", "romanticquotes"],
    category: 'fun',
    description: 'Palabras románticas aleatorias (senja)',
    usage: '.senja',
    example: '.senja',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    carne: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    m.react('🕕')
    try {
        const res = await f(`https://api.neoxr.eu/api/senja?apikey=${NEOXR_APIKEY}`)
        
        if (!res.status || !res.data?.text) {
            m.react('❌')
            return m.reply(`❌ Error al obtener las palabras románticas`)
        }
        await m.reply(`🌆 ──────────\n${res.data.text}\n──────────`)
        m.react('✅')
    } catch (err) {
        m.react('☢')
        return m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }