const pluginConfig = {
    name: 'setbio',
    alias: ['setbiobot', 'setstatus', 'setabout'],
    category: 'tools',
    description: 'Cambiar bio/estado del bot',
    usage: '.setbio <nuevo bio>',
    example: '.setbio Bot WhatsApp de Lucky Archz',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const newBio = m.text?.trim()
    
    if (!newBio && m.args?.length === 0) {
        await m.reply(
            `⚠️ *CÓMO USAR*\n\n` +
            `> \`${m.prefix}setbio Nuevo bio del bot\`\n` +
            `> \`${m.prefix}setbio clear\` - Borrar bio`
        )
        return
    }
    
    const bioToSet = newBio?.toLowerCase() === 'clear' ? '' : (newBio || '')
    
    if (bioToSet.length > 139) {
        await m.reply(
            `⚠️ *ᴠᴀʟɪᴅᴀsɪ*\n\n` +
            `> Bio máximo 139 caracteres.`
        )
        return
    }
    
    try {
        await sock.updateProfileStatus(bioToSet)
        
        if (bioToSet) {
            await m.reply(
                `✅ *ʙɪᴏ ᴅᴇʟ ʙᴏᴛ ᴄᴀᴍʙɪᴀᴅᴏ*\n\n` +
                `> Bio actual del bot:\n` +
                `> _${bioToSet}_`
            )
        } else {
            await m.reply(
                `✅ *ʙɪᴏ ᴅᴇʟ ʙᴏᴛ ʙᴏʀʀᴀᴅᴏ*\n\n` +
                `> ¡Bio del bot eliminada correctamente!`
            )
        }
    } catch (error) {
        await m.reply(
            `❌ *ꜰᴀʟʟᴏ*\n\n` +
            `> No se puede cambiar el bio del bot.\n` +
            `> _${error.message}_`
        )
    }
}

export { pluginConfig as config, handler }