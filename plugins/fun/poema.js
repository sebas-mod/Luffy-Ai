import axios from 'axios'
import config from '../../config.js'
import { f } from '../../src/lib/luffy-http.js'
import te from '../../src/lib/luffy-error.js'
const NEOXR_APIKEY = config.APIkey?.neoxr || 'Milik-Bot-Luffy-Ai'

const pluginConfig = {
    name: 'poema',
    alias: ['poemas', 'poema_random', 'poesia'],
    category: 'fun',
    description: 'Poema aleatorio de Indonesia',
    usage: '.poema',
    example: '.poema',
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
        const res = await f(`https://api.neoxr.eu/api/puisi?apikey=${NEOXR_APIKEY}`)
        
        if (!res.status || !res.data?.text) {
            m.react('❌')
            return m.reply(`❌ Error al obtener el poema`)
        }
        
        const text = res.data.text
        await m.reply(text)
        m.react('✅')
        
    } catch (err) {
        m.react('☢')
        return m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }