import axios from 'axios'
import te from '../../src/lib/luffy-error.js'
const pluginConfig = {
    name: 'potensipenyakit',
    alias: ['cekpenyakit', 'penyakit'],
    category: 'primbon',
    description: 'Revisar la posible enfermedad según la fecha de nacimiento',
    usage: '.potensipenyakit <tgl> <bln> <thn>',
    example: '.potensipenyakit 12 05 1998',
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
        return m.reply(`🏥 *ᴘᴏsɪʙʟᴇ ᴇɴꜰᴇʀᴍᴇᴅᴀᴅ*\n\n> Formato: día mes año\n\n\`Ejemplo: ${m.prefix}potensipenyakit 12 05 1998\``)
    }
    
    const [tgl, bln, thn] = m.args
    
    m.react('🏥')
    
    try {
        const url = `https://api.siputzx.my.id/api/primbon/cek_potensi_penyakit?tgl=${tgl}&bln=${bln}&thn=${thn}`
        const { data } = await axios.get(url, { timeout: 30000 })
        
        if (!data?.status || !data?.data) {
            m.react('❌')
            return m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> Error al analizar`)
        }
        
        const result = data.data
        const response = `🏥 *ᴘᴏsɪʙʟᴇ ᴇɴꜰᴇʀᴍᴇᴅᴀᴅ*\n\n` +
            `> Fecha: *${tgl}-${bln}-${thn}*\n\n` +
            `📊 *sᴇᴄᴛᴏʀ:*\n${result.sektor}\n\n` +
            `⚠️ *ᴘᴏᴛᴇɴᴄɪᴀʟ:*\n${result.elemen}\n\n` +
            `> _${result.catatan}_`
        
        m.react('✅')
        await m.reply(response)
        
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }