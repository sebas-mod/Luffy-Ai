const pluginConfig = {
    name: 'delppgc',
    alias: ['delprofilegc', 'delppgroup', 'hapusppgc'],
    category: 'group',
    description: 'Eliminar foto de perfil del grupo',
    usage: '.delppgc',
    example: '.delppgc',
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
    try {
        await sock.removeProfilePicture(m.chat)
        
        await m.reply(
            `✅ La foto de perfil del grupo ahora está vacía ¡Shishishi!`
        )
    } catch (error) {
        await m.reply(
            `❌ *ɢᴀɢᴀʟ*\n\n` +
            `> No se pudo eliminar la foto del grupo.\n` +
            `> _${error.message}_`
        )
    }
}

export { pluginConfig as config, handler }