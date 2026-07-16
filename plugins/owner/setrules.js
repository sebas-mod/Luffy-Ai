import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'setrules',
    alias: ['setbotrules', 'setaturanbot'],
    category: 'owner',
    description: 'Configura reglas personalizhays para el bot',
    usage: '.setrules <text>',
    example: '.setrules 1. Jangan spam\n2. Hormati sesama',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function handler(m) {
    const db = getDatabase()
    const text = m.text?.trim() || (m.quoted?.body || m.quoted?.text || '')
    
    if (!text) {
        return m.reply(
            `📝 *sᴇᴛ ʙᴏᴛ ʀᴜʟᴇs*\n\n` +
            `> Ingresa el texto de las reglas nuevas\n\n` +
            `\`Ejemplo:\`\n` +
            `\`${m.prefix}setrules 1. Jangan spam\\n2. Hormati sesama\``
        )
    }
    
    db.setting('botRules', text)
    
    m.reply(
        `✅ *ʙᴏᴛ ʀᴜʟᴇs ᴅɪᴜᴘᴅᴀᴛᴇ*\n\n` +
        `> ¡Las reglas del bot han sido cambiadas con éxito!\n` +
        `> Escribe \`${m.prefix}rules\` para verlas.`
    )
}

export { pluginConfig as config, handler }
