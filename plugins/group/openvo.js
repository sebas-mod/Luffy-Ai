import { downloadContentFromMessage } from 'ourin'
const pluginConfig = {
    name: 'rvo',
    alias: [],
    category: 'group',
    description: 'Abrir mensaje de vista única al responder',
    usage: '.rvo (reply pesan 1x lihat)',
    example: '.rvo',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const quoted = m.quoted

    if (!quoted) {
        await m.reply(
            `❌ *ғᴀᴄᴇʟ*\n\n` +
            `> ¡Responde a un mensaje de vista única con este comando!\n` +
            `> Usa: \`${m.prefix}openvo\` (responder a mensaje de vista única)\n\n` +
            `_¡No tenemos miedo! Pero necesito que respondas el mensaje._`
        )
        return
    }

    const quotedMsg = quoted.message
    if (!quotedMsg) {
        await m.reply(
            `❌ *ᴍᴇɴsᴀᴊᴇ ɴᴏ ᴇɴᴄᴏɴᴛʀᴀᴅᴏ*\n\n` +
            `> No se puede leer el mensaje respondido.`
        )
        return
    }

    const type = Object.keys(quotedMsg)[0]
    const content = quotedMsg[type]

    if (!content) {
        await m.reply(
            `❌ *ᴄᴏɴᴛᴇɴɪᴅᴏ ɴᴏ ᴇɴᴄᴏɴᴛʀᴀᴅᴏ*\n\n` +
            `> No se puede leer el contenido del mensaje.`
        )
        return
    }

    if (!content.viewOnce) {
        await m.reply(
            `❌ *ɴᴏ ᴇs ᴜɴᴀ ᴠɪᴇᴡᴏɴᴄᴇ*\n\n` +
            `> ¡El mensaje respondido no es de vista única!\n` +
            `> Responde a un mensaje con el ícono de vista única (👁️).`
        )
        return
    }

    await m.react('🕕')

    try {
        let mediaType = null
        if (type.includes('image')) {
            mediaType = 'image'
        } else if (type.includes('video')) {
            mediaType = 'video'
        } else if (type.includes('audio')) {
            mediaType = 'audio'
        }

        if (!mediaType) {
            await m.reply(
                `El tipo no es compatible, solo se admite imagen, video, audio`
            )
            return
        }

        const stream = await downloadContentFromMessage(content, mediaType)
        
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }

        if (!buffer || buffer.length < 100) {
            await m.reply(
                `❌ *ᴇʀʀᴏʀ ᴀʟ ᴅᴇsᴄᴀʀɢᴀʀ*\n\n` +
                `> No se pudo descargar el medio.\n` +
                `> El medio puede haber expirado.`
            )
            return
        }
        const quoted = m.quoted ? m.quoted : m

        if (mediaType === 'image') {
            await sock.sendMedia(m.chat, buffer, null, quoted, {
                type: 'image'
            })
        } else if (mediaType === 'video') {
            await sock.sendMedia(m.chat, buffer, null, quoted, {
                type: 'video'
            })
        } else if (mediaType === 'audio') {
            await sock.sendMedia(m.chat, buffer, null, quoted, {
                type: 'audio',
                mimetype: 'audio/mpeg',
                ptt: true
            })
        }

    } catch (error) {
        await m.reply(
            `❌ *ᴇʀʀᴏʀ*\n\n` +
            `> Error al abrir el mensaje de vista única.\n` +
            `> _${error.message}_`
        )
    }
}

export { pluginConfig as config, handler }