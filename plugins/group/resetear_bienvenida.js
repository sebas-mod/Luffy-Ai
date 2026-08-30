import { getDatabase } from '../../src/lib/luffy-database.js'
const pluginConfig = {
    name: 'resetear_bienvenida',
    alias: ['delwelcome', 'clearwelcome'],
    category: 'group',
    description: 'Restablecer el mensaje de bienvenida al predeterminado',
    usage: '.resetear_bienvenida',
    example: '.resetear_bienvenida',
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
        return m.reply("୨୧〔 ✿ BIENVENIDA 〕୨୧\n┃ "+`❌ *ᴇʀʀᴏʀ*\n\n> El mensaje de bienvenida ya está en el predeterminado`+"\n♡ ────── ♡")
    }
    
    db.setGroup(m.chat, { welcomeMsg: null })
    
    m.react('✅')
    
    await m.reply("୨୧〔 ✿ BIENVENIDA 〕୨୧\n┃ "+`✅ *ʙɪᴇɴᴠᴇɴɪᴅᴀ ʀᴇsᴛᴀʙʟᴇᴄɪᴅᴀ*\n\n> Vuelve al mensaje predeterminado`+"\n♡ ────── ♡")
}

export { pluginConfig as config, handler }