import axios from 'axios'
import te from '../../src/lib/luffy-error.js'
import config from '../../config.js'

const pluginConfig = {
    name: 'igstalk',
    alias: ['instagramstalk', 'stalking'],
    category: 'stalker',
    description: 'Buscar perfil de Instagram',
    usage: '.igstalk <username>',
    example: '.igstalk cristiano',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    carne: 1,
    isEnabled: true
}

function shortNum(num) {
    if (!num) return '0'
    num = parseInt(num)
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1).replace('.0', '') + ' mil millones'
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace('.0', '') + ' M'
    if (num >= 1_000) return (num / 1_000).toFixed(1).replace('.0', '') + ' mil'
    return num.toString()
}

async function handler(m, { sock }) {
    const username = m.args[0]?.replace('@', '')
    
    if (!username) {
        return m.reply(
            `📸 *ɪɴsᴛᴀɢʀᴀᴍ sᴛᴀʟᴋ*\n\n` +
            `> Ingresa el username de Instagram\n\n` +
            `\`Ejemplo: ${m.prefix}igstalk cristiano\``
        )
    }
    
    m.react('🔍')
    
    try {
        const res = await axios.get(
            `https://firefly.maiku.my.id/api/stalk-instagram?apikey=${config.APIkey.firefly}&username=${encodeURIComponent(username)}`,
            { timeout: 30000 }
        )
        
        const d = res.data?.data
        if (!res.data?.status || !d?.username) {
            m.react('❌')
            return m.reply(`❌ La cuenta *@${username}* no fue encontrada`)
        }
        
        const caption = `📸 *ɪɴsᴛᴀɢʀᴀᴍ sᴛᴀʟᴋ*\n\n` +
            `👤 *Username:* ${d.username}\n` +
            `📛 *Nombre:* ${d.full_name || '-'}\n` +
            `✅ *Verificado:* ${d.is_verified ? 'Sí' : 'No'}\n` +
            `🔒 *Privado:* ${d.is_private ? 'Sí' : 'No'}\n\n` +
            `👥 *Seguidores:* ${shortNum(d.stats?.followers)}\n` +
            `👤 *Siguiendo:* ${shortNum(d.stats?.following)}\n` +
            `📷 *Publicaciones:* ${shortNum(d.stats?.posts)}\n\n` +
            `📝 *Bio:*\n${d.bio || '-'}\n\n` +
            `🔗 https://instagram.com/${d.username}`
        
        m.react('✅')
        
        const profilePic = d.profile_pic
        if (profilePic) {
            await sock.sendMessage(m.chat, {
                image: { url: profilePic },
                caption
            }, { quoted: m })
        } else {
            await m.reply(caption)
        }
        
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }