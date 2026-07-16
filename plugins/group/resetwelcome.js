import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'resetwelcome',
    alias: ['delwelcome', 'clearwelcome'],
    category: 'group',
    description: 'Restablecer mensaje de bienvenida al predeterminado',
    usage: '.resetwelcome',
    example: '.resetwelcome',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const groupData = db.getGroup(m.chat)
    
    if (!groupData?.welcomeMsg) {
        return m.reply(`❌ *ғᴀᴄᴇʟ*\n\n> El mensaje de bienvenida ya está en el predeterminado`)
    }
    
    db.setGroup(m.chat, { welcomeMsg: null })
    
    m.react('✅')
    
    await m.reply(`✅ *ʙɪᴇɴᴠᴇɴɪᴅᴀ ʀᴇsᴛᴀʙʟᴇᴄɪᴅᴀ*\n\n> Volvieron al mensaje predeterminado\n\n_¡Shishishi! ¡Siempre es genial recibir bienvenidas!_`)
}

export { pluginConfig as config, handler }