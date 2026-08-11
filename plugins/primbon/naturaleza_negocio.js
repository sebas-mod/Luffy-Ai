import axios from 'axios'
import te from '../../src/lib/luffy-error.js'
const pluginConfig = {
    name: 'naturaleza_negocio',
    alias: ['usahabisnis', 'sifatbisnis'],
    category: 'primbon',
    description: 'Revisar la naturaleza del negocio según la fecha de nacimiento',
    usage: '.naturaleza_negocio <dia> <mes> <año>',
    example: '.naturaleza_negocio 1 1 2000',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    carne: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    if (m.args.length < 3) {
        return m.reply(`💼 *ɴᴀᴛᴜʀᴀʟᴇᴢᴀ ᴅᴇʟ ɴᴇɢᴏᴄɪᴏ*\n\n> Formato: día mes año\n\n\`Ejemplo: ${m.prefix}naturaleza_negocio 1 1 2000\``)
    }
    
    const [tgl, bln, thn] = m.args
    
    m.react('💼')
    
    try {
        const url = `https://api.siputzx.my.id/api/primbon/sifat_usaha_bisnis?tgl=${tgl}&bln=${bln}&thn=${thn}`
        const { data } = await axios.get(url, { timeout: 30000 })
        
        if (!data?.status || !data?.data) {
            m.react('❌')
            return m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> Error al analizar`)
        }
        
        const r = data.data
        const response = `💼 *ɴᴀᴛᴜʀᴀʟᴇᴢᴀ ᴅᴇʟ ɴᴇɢᴏᴄɪᴏ*\n\n` +
            `> Nacido: *${r.hari_lahir}*\n\n` +
            `📊 *ᴀɴáʟɪsɪs:*\n${r.usaha}\n\n` +
            `> _${r.catatan}_`
        
        m.react('✅')
        await m.reply(response)
        
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }