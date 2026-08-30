import config from '../../config.js'
import { getDatabase } from '../../src/lib/luffy-database.js'
const pluginConfig = {
    name: 'lista_ban',
    alias: ['listbanned', 'banlist'],
    category: 'owner',
    description: 'Ver la lista de usuarios baneados',
    usage: '.listban',
    example: '.listban',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    carne: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const bannedUsers = config.bannedUsers && config.bannedUsers.length > 0 ? config.bannedUsers : (db.setting('bannedUsers') || [])
    
    if (bannedUsers.length === 0) {
        return m.reply(`👑•─────•👑\n🚫 *ʟɪsᴛᴀ ᴅᴇ ʙᴀɴɴᴇᴀᴅᴏs*\n\n> No hay usuarios baneados\n\n\`Usa: ${m.prefix}ban <número>\`\n♰ ──────── ♱`)
    }
    
    let caption = `🚫 *ʟɪsᴛᴀ ᴅᴇ ʙᴀɴɴᴇᴀᴅᴏs*\n\n`
    caption += `☽◯☾ ♰ 「 ⛔ *ᴜsᴜᴀʀɪᴏs* 」\n`
    
    for (let i = 0; i < bannedUsers.length; i++) {
        caption += `┃ ${i + 1}. \`${bannedUsers[i]}\`\n`
    }
    
    caption += `╰━ ⊱༺༒༻⊰ ━╯\n\n`
    caption += `> ᴛᴏᴛᴀʟ: \`${bannedUsers.length}\` ᴜsᴜᴀʀɪᴏs ʙᴀɴɴᴇᴀᴅᴏs`
    
    await m.reply(caption)
}

export { pluginConfig as config, handler }