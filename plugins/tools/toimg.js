const pluginConfig = {
    name: 'toimg',
    alias: ['toimage', 'stickertoimage', 'stimg'],
    category: 'tools',
    description: 'Convierte stickers en imágenes',
    usage: '.toimg (responde/envía sticker)',
    example: '.toimg',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    carne: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    let mediaSource = null
    let downloadFn = null
    const selfIsSticker = m.isSticker || 
                          m.type === 'stickerMessage' || 
                          m.message?.stickerMessage
    const quotedIsSticker = m.quoted && (
        m.quoted.isSticker || 
        m.quoted.type === 'stickerMessage' || 
        m.quoted.mtype === 'stickerMessage' ||
        m.quoted.message?.stickerMessage
    )
    
    if (selfIsSticker) {
        mediaSource = 'self'
        downloadFn = m.download
    } else if (quotedIsSticker) {
        mediaSource = 'quoted'
        downloadFn = m.quoted.download
    }
    
    if (!mediaSource) {
        await m.reply(
            `☽◯☾ ╭━ ♰ ❌ ᴇʀʀᴏʀ ♰ ━╮ ☽◯☾\n\n` +
            `> No se detectó ningún sticker!\n\n` +
            `*Cómo usar:*\n` +
            `> 1. Envía un sticker + caption \`${m.prefix}toimg\`\n` +
            `> 2. Responde un sticker con \`${m.prefix}toimg\`\n\n╰━ ⊱༺༒༻⊰ ━╯`
        )
        return
    }

    const stickerMsg = mediaSource === 'self' 
        ? m.message?.stickerMessage 
        : m.quoted?.message?.stickerMessage
    const isAnimated = stickerMsg?.isAnimated

    if (isAnimated) {
        await m.reply(
            `☽◯☾ ╭━ ♰ ⚠️ sᴛɪᴄᴋᴇʀ ᴀɴɪᴍᴀᴅᴏ ♰ ━╮ ☽◯☾\n\n` +
            `> Este sticker es un sticker animado (GIF).\n` +
            `> Usa \`${m.prefix}tovideo\` para convertirlo.\n\n╰━ ⊱༺༒༻⊰ ━╯`
        )
        return
    }

    await m.react('🕕')

    try {
        const buffer = await downloadFn()

        if (!buffer || buffer.length === 0) {
            await m.reply(
                `☽◯☾ ╭━ ♰ ❌ ᴇʀʀᴏʀ ♰ ━╮ ☽◯☾\n\n` +
                `> No se pudo descargar el sticker.\n` +
                `> Es posible que el sticker ya no esté disponible.\n\n╰━ ⊱༺༒༻⊰ ━╯`
            )
            return
        }

        if (buffer.length < 100) {
            await m.reply(
                `☽◯☾ ╭━ ♰ ❌ ᴀʀᴄʜɪᴠᴏ ᴄᴏʀʀᴜᴘᴛᴏ ♰ ━╮ ☽◯☾\n\n` +
                `> El archivo del sticker no es válido o está dañado.\n` +
                `> Intenta enviar el sticker de nuevo.\n\n╰━ ⊱༺༒༻⊰ ━╯`
            )
            return
        }

        await sock.sendMedia(m.chat, buffer, null, m, {
            type: 'image'
        })

    } catch (error) {
        await m.reply(
            `☽◯☾ ╭━ ♰ ❌ ᴇʀʀᴏʀ ♰ ━╮ ☽◯☾\n\n` +
            `> Se produjo un error durante el procesamiento.\n` +
            `> _${error.message}_\n\n╰━ ⊱༺༒༻⊰ ━╯`
        )
    }
}

export { pluginConfig as config, handler }
