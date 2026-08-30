import { getDatabase } from '../../src/lib/luffy-database.js'
const pluginConfig = {
    name: 'configurar_reglas_grupo',
    alias: [],
    category: 'group',
    description: 'Configurar reglas personalizadas del grupo (admin only)',
    usage: '.configurar_reglas_grupo <texto>',
    example: '.configurar_reglas_grupo 1. No spam\n2. Respeta a los demás',
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
    const text = m.text?.trim() || (m.quoted?.body || m.quoted?.text || '')

    if (!text) {
        return m.reply(
            `📝 *ᴄᴏɴꜰɪɢᴜʀᴀʀ ʀᴇɢʟᴀs ᴅᴇʟ ɢʀᴜᴘᴏ*\n\n` +
            `> Ingresa el nuevo texto de las reglas\n\n` +
            `\`Ejemplo:\`\n` +
            `\`${m.prefix}configurar_reglas_grupo 1. No spam
2. Respeta a los demás\``
        )
    }

    db.setGroup(m.chat, { groupRules: text })

    m.reply(
        `✅ *ʀᴇɢʟᴀs ᴅᴇʟ ɢʀᴜᴘᴏ ᴀᴄᴛᴜᴀʟɪᴢᴀᴅᴀs*\n\n` +
        `Las reglas del grupo se cambiaron correctamente!\n` +
        `Escribe \`${m.prefix}reglas_grupo\` para verlas.`
    )
}

export { pluginConfig as config, handler }