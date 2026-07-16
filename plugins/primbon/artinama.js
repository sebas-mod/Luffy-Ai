import axios from 'axios'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'artinombre',
    alias: ['nombremeaning', 'artinombreku'],
    category: 'primbon',
    description: 'Cek arti nombre menurut primbon',
    usage: '.artinombre <nombre>',
    example: '.artinombre putu',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const nama = m.args.join(' ')
    if (!nama) {
        return m.reply(`📛 *ᴀʀᴛɪ ɴᴀᴍᴀ*\n\n> Ingresa nombre\n\n\`Ejemplo: ${m.prefix}artinombre putu\``)
    }
    
    m.react('📛')
    
    try {
        const url = `https://api.siputzx.my.id/api/primbon/artinombre?nombre=${encodeURIComponent(nama)}`
        const { data } = await axios.get(url, { timeout: 30000 })
        
        if (!data?.status || !data?.data) {
            m.react('❌')
            return m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> No puede menganalisa nombre`)
        }
        
        const result = data.data
        const response = `📛 *ᴀʀᴛɪ ɴᴀᴍᴀ*\n\n` +
            `> Nombre: *${result.nama}*\n\n` +
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