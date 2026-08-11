import axios from 'axios'
import te from '../../src/lib/luffy-error.js'
const pluginConfig = {
    name: 'prediccion_amor',
    alias: ["ver_alma_gemela"],
    category: 'primbon',
    description: 'Predicción de pareja según el primbón javanés',
    usage: '.prediccion_amor nombre1 dia1 mes1 año1 nombre2 dia2 mes2 año2',
    example: '.prediccion_amor putu 16 11 2007 keyla 1 1 2008',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    carne: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    if (m.args.length < 8) {
        return m.reply(`💑 *ᴘʀᴇᴅɪᴄᴄɪóɴ ᴅᴇ ᴘᴀʀᴇᴊᴀ*\n\n> Formato:\nnombre1 día1 mes1 año1 nombre2 día2 mes2 año2\n\n\`Ejemplo:\n${m.prefix}prediccion_amor putu 16 11 2007 keyla 1 1 2008\``)
    }
    
    const [nombre1, dia1, mes1, año1, nombre2, dia2, mes2, año2] = m.args
    
    m.react('💑')
    
    try {
        const url = `https://api.siputzx.my.id/api/primbon/ramalanjodoh?nama1=${encodeURIComponent(nombre1)}&tgl1=${dia1}&bln1=${mes1}&thn1=${año1}&nama2=${encodeURIComponent(nombre2)}&tgl2=${dia2}&bln2=${mes2}&thn2=${año2}`
        const { data } = await axios.get(url, { timeout: 30000 })
        
        if (!data?.status || !data?.data?.result) {
            m.react('❌')
            return m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> Error al predecir`)
        }
        
        const r = data.data.result
        let response = `💑 *ᴘʀᴇᴅɪᴄᴄɪóɴ ᴅᴇ ᴘᴀʀᴇᴊᴀ*\n\n`
        response += `👤 *${r.orang_pertama.nama}*\n> ${r.orang_pertama.tanggal_lahir}\n\n`
        response += `👤 *${r.orang_kedua.nama}*\n> ${r.orang_kedua.tanggal_lahir}\n\n`
        response += `📜 *ʀᴇsᴜʟᴛᴀᴅᴏ ᴅᴇ ʟᴀ ᴘʀᴇᴅɪᴄᴄɪóɴ:*\n`
        
        r.hasil_ramalan.forEach((h, i) => {
            response += `${i+1}. ${h}\n\n`
        })
        
        response += `> ⚠️ _${data.data.peringatan}_`
        
        m.react('✅')
        await m.reply(response)
        
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }