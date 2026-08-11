import axios from 'axios'
import te from '../../src/lib/luffy-error.js'
const pluginConfig = {
    name: 'artinama',
    alias: ['namameaning', 'artinamaku'],
    category: 'primbon',
    description: 'Comprobar el significado del nombre',
    usage: '.artinama <nama>',
    example: '.artinama putu',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    carne: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const nama = m.args.join(' ')
    if (!nama) {
        return m.reply(`📛 *ᴀʀᴛɪ ɴᴀᴍᴀ*\n\n> Ingresa tu nombre\n\n\`Ejemplo: ${m.prefix}artinama putu\``)
    }
    
    m.react('📛')
    
    try {
        const url = `https://api.siputzx.my.id/api/primbon/artinama?nama=${encodeURIComponent(nama)}`
        const { data } = await axios.get(url, { timeout: 30000 })
        
        if (!data?.status || !data?.data) {
            m.react('❌')
            return m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> No se pudo analizar el nombre`)
        }
        
        const result = data.data
        const response = `📛 *ᴀʀᴛɪ ɴᴀᴍᴀ*\n\n` +
            `> Nama: *${result.nama}*\n\n` +
            `${result.arti}\n\n` +
            `> _${result.catatan}_`
        
        m.react('✅')
        await m.reply(response)
        
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }