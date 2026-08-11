import axios from 'axios'
import te from '../../src/lib/luffy-error.js'
const pluginConfig = {
    name: 'tafsirmimpi',
    alias: ['artimimpi', 'mimpi'],
    category: 'primbon',
    description: 'Buscar el significado de los sueños',
    usage: '.tafsirmimpi <kata kunci>',
    example: '.tafsirmimpi bertemu',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    carne: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const keyword = m.args.join(' ')
    if (!keyword) {
        return m.reply(`🌙 *ᴛᴀꜰsɪʀ ᴍɪᴍᴘɪ*\n\n> Ingresa la palabra clave del sueño\n\n\`Ejemplo: ${m.prefix}tafsirmimpi bertemu\``)
    }
    
    m.react('🌙')
    
    try {
        const url = `https://api.siputzx.my.id/api/primbon/tafsirmimpi?mimpi=${encodeURIComponent(keyword)}`
        const { data } = await axios.get(url, { timeout: 30000 })
        
        if (!data?.status || !data?.data?.hasil?.length) {
            m.react('❌')
            return m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> No se encontró significado para: ${keyword}`)
        }
        
        const r = data.data
        let response = `🌙 *ᴛᴀꜰsɪʀ ᴍɪᴍᴘɪ*\n\n`
        response += `> Kata kunci: *${r.keyword}*\n`
        response += `> Encontrados: *${r.total} resultados*\n\n`
        
        r.hasil.slice(0, 10).forEach((h, i) => {
            response += `*${i+1}. ${h.mimpi}*\n> ${h.tafsir}\n\n`
        })
        
        if (r.total > 10) {
            response += `_...y ${r.total - 10} resultados más_`
        }
        
        m.react('✅')
        await m.reply(response)
        
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }