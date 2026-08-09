import { getDatabase } from '../../src/lib/luffy-database.js'
const pluginConfig = {
    name: 'resetwelcome',
    alias: ['delwelcome', 'clearwelcome'],
    category: 'group',
    description: 'Restablecer el mensaje de bienvenida al predeterminado',
    usage: '.resetwelcome',
    example: '.resetwelcome',
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
    
    if (!groupData?.welcomeMsg) {
        return m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> El mensaje de bienvenida ya está en el predeterminado`)
    }
    
    db.setGroup(m.chat, { welcomeMsg: null })
    
    m.react('✅')
    
    await m.reply(`✅ *ʙɪᴇɴᴠᴇɴɪᴅᴀ ʀᴇsᴛᴀʙʟᴇᴄɪᴅᴀ*\n\n> Vuelve al mensaje predeterminado`)
}

export { pluginConfig as config, handler }