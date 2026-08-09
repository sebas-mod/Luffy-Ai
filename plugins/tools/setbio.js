const pluginConfig = {
    name: 'setbio',
    alias: ['setbiobot', 'setstatus', 'setabout'],
    category: 'tools',
    description: 'Cambia la bio/estado del bot',
    usage: '.setbio <nueva bio>',
    example: '.setbio Bot WhatsApp by Lucky Archz',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    carne: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const newBio = m.text?.trim()
    
    if (!newBio && m.args?.length === 0) {
        await m.reply(
            `⚠️ *ᴄᴏᴍᴏ ᴜsᴀʀ*\n\n` +
            `> \`${m.prefix}setbio Nueva bio del bot\`\n` +
            `> \`${m.prefix}setbio clear\` - Borra la bio`
        )
        return
    }
    
    const bioToSet = newBio?.toLowerCase() === 'clear' ? '' : (newBio || '')
    
    if (bioToSet.length > 139) {
        await m.reply(
            `⚠️ *ᴠᴀʟɪᴅᴀᴄɪᴏɴ*\n\n` +
            `> La bio admite un máximo de 139 caracteres.`
        )
        return
    }
    
    try {
        await sock.updateProfileStatus(bioToSet)
        
        if (bioToSet) {
            await m.reply(
                `✅ *ʙɪᴏ ᴅᴇʟ ʙᴏᴛ ᴄᴀᴍʙɪᴀᴅᴀ*\n\n` +
                `> La bio del bot ahora es:\n` +
                `> _${bioToSet}_`
            )
        } else {
            await m.reply(
                `✅ *ʙɪᴏ ᴅᴇʟ ʙᴏᴛ ᴇʟɪᴍɪɴᴀᴅᴀ*\n\n` +
                `> ¡La bio del bot se eliminó exitosamente!`
            )
        }
    } catch (error) {
        await m.reply(
            `❌ *ᴇʀʀᴏʀ*\n\n` +
            `> No se pudo cambiar la bio del bot.\n` +
            `> _${error.message}_`
        )
    }
}

export { pluginConfig as config, handler }