import { getDatabase } from '../../src/lib/ourin-database.js'
import { DEFAULT_INTRO } from './intro.js'
const pluginConfig = {
    name: 'resetintro',
    alias: ['introdel', 'delintro', 'deleteintro'],
    category: 'group',
    description: 'Restablecer intro del grupo al predeterminado (solo admin)',
    usage: '.resetintro',
    example: '.resetintro',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true,
    isAdmin: true
}

async function handler(m) {
    const db = getDatabase()
    const groupData = db.getGroup(m.chat) || db.setGroup(m.chat)
    
    if (!groupData.intro) {
        return m.reply(`❌ ¡Este grupo ya usa el intro predeterminado!`)
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