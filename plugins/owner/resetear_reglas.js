import { getDatabase } from '../../src/lib/luffy-database.js'
const pluginConfig = {
    name: 'resetear_reglas',
    alias: ["reconfigurar_reglas"],
    category: 'owner',
    description: 'Reiniciar las reglas del bot al predeterminado',
    usage: '.resetear_reglas',
    example: '.resetear_reglas',
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
        `☽◯☾ ╭━ ♰ ✦ ÉXITO ♰ ━╮ ☽◯☾\n` +
        `┃ ✅ *ʀᴇɢʟᴀs ᴅᴇʟ ʙᴏᴛ ʀᴇɪɴɪᴄɪᴀᴅᴀs*\n` +
        `╰━ ⊱༺༒༻⊰ ━╯\n\n` +
        `☽◯☾ ♰ ¡Las reglas del bot se reiniciaron al predeterminado!\n` +
        `› Escribe \`${m.prefix}rules\` para verlas.`
    )
}

export { pluginConfig as config, handler }