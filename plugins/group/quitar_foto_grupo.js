const pluginConfig = {
    name: 'quitar_foto_grupo',
    alias: ["delprofilegc", "delppgroup"],
    category: 'group',
    description: 'Eliminar la foto de perfil del grupo',
    usage: '.delppgc',
    example: '.delppgc',
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
    try {
        await sock.removeProfilePicture(m.chat)
        
        await m.reply(
            "╭━━━〔 ⚡ GRUPO 〕━━━╮\n┃ "+`✅ La foto de perfil del grupo ahora está pelona`+"\n╰━━━━━━━━━━━━╯"
        )
    } catch (error) {
        await m.reply(
            `❌ *ᴇʀʀᴏʀ*\n\n` +
            `> No se pudo eliminar la foto del grupo.\n` +
            `> _${error.message}_`
        )
    }
}

export { pluginConfig as config, handler }