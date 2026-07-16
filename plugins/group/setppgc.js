const pluginConfig = {
    name: 'setppgc',
    alias: ['setprofilegc', 'setppgroup', 'setppgrup'],
    category: 'group',
    description: 'Mengubah foto profil grup',
    usage: '.setppgc (reply gambar)',
    example: '.setppgc',
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
    let buffer = null
    if (m.quoted?.isImage) {
        try {
            buffer = await m.quoted.download()
        } catch (e) {
            await m.reply(`❌ Error al obtener la imagen.`)
            return
        }
    } else if (m.isImage) {
        try {
            buffer = await m.download()
        } catch (e) {
            await m.reply(`❌ Error al obtener la imagen.`)
            return
        }
    }
    if (!buffer) {
        await m.reply(
            `⚠️ *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ*\n\n` +
            `> Responde a una imagen + \`${m.prefix}setppgc\`\n` +
            `> O envía una imagen + caption \`${m.prefix}setppgc\``
        )
        return
    }
    try {
        await sock.updateProfilePicture(m.chat, buffer)
        await m.reply(
            `✅ ¡Foto de perfil del grupo actualizada! 🏴‍☠️`
        )
    } catch (error) {
        await m.reply(
            `❌ Error al cambiar la foto del grupo.\n` +
            `> _${error.message}_`
        )
    }
}

export { pluginConfig as config, handler }
