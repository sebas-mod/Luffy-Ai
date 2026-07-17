import axios from 'axios'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'nomerhoki',
    alias: ['númerohoki', 'ceknúmero'],
    category: 'primbon',
    description: 'Verificar fortuna del número de celular',
    usage: '.nomerhoki <número>',
    example: '.nomerhoki 6281234567890',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    let nomor = m.args.join('').replace(/[^0-9]/g, '')
    if (!nomor) {
        return m.reply(`🍀 *ɴᴏᴍᴏʀ ʜᴏᴋɪ*\n\n> Ingresa número HP\n\n\`Ejemplo: ${m.prefix}nomerhoki 6281234567890\``)
    }
    
    m.react('🍀')
    
    try {
        const url = `https://api.siputzx.my.id/api/primbon/númerohoki?phoneNumber=${nomor}`
        const { data } = await axios.get(url, { timeout: 30000 })
        
        if (!data?.status || !data?.data) {
            m.react('❌')
            return m.reply(`❌ *FALLÓ*\n\n> Fallo al analizar número`)
        }
        
        const r = data.data
        const ep = r.energi_positif.details
        const en = r.energi_negatif.details
        
        const response = `🍀 *ɴᴏᴍᴏʀ ʜᴏᴋɪ*\n\n` +
            `> Número: *${r.nomor}*\n\n` +
            `📊 *ᴀɴɢᴋᴀ ʙᴀɢᴜᴀ:* ${r.angka_bagua_shuzi.value}%\n\n` +
            `✅ *ᴇɴᴇʀɢɪ ᴘᴏꜱɪᴛɪꜰ:* ${r.energi_positif.total}%\n` +
            `├ Riqueza: ${ep.kekayaan}\n` +
            `├ Salud: ${ep.kesehatan}\n` +
            `├ Amor: ${ep.cinta}\n` +
            `└ Estabilidad: ${ep.kestabilan}\n\n` +
            `❌ *ᴇɴᴇʀɢɪ ɴᴇɢᴀᴛɪꜰ:* ${r.energi_negatif.total}%\n` +
            `├ Conflictos: ${en.perselisihan}\n` +
            `├ Pérdidas: ${en.kehilangan}\n` +
            `├ Desgracias: ${en.malapetaka}\n` +
            `└ Destrucción: ${en.kehancuran}\n\n` +
            `> Status: ${r.analisis.status ? '✅ HOKI' : '❌ NO HOKI'}`
        
        m.react('✅')
        await m.reply(response)
        
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }