import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'resetrulesgrup',
    alias: ['resetgrouprules'],
    category: 'group',
    description: 'Restablecer reglas del grupo al predeterminado (solo admin)',
    usage: '.resetrulesgrup',
    example: '.resetrulesgrup',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function handler(m) {
    const db = getDatabase()
    
    db.setGroup(m.chat, { groupRules: null })
    
    m.reply(
        `✅ *ʀᴇɢʟᴀs ʀᴇsᴛᴀʙʟᴇᴄɪᴅᴀs*\n` +
        `¡Las reglas del grupo se restablecieron al predeterminado!\n` +
        `Escribe \`${m.prefix}rulesgrup\` para verlas.\n\n` +
        `_¡Shishishi! ¡El orden es importante para una gran tripulación!_`
    )
}

export { pluginConfig as config, handler }