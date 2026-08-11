const pluginConfig = {
    name: 'configurar_foto_grupo',
    alias: [],
    category: 'group',
    description: 'Cambiar la foto de perfil del grupo',
    usage: '.setppgc (responde una imagen)',
    example: '.setppgc',
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
            `⚠️ *ᴄóᴍᴏ ᴜsᴀʀʟᴏ*\n\n` +
            `> Responde una imagen + \`${m.prefix}configurar_foto_grupo\`\n` +
            `> Envía una imagen con el caption \`${m.prefix}configurar_foto_grupo\``
        )
        return
    }
    try {
        await sock.updateProfilePicture(m.chat, buffer)
        await m.reply(
            `✅ La foto de perfil del grupo se actualizó correctamente!`
        )
    } catch (error) {
        await m.reply(
            `❌ No se pudo cambiar la foto del grupo.\n` +
            `> _${error.message}_`
        )
    }
}

export { pluginConfig as config, handler }