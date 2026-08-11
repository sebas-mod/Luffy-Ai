const pluginConfig = {
    name: 'configurar_nombre_grupo',
    alias: [],
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
    carne: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const newName = m.text?.trim()
    
    if (!newName) {
        await m.reply(
            `⚠️ *ᴄᴏ́ᴍᴏ ᴜsᴀʀ*\n\n` +
            `> \`${m.prefix}configurar_nombre_grupo Nombre Nuevo del Grupo\``
        )
        return
    }
    
    if (newName.length < 1 || newName.length > 100) {
        await m.reply(
            `⚠️ *ᴠᴀʟɪᴅᴀᴄɪóɴ*\n\n` +
            `> El nombre del grupo debe tener 1-100 caracteres.`
        )
        return
    }
    
    try {
        await sock.groupUpdateSubject(m.chat, newName)
        
        await m.reply(
            `✅ Se cambió el nombre del grupo a *${newName}*`
        )
    } catch (error) {
        await m.reply(
            `❌ *ɢᴀɢᴀʟ*\n\n` +
            `> No se pudo cambiar el nombre del grupo.\n` +
            `> _${error.message}_`
        )
    }
}

export { pluginConfig as config, handler }