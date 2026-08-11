import { getDatabase } from '../../src/lib/luffy-database.js'
const pluginConfig = {
    name: 'configurar_intro',
    alias: ["introset"],
    category: 'group',
    description: 'Configurar el mensaje de intro del grupo (admin only)',
    usage: '.setintro <mensaje>',
    example: '.setintro Bienvenido @user a @group!',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    carne: 0,
    isEnabled: true,
    isAdmin: true
}

async function handler(m) {
    const db = getDatabase()
    const introText = m.fullArgs?.trim() || m.text?.trim()
    
    if (!introText) {
        return m.reply(
            `📝 *ᴄᴏɴꜰɪɢᴜʀᴀʀ ɪɴᴛʀᴏ*\n\n` +
            `> Ingresa el mensaje de intro!\n\n` +
            `*Placeholders disponibles:*\n` +
            `> @user - Nombre del usuario\n` +
            `> @group - Nombre del grupo\n` +
            `> @count - Cantidad de miembros\n` +
            `> @date - Fecha de hoy\n` +
            `> @time - Hora actual\n` +
            `> @desc - Descripción del grupo\n` +
            `> @botname - Nombre del bot\n\n` +
            `*Ejemplo:*\n` +
            `> .setintro Bienvenido @user al grupo @group! 👋`
        )
    }
    
    const groupData = db.getGroup(m.chat) || db.setGroup(m.chat)
    groupData.intro = introText
    db.setGroup(m.chat, groupData)
    db.save()
    
    await m.reply(
        `✅ *ɪɴᴛʀᴏ ɢᴜᴀʀᴅᴀᴅᴏ!*\n` +
        `El mensaje de intro del grupo se cambió correctamente.\n` +
        `Escribe *${m.prefix}intro* para ver el resultado.`
    )
}

export { pluginConfig as config, handler }