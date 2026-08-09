import { getDatabase } from '../../src/lib/luffy-database.js'
const pluginConfig = {
    name: 'resetgoodbye',
    alias: ['delgoodbye', 'cleargoodbye'],
    category: 'group',
    description: 'Restablecer el mensaje de despedida al predeterminado',
    usage: '.resetgoodbye',
    example: '.resetgoodbye',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 5,
    carne: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const groupData = db.getGroup(m.chat)
    
    if (!groupData?.goodbyeMsg) {
        return m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> El mensaje de despedida ya está en el predeterminado`)
    }
    
    db.setGroup(m.chat, { goodbyeMsg: null })
    
    m.react('✅')
    
    await m.reply(`✅ *ᴅᴇsᴘᴇᴅɪᴅᴀ ʀᴇsᴛᴀʙʟᴇᴄɪᴅᴀ*\nVuelve al mensaje predeterminado`)
}

export { pluginConfig as config, handler }