const pluginConfig = {
    name: 'setnamegc',
    alias: ['setnamegrup', 'setgcname', 'setnamegroup', 'setnamagrup'],
    category: 'group',
    description: 'Cambiar el nombre del grupo',
    usage: '.setnamegc <nuevo nombre>',
    example: '.setnamegc Grupo Genial',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    isBotAdmin: true,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const newName = m.text?.trim()
    
    if (!newName) {
        await m.reply(
            `⚠️ *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ*\n\n` +
            `> \`${m.prefix}setnamegc Nuevo Nombre del Grupo\``
        )
        return
    }
    
    if (newName.length < 1 || newName.length > 100) {
        await m.reply(
            `⚠️ *ᴠᴀʟɪᴅᴀsɪ*\n\n` +
            `> El nombre del grupo debe tener 1-100 caracteres.`
        )
        return
    }
    
    try {
        await sock.groupUpdateSubject(m.chat, newName)
        
        await m.reply(
            `✅ ¡Nombre del grupo cambiado a *${newName}*! 🏴‍☠️`
        )
    } catch (error) {
        await m.reply(
            `❌ *ғᴀʟʟᴏ*\n\n` +
            `> No se pudo cambiar el nombre del grupo.\n` +
            `> _${error.message}_`
        )
    }
}

export { pluginConfig as config, handler }
