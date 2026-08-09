import { getDatabase } from '../../src/lib/luffy-database.js'
const pluginConfig = {
    name: 'resetrules',
    alias: ['resetbotrules'],
    category: 'owner',
    description: 'Reiniciar las reglas del bot al predeterminado',
    usage: '.resetrules',
    example: '.resetrules',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    carne: 0,
    isEnabled: true
}

function handler(m) {
    const db = getDatabase()
    
    db.setting('botRules', null)
    
    m.reply(
        `✅ *ʀᴇɢʟᴀs ᴅᴇʟ ʙᴏᴛ ʀᴇɪɴɪᴄɪᴀᴅᴀs*\n\n` +
        `> ¡Las reglas del bot se reiniciaron al predeterminado!\n` +
        `> Escribe \`${m.prefix}rules\` para verlas.`
    )
}

export { pluginConfig as config, handler }