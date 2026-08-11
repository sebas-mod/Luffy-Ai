const pluginConfig = {
    name: 'configurar_foto',
    alias: ["configurar_foto_bot"],
    category: 'tools',
    description: 'Cambia la foto de perfil del bot',
    usage: '.setpp (responde una imagen)',
    example: '.setpp',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    carne: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    let buffer = null
    if (m.quoted?.isImage) {
        try {
            buffer = await m.quoted.download()
        } catch (e) {
            await m.reply(`❌ Error al tomar la imagen.`)
            return
        }
    } else if (m.isImage) {
        try {
            buffer = await m.download()
        } catch (e) {
            await m.reply(`❌ Error al tomar la imagen.`)
            return
        }
    }
    if (!buffer) {
        await m.reply(
            `⚠️ *ᴄᴏᴍᴏ ᴜsᴀʀ*\n\n` +
            `> Responde una imagen + \`${m.prefix}configurar_foto\`\n` +
            `> Envía una imagen + caption \`${m.prefix}configurar_foto\``
        )
        return
    }
    
    try {
        const botJid = sock.user?.id
        if (!botJid) {
            await m.reply(`❌ JID del bot no encontrado.`)
            return
        }
        
        await sock.updateProfilePicture(botJid, buffer)
        
        await m.reply(
            `✅ *ᴘᴘ ᴅᴇʟ ʙᴏᴛ ᴄᴀᴍʙɪᴀᴅᴀ*\n\n` +
            `> ¡La foto de perfil del bot se actualizó exitosamente!`
        )
    } catch (error) {
        await m.reply(
            `❌ *ᴇʀʀᴏʀ*\n\n` +
            `> No se pudo cambiar la foto del bot.\n` +
            `> _${error.message}_`
        )
    }
}

export { pluginConfig as config, handler }