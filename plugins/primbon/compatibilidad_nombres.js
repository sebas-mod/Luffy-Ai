import axios from 'axios'
import te from '../../src/lib/luffy-error.js'
const pluginConfig = {
    name: 'compatibilidad_nombres',
    alias: ['cocoknama', 'matchname'],
    category: 'primbon',
    description: 'Revisar la compatibilidad de nombres de pareja',
    usage: '.compatibilidad_nombres <nombre1> <nombre2>',
    example: '.compatibilidad_nombres putu keyla',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    carne: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    if (m.args.length < 2) {
        return m.reply(`💕 *ᴄᴏᴍᴘᴀᴛɪʙɪʟɪᴅᴀᴅ ᴅᴇ ɴᴏᴍʙʀᴇs*\n\n> Formato: nombre1 nombre2\n\n\`Ejemplo: ${m.prefix}compatibilidad_nombres putu keyla\``)
    }
    
    const [nama1, nama2] = m.args
    
    m.react('💕')
    
    try {
        const url = `https://api.siputzx.my.id/api/primbon/kecocokan_nama_pasangan?nama1=${encodeURIComponent(nama1)}&nama2=${encodeURIComponent(nama2)}`
        const { data } = await axios.get(url, { timeout: 30000 })
        
        if (!data?.status || !data?.data) {
            m.react('❌')
            return m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> Error al analizar`)
        }
        
        const result = data.data
        const response = `𓆩♡𓆪 ────────── 𓆩♡𓆪\n💕 *ᴄᴏᴍᴘᴀᴛɪʙɪʟɪᴅᴀᴅ ᴅᴇ ɴᴏᴍʙʀᴇs ᴅᴇ ᴘᴀʀᴇᴊᴀ*\n𓆩♡𓆪 ────────── 𓆩♡𓆪\n\n` +
            `✧ 👤 ${result.nama_anda}\n` +
            `✧ 💑 ${result.nama_pasangan}\n\n` +
            `꒰ა ໒꒱ *ᴀsᴘᴇᴄᴛᴏ ᴘᴏsɪᴛɪᴠᴏ:*\n${result.sisi_positif}\n\n` +
            `❀ *ᴀsᴘᴇᴄᴛᴏ ɴᴇɢᴀᴛɪᴠᴏ:*\n${result.sisi_negatif}\n\n` +
            `──────────\n✦ _${result.catatan}_`
        
        m.react('✅')
        await m.reply(response)
        
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }