import axios from 'axios'
import config from '../../config.js'
import te from '../../src/lib/luffy-error.js'
const pluginConfig = {
    name: 'chords',
    alias: ['chord', 'kunci', 'kuncigitar'],
    category: 'search',
    description: 'Buscar acordes de guitarra de canciones',
    usage: '.chords <judul lagu>',
    example: '.chords komang',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    carne: 0,
    isEnabled: true
}

const NEOXR_APIKEY = config.APIkey?.neoxr || 'Milik-Bot-Luffy-Ai'

async function handler(m, { sock }) {
    const text = m.text?.trim()
    
    if (!text) {
        return m.reply(
            `🎸 *ʙᴜsǫᴜᴇᴅᴀ ᴅᴇ ᴀᴄᴏʀᴅᴇs*\n\n` +
            `> Buscar acordes de guitarra de canciones\n\n` +
            `> Ejemplo:\n` +
            `\`${m.prefix}chords komang\`\n` +
            `\`${m.prefix}chord perjalanan terindah\``
        )
    }
    
    m.react('🕕')
    
    try {
        const { data } = await axios.get(`https://api.neoxr.eu/api/chord?q=${encodeURIComponent(text)}&apikey=${NEOXR_APIKEY}`, {
            timeout: 30000
        })
        
        if (!data?.status || !data?.data?.chord) {
            m.react('❌')
            return m.reply(`❌ No se encontraron acordes para: \`${text}\``)
        }
        
        const chord = data.data.chord

        const caption = `${chord}`
        await m.reply(caption)
        m.react('✅')
        
    } catch (err) {
        m.react('☢')
        return m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }