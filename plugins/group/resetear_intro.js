import { getDatabase } from '../../src/lib/luffy-database.js'
import { DEFAULT_INTRO } from './intro.js'
const pluginConfig = {
    name: 'resetear_intro',
    alias: ['introdel', 'delintro', 'deleteintro'],
    category: 'group',
    description: 'Restablecer el intro del grupo al predeterminado (admin only)',
    usage: '.resetintro',
    example: '.resetintro',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    carne: 0,
    isEnabled: true,
    isAdmin: true
}

async function handler(m) {
    const db = getDatabase()
    const groupData = db.getGroup(m.chat) || db.setGroup(m.chat)
    
    if (!groupData.intro) {
        return m.reply("☽◯☾ ♰ "+`❌ Este grupo ya usa el intro predeterminado!`)
    }
    
    delete groupData.intro
    db.setGroup(m.chat, groupData)
    db.save()
    
    await m.reply(
        `✅ *ɪɴᴛʀᴏ ʀᴇsᴛᴀʙʟᴇᴄɪᴅᴏ!*\n` +
        `El intro del grupo volvió al predeterminado.\n\n` +
        `Escribe *${m.prefix}intro* para ver el resultado.`
    )
}

export { pluginConfig as config, handler }