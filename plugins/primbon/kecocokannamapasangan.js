import axios from 'axios'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'acocokannombrepasangan',
    alias: ['cocoknombre', 'matchname'],
    category: 'primbon',
    description: 'Verificar compatibilidad de nombres de pareja',
    usage: '.acocokannombrepasangan <nombre1> <nombre2>',
    example: '.acocokannombrepasangan putu ayla',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    if (m.args.length < 2) {
        return m.reply(`💕 *ᴋᴇᴄᴏᴄᴏᴋᴀɴ ɴᴀᴍᴀ*\n\n> Format: nombre1 nombre2\n\n\`Ejemplo: ${m.prefix}acocokannombrepasangan putu ayla\``)
    }
    
    const [nama1, nama2] = m.args
    
    m.react('💕')
    
    try {
        const url = `https://api.siputzx.my.id/api/primbon/acocokan_nombre_pasangan?nombre1=${encodeURIComponent(nama1)}&nombre2=${encodeURIComponent(nama2)}`
        const { data } = await axios.get(url, { timeout: 30000 })
        
        if (!data?.status || !data?.data) {
            m.react('❌')
            return m.reply(`❌ *FALLÓ*\n\n> Fallo al analizar`)
        }
        
        const result = data.data
        const response = `💕 *ᴋᴇᴄᴏᴄᴏᴋᴀɴ ɴᴀᴍᴀ ᴘᴀsᴀɴɢᴀɴ*\n\n` +
            `> 👤 ${result.nama_anda}\n` +
            `> 💑 ${result.nama_pasangan}\n\n` +
            `✅ *ʟᴀᴅᴇ ᴘᴏꜱɪᴛɪᴠᴀ:*\n${result.sisi_positif}\n\n` +
            `❌ *ʟᴀᴅᴇ ɴᴇɢᴀᴛɪᴠᴀ:*\n${result.sisi_negatif}\n\n` +
            `> _${result.catatan}_`
        
        m.react('✅')
        await m.reply(response)
        
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }