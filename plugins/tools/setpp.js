const pluginConfig = {
    name: 'setpp',
    alias: ['setprofilebot', 'setppbot', 'setfotobot'],
    category: 'tools',
    description: 'Cambiar foto de perfil del bot',
    usage: '.setpp (responder imagen)',
    example: '.setpp',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    let buffer = null
    if (m.quoted?.isImage) {
        try {
            buffer = await m.quoted.download()
        } catch (e) {
            await m.reply(`❌ Falló al obtener la imagen.`);
            return
        }
    } else if (m.isImage) {
        try {
            buffer = await m.download()
        } catch (e) {
            await m.reply(`❌ Falló al obtener la imagen.`)
            return
        }
    }
    if (!buffer) {
        await m.reply(
            `⚠️ *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ*\n\n` +
            `> Responde a imagen + \`${m.prefix}setpp\`\n` +
            `> Envía imagen + caption \`${m.prefix}setpp\``
        )
        return
    }
    
    try {
        const botJid = sock.user?.id
        if (!botJid) {
            await m.reply(`❌ Bot JID no encontrado.`)
            return
        }
        
        await sock.updateProfilePicture(botJid, buffer)
        
        await m.reply(
            `✅ *ᴘᴘ ʙᴏᴛ ᴅɪᴜʙᴀʜ*\n\n` +
            `> ¡Foto de perfil del bot actualizada con éxito!`
        )
    } catch (error) {
        await m.reply(
            `❌ *ꜰᴀʟʟᴏ*\n\n` +
            `> No se pudo cambiar la foto del bot.\n` +
            `> _${error.message}_`
        )
    }
}

export { pluginConfig as config, handler }