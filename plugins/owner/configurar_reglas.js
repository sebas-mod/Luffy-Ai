import { getDatabase } from '../../src/lib/luffy-database.js'
const pluginConfig = {
    name: 'configurar_reglas',
    alias: ["configurar_reglas_bot"],
    category: 'owner',
    description: 'Establecer reglas/atribuciones personalizadas del bot',
    usage: '.configurar_reglas <texto>',
    example: '.configurar_reglas 1. No spamear\n2. Respetar a los demás',
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
    const text = m.text?.trim() || (m.quoted?.body || m.quoted?.text || '')
    
    if (!text) {
        return m.reply(
            `☽◯☾ ╭━ ♰ 👑 OWNER ♰ ━╮ ☽◯☾\n` +
            `┃ 📝 *ᴇsᴛᴀʙʟᴇᴄᴇʀ ʀᴇɢʟᴀs ᴅᴇʟ ʙᴏᴛ*\n` +
            `╰━ ⊱༺༒༻⊰ ━╯\n\n` +
            `☽◯☾ ♰ Escribe el nuevo texto de las reglas\n\n` +
            `\`Ejemplo:\`\n` +
            `\`${m.prefix}configurar_reglas 1. No spamear\\n2. Respetar a los demás\``
        )
    }
    
    db.setting('botRules', text)
    
    m.reply(
        `☽◯☾ ╭━ ♰ ✦ ÉXITO ♰ ━╮ ☽◯☾\n` +
        `┃ ✅ *ʀᴇɢʟᴀs ᴅᴇʟ ʙᴏᴛ ᴀᴄᴛᴜᴀʟɪᴢᴀᴅᴀs*\n` +
        `╰━ ⊱༺༒༻⊰ ━╯\n\n` +
        `☽◯☾ ♰ ¡Las reglas del bot se cambiaron con éxito!\n` +
        `› Escribe \`${m.prefix}rules\` para verlas.`
    )
}

export { pluginConfig as config, handler }