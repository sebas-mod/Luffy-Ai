import axios from 'axios'
import te from '../../src/lib/luffy-error.js'
import config from '../../config.js'

const pluginConfig = {
    name: 'ytstalk',
    alias: ['youtubestalk', 'stalkyt'],
    category: 'stalker',
    description: 'Buscar canal de YouTube',
    usage: '.ytstalk <username>',
    example: '.ytstalk mrbeast',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    carne: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const username = m.args[0]
    
    if (!username) {
        return m.reply(`☽◯☾ ♰ 📺 *ʏᴏᴜᴛᴜʙᴇ sᴛᴀʟᴋ*\n\n> Ingresa el username de YouTube\n\n\`Ejemplo: ${m.prefix}ytstalk mrbeast\``)
    }
    
    m.react('🔍')
    
    try {
        const res = await axios.get(`https://firefly.maiku.my.id/api/stalk-youtube?apikey=${config.APIkey.firefly}&username=${encodeURIComponent(username)}`, {
            timeout: 30000
        })
        
        if (!res.data?.status || !res.data?.data) {
            m.react('❌')
            return m.reply(`☽◯☾ ♰ ❌ Canal *${username}* no fue encontrado`)
        }
        
        const c = res.data.data
        
        let caption = `☽◯☾ ╭━ ♰ 📺 ʏᴏᴜᴛᴜʙᴇ sᴛᴀʟᴋ ♰ ━╮ ☽◯☾\n\n` +
            `☽◯☾ ♰ 👤 *Nombre:* ${c.name}\n` +
            `☽◯☾ ♰ 🔗 *Username:* @${username}\n` +
            `☽◯☾ ♰ ✅ *Verificado:* ${c.verified ? 'Sí' : 'No'}\n──────────\n` +
            `☽◯☾ ♰ 👥 *Subscribers:* ${c.subscribers}\n` +
            `☽◯☾ ♰ 🎬 *Total de videos:* ${c.video_count}\n──────────\n` +
            `📝 *Descripción:*\n${c.about || '-'}\n──────────\n` +
            `🔗 ${c.url}\n\n╰━ ⊱༺༒༻⊰ ━╯`
            
        m.react('✅')
        
        await sock.sendMessage(m.chat, {
            image: { url: c.thumbnail },
            caption
        }, { quoted: m })
        
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }