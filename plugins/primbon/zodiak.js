import axios from 'axios'
import te from '../../src/lib/luffy-error.js'
const pluginConfig = {
    name: 'zodiak',
    alias: ['horoscope', 'ramalan'],
    category: 'primbon',
    description: 'Predicción del zodiaco',
    usage: '.zodiak <nama zodiak>',
    example: '.zodiak aries',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    carne: 0,
    isEnabled: true
}

const validZodiacs = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagitarius', 'capricorn', 'aquarius', 'pisces']

async function handler(m, { sock }) {
    const zodiac = m.args[0]?.toLowerCase()
    
    if (!zodiac || !validZodiacs.includes(zodiac)) {
        return m.reply(`⭐ *ᴢᴏᴅɪᴀᴄᴏ*\n\n> Introduce el nombre del zodiaco:\n\n${validZodiacs.map(z => `• ${z}`).join('\n')}\n\n\`Ejemplo: ${m.prefix}zodiak aries\``)
    }
    
    m.react('⭐')
    
    try {
        const url = `https://api.siputzx.my.id/api/primbon/zodiak?zodiak=${zodiac}`
        const { data } = await axios.get(url, { timeout: 30000 })
        
        if (!data?.status || !data?.data) {
            m.react('❌')
            return m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> Error al obtener la predicción`)
        }
        
        const r = data.data
        const response = `⭐ *ᴢᴏᴅɪᴀᴄᴏ ${zodiac.toUpperCase()}*\n\n` +
            `${r.zodiak}\n\n` +
            `🔢 *ɴúᴍᴇʀᴏ:* ${r.nomor_keberuntungan}\n` +
            `🌸 *ꜰʟᴏʀ:* ${r.bunga_keberuntungan}\n` +
            `🎨 *ᴄᴏʟᴏʀ:* ${r.warna_keberuntungan}\n` +
            `💎 *ᴘɪᴇᴅʀᴀ:* ${r.batu_keberuntungan}\n` +
            `🔥 *ᴇʟᴇᴍᴇɴᴛᴏ:* ${r.elemen_keberuntungan}\n` +
            `🪐 *ᴘʟᴀɴᴇᴛᴀ:* ${r.planet_yang_mengitari}\n` +
            `💕 *ᴘᴀʀᴇᴊᴀ:* ${r.pasangan_zodiak}`
        
        m.react('✅')
        await m.reply(response)
        
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }