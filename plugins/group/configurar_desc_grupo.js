const pluginConfig = {
    name: 'configurar_desc_grupo',
    alias: ["configurar_descripcion", "setdesk"],
    category: 'group',
    description: 'Cambiar la descripción del grupo',
    usage: '.setdeskgc <nueva descripción>',
    example: '.setdeskgc Grupo para discutir',
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
    const newDesc = m.text?.trim() || ''
    if (!m.text && m.args?.length === 0) {
        await m.reply(
            `⚠️ *ᴄóᴍᴏ ᴜsᴀʀʟᴏ*\n\n` +
            `> \`${m.prefix}configurar_desc_grupo Nueva descripción\`\n` +
            `> \`${m.prefix}configurar_desc_grupo clear\` - Eliminar la descripción`
        )
        return
    }
    const descToSet = newDesc.toLowerCase() === 'clear' ? '' : newDesc
    
    if (descToSet.length > 2048) {
        await m.reply(
            `⚠️ *ᴠᴀʟɪᴅᴀᴄɪóɴ*\n\n` +
            `> La descripción tiene un máximo de 2048 caracteres.`
        )
        return
    }
    
    try {
        await sock.groupUpdateDescription(m.chat, descToSet)
        
        if (descToSet) {
            await m.reply(
                "☽◯☾ ♰ "+`✅ La descripción del grupo se actualizó correctamente!`
            )
        } else {
            await m.reply(
                "☽◯☾ ♰ "+`✅ La descripción del grupo se eliminó correctamente!`
            )
        }
    } catch (error) {
        await m.reply(
            `❌ *ᴇʀʀᴏʀ*\n\n` +
            `> No se pudo cambiar la descripción del grupo.\n` +
            `> _${error.message}_`
        )
    }
}

export { pluginConfig as config, handler }