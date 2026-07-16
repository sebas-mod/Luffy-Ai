import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'setintro',
    alias: ['setperkenalan', 'introset'],
    category: 'group',
    description: 'Establecer mensaje de intro del grupo (solo admin)',
    usage: '.setintro <mensaje>',
    example: '.setintro ¡Bienvenido @user al grupo @group!',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true,
    isAdmin: true
}

async function handler(m) {
    const db = getDatabase()
    const introText = m.fullArgs?.trim() || m.text?.trim()
    
    if (!introText) {
        return m.reply(
            `📝 *sᴇᴛ ɪɴᴛʀᴏ*\n\n` +
            `> ¡Escribe el mensaje de intro!\n\n` +
            `*Placeholders disponibles:*\n` +
            `> @user - Nombre del usuario\n` +
            `> @group - Nombre del grupo\n` +
            `> @count - Cantidad de miembros\n` +
            `> @date - Fecha de hoy\n` +
            `> @time - Hora actual\n` +
            `> @desc - Descripción del grupo\n` +
            `> @botname - Nombre del bot\n\n` +
            `*Ejemplo:*\n` +
            `> .setintro ¡Bienvenido @user al grupo @group! 👋`
        )
    }
    
    const groupData = db.getGroup(m.chat) || db.setGroup(m.chat)
    groupData.intro = introText
    db.setGroup(m.chat, groupData)
    db.save()
    
    await m.reply(
        `✅ *¡ɪɴᴛʀᴏ ɢᴜᴀʀᴅᴀᴅᴀ!*\n` +
        `Mensaje de intro del grupo cambiado.\n` +
        `Escribe *${m.prefix}intro* para ver el resultado.`
    )
}

export { pluginConfig as config, handler }
