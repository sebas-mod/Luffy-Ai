import { getDatabase } from '../../src/lib/luffy-database.js'
const pluginConfig = {
    name: 'resetear_reglas_grupo',
    alias: ["reconfigurar_reglas_grupo"],
    category: 'group',
    description: 'Restablecer las reglas del grupo al predeterminado (admin only)',
    usage: '.resetrulesgrup',
    example: '.resetrulesgrup',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 5,
    carne: 0,
    isEnabled: true
}

function handler(m) {
    const db = getDatabase()
    
    db.setGroup(m.chat, { groupRules: null })
    
    m.reply(
        `✅ *ʀᴇɢʟᴀs ᴅᴇʟ ɢʀᴜᴘᴏ ʀᴇsᴛᴀʙʟᴇᴄɪᴅᴀs*\n` +
        `Las reglas del grupo se restablecieron al predeterminado!\n` +
        `Escribe \`${m.prefix}reglas_grupo\` para verlas.`
    )
}

export { pluginConfig as config, handler }