const pluginConfig = {
    name: 'delpp',
    alias: ['delprofilebot', 'delppbot', 'hapusppbot'],
    category: 'tools',
    description: 'Eliminar foto de perfil del bot',
    usage: '.delpp',
    example: '.delpp',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    try {
        const botJid = sock.user?.id
        if (!botJid) {
            await m.reply(`❌ Bot JID no encontrado.`)
            return
        }
        
        await sock.removeProfilePicture(botJid)
        
        await m.reply(
            `✅ *ᴘᴘ ᴅᴇʟ ʙᴏᴛ ᴇʟɪᴍɪɴᴀᴅᴀ*\n\n` +
            `> ¡Foto de perfil del bot eliminada correctamente!`
        )
    } catch (error) {
        await m.reply(
            `❌ *ꜰᴀʟʟᴏ*\n\n` +
            `> No se puede eliminar la foto del bot.\n` +
            `> _${error.message}_`
        )
    }
}

export { pluginConfig as config, handler }