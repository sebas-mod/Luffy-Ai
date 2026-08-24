const pluginConfig = {
    name: 'configurar_nombre',
    alias: ["configurar_nombre_bot"],
    category: 'tools',
    description: 'Cambia el nombre de perfil del bot',
    usage: '.setname <nuevo nombre>',
    example: '.setname Luffy-Ai',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    carne: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const newName = m.text?.trim()
    
    if (!newName) {
        await m.reply(
            `╭━━━〔 ⚠️ ᴄᴏᴍᴏ ᴜsᴀʀ 〕━━━╮\n\n` +
            `> \`${m.prefix}configurar_nombre Nuevo Nombre del Bot\`\n\n╰━━━━━━━━━━━━╯`
        )
        return
    }
    
    if (newName.length < 1 || newName.length > 25) {
        await m.reply(
            `╭━━━〔 ⚠️ ᴠᴀʟɪᴅᴀᴄɪᴏɴ 〕━━━╮\n\n` +
            `> El nombre del bot debe tener de 1 a 25 caracteres.\n\n╰━━━━━━━━━━━━╯`
        )
        return
    }
    
    try {
        await sock.updateProfileName(newName)
        
        await m.reply(
            `╭━━━〔 ✅ ɴᴏᴍʙʀᴇ ᴅᴇʟ ʙᴏᴛ ᴄᴀᴍʙɪᴀᴅᴏ 〕━━━╮\n\n` +
            `> El nombre del bot ahora es: *${newName}*\n\n╰━━━━━━━━━━━━╯`
        )
    } catch (error) {
        await m.reply(
            `╭━〔 ❌ ᴇʀʀᴏʀ 〕━╮\n\n` +
            `╰┈➤ No se pudo cambiar el nombre del bot.\n` +
            `╰┈➤ _${error.message}_\n\n` +
            `╰━━━━━╯`
        )
    }
}

export { pluginConfig as config, handler }
