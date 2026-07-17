const pluginConfig = {
    name: 'setdeskgc',
    alias: ['setdesc', 'setdescgc', 'setdeskripsi', 'setdesk'],
    category: 'group',
    description: 'Cambia la descripción del grupo',
    usage: '.setdeskgc <deskripsi baru>',
    example: '.setdeskgc Grup para diskusi',
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
    const newDesc = m.text?.trim() || ''
    if (!m.text && m.args?.length === 0) {
        await m.reply(
            `⚠️ *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ*\n\n` +
            `> \`${m.prefix}setdeskgc Descripción nueva\`\n` +
            `> \`${m.prefix}setdeskgc clear\` - Eliminar descripción`
        )
        return
    }
    const descToSet = newDesc.toLowerCase() === 'clear' ? '' : newDesc
    
    if (descToSet.length > 2048) {
        await m.reply(
            `⚠️ *ᴠᴀʟɪᴅᴀsɪ*\n\n` +
            `> La descripción es de máximo 2048 caracteres.`
        )
        return
    }
    
    try {
        await sock.groupUpdateDescription(m.chat, descToSet)
        
        if (descToSet) {
            await m.reply(
                `✅ ¡Descripción del grupo actualizada! 🏴‍☠️`
            )
        } else {
            await m.reply(
                `✅ ¡Descripción del grupo eliminada!`
            )
        }
    } catch (error) {
        await m.reply(
            `❌ *ғᴀʟʟᴏ*\n\n` +
            `> No se pudo cambiar la descripción del grupo.\n` +
            `> _${error.message}_`
        )
    }
}

export { pluginConfig as config, handler }
