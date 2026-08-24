const pluginConfig = {
    name: 'quitar_foto',
    alias: ["delprofilebot", "delppbot"],
    category: 'tools',
    description: 'Elimina la foto de perfil del bot',
    usage: '.delpp',
    example: '.delpp',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    carne: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    try {
        const botJid = sock.user?.id
        if (!botJid) {
            await m.reply(`╰┈➤ ❌ JID del bot no encontrado.`)
            return
        }
        
        await sock.removeProfilePicture(botJid)
        
        await m.reply(
            `╭━━━〔 ✅ ᴘᴘ ᴅᴇʟ ʙᴏᴛ ᴇʟɪᴍɪɴᴀᴅᴀ 〕━━━╮\n\n` +
            `> ¡La foto de perfil del bot se eliminó exitosamente!\n\n╰━━━━━━━━━━━━╯`
        )
    } catch (error) {
        await m.reply(
            `╭━━━〔 ❌ ᴇʀʀᴏʀ 〕━━━╮\n\n` +
            `> No se pudo eliminar la foto del bot.\n` +
            `> _${error.message}_\n\n╰━━━━━━━━━━━━╯`
        )
    }
}

export { pluginConfig as config, handler }
