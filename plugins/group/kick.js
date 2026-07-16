import { findParticipantByNumber } from '../../src/lib/ourin-lid.js'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'kick',
    alias: ['remove', 'tendang'],
    category: 'group',
    description: 'Expulsar miembro del grupo',
    usage: '.kick @user',
    example: '.kick @user',
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
    let targetJid = null

    if (m.quoted) {
        targetJid = m.quoted.sender
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
        targetJid = m.mentionedJid[0]
    }

    if (!targetJid) {
        await m.reply(
            `❌ *ᴏʙᴊᴇᴛɪᴠᴏ ɴᴏ ᴇɴᴄᴏɴᴛʀᴀᴅᴏ*\n\n` +
            `> ¡Responde al mensaje o menciona al usuario!\n` +
            `> Ejemplo: \`${m.prefix}kick @user\`\n\n` +
            `_¡No tenemos miedo! Pero el objetivo debe ser claro._`
        )
        return
    }

    const botNumber = sock.user?.id?.split(':')[0] + '@s.whatsapp.net'
    const targetNumber = targetJid.replace(/@.*$/, '')

    if (targetJid === botNumber || targetNumber === botNumber.replace(/@.*$/, '')) {
        await m.reply(`❌ *ғᴀᴄᴇʟ*\n\n> ¡No puedo expulsar al mismo bot! ¡Shishishi!`)
        return
    }

    if (targetJid === m.sender) {
        await m.reply(`❌ *ғᴀᴄᴇʟ*\n\n> ¡No puedes expulsarte a ti mismo!`)
        return
    }

    try {
        const groupMeta = m.groupMetadata
        const targetParticipant = findParticipantByNumber(groupMeta.participants, targetJid)
        
        if (!targetParticipant) {
            await m.reply(`❌ *ғᴀᴄᴇʟ*\n\n> ¡Usuario no encontrado en el grupo!`)
            return
        }
        
        if (targetParticipant.admin) {
            await m.reply(`❌ *ғᴀᴄᴇʟ*\n\n> ¡No se puede expulsar a un admin del grupo!`)
            return
        }
        
        await sock.groupParticipantsUpdate(m.chat, [targetParticipant.id], 'remove')

        await m.reply(`✅ @${targetNumber} ha sido expulsado de este grupo.`, { mentions: [targetJid] })

    } catch (error) {
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }