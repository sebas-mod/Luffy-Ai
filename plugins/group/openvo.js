import { downloadContentFromMessage } from 'ourin'
const pluginConfig = {
    name: 'rvo',
    alias: [],
    category: 'group',
    description: 'Abrir mensajes de ver una vez que son respondidos',
    usage: '.rvo (responde un mensaje de ver una vez)',
    example: '.rvo',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    carne: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const quoted = m.quoted

    if (!quoted) {
        await m.reply(
            `❌ *ᴇʀʀᴏʀ*\n\n` +
            `> Responde un mensaje de ver una vez con este comando!\n` +
            `> Usa: \`${m.prefix}openvo\` (responde un mensaje de ver una vez)`
        )
        return
    }

    const quotedMsg = quoted.message
    if (!quotedMsg) {
        await m.reply(
            `❌ *ᴍᴇɴsᴀᴊᴇ ɴᴏ ᴇɴᴄᴏɴᴛʀᴀᴅᴏ*\n\n` +
            `> No se pudo leer el mensaje respondido.`
        )
        return
    }

    const type = Object.keys(quotedMsg)[0]
    const content = quotedMsg[type]

    if (!content) {
        await m.reply(
            `❌ *ᴄᴏɴᴛᴇɴɪᴅᴏ ɴᴏ ᴇɴᴄᴏɴᴛʀᴀᴅᴏ*\n\n` +
            `> No se pudo leer el contenido del mensaje.`
        )
        return
    }

    if (!content.viewOnce) {
        await m.reply(
            `❌ *ɴᴏ ᴇs ᴠᴇʀ ᴜɴᴀ ᴠᴇᴢ*\n\n` +
            `> El mensaje respondido no es de ver una vez!\n` +
            `> Responde un mensaje con el ícono de ver una vez (👁️).`
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
                `El tipo no está soportado, solo se admite image, video, audio`
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
                `> No se pudo descargar el contenido multimedia.\n` +
                `> El contenido puede haber expirado.`
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
            `> No se pudo abrir el mensaje de ver una vez.\n` +
            `> _${error.message}_`
        )
    }
}

export { pluginConfig as config, handler }