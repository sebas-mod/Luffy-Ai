import { getParticipantJid } from '../../src/lib/ourin-lid.js'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'promote',
    alias: ['jadiadmin', 'admin'],
    category: 'group',
    description: 'Hacer a un miembro admin',
    usage: '.promote @user',
    example: '.promote @user',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true,
    isAdmin: true,
    isBotAdmin: true
}

async function handler(m, { sock }) {
    let target = null

    if (m.quoted) {
        target = m.quoted.sender
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
        target = m.mentionedJid[0]
    }

    if (!target) {
        await m.reply(
            `❌ *ᴏʙᴊᴇᴛɪᴠᴏ ɴᴏ ᴇɴᴄᴏɴᴛʀᴀᴅᴏ*\n\n` +
            `> ¡Responde al mensaje o menciona al usuario!\n` +
            `> Ejemplo: \`${m.prefix}promote @user\``
        )
        return
    }

    try {
        const groupMeta = m.groupMetadata
        const participant = groupMeta.participants.find(p => getParticipantJid(p) === target)

        if (!participant) {
            await m.reply(`❌ *ғᴀᴄᴇʟ*\n\n> ¡Usuario no encontrado en el grupo!`)
            return
        }

        if (participant.admin) {
            await m.reply(`❌ *ғᴀᴄᴇʟ*\n\n> ¡El usuario ya es admin!`)
            return
        }

        await sock.groupParticipantsUpdate(m.chat, [target], 'promote')

        await m.reply(
            `✅ @${target.split('@')[0]} ¡ahora es admin!`,
            { mentions: [target] }
        )

    } catch (error) {
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }