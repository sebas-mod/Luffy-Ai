import { findParticipantByNumber, getParticipantJid } from '../../src/lib/luffy-lid.js'
import te from '../../src/lib/luffy-error.js'
const pluginConfig = {
    name: 'kick',
    alias: ['remove', 'tendang'],
    category: 'group',
    description: 'Expulsar a un miembro del grupo',
    usage: '.kick @user',
    example: '.kick @user',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 5,
    carne: 0,
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
            `❌ *ᴛᴀʀɢᴇᴛᴏ ɴᴏ ᴇɴᴄᴏɴᴛʀᴀᴅᴏ*\n\n` +
            `> ¡Responde el mensaje de un usuario o haz mention!\n` +
            `> Ejemplo: \`${m.prefix}kick @user\``
        )
        return
    }

    const botNumber = sock.user?.id?.split(':')[0] + '@s.whatsapp.net'
    const targetNumber = targetJid.replace(/@.*$/, '')

    if (targetJid === botNumber || targetNumber === botNumber.replace(/@.*$/, '')) {
        await m.reply("☽◯☾ ╭━ ♰ 👑 ADMIN ♰ ━╮ ☽◯☾\n┃ "+`❌ *ᴇʀʀᴏʀ*\n\n> ¡No se puede expulsar al bot mismo!`+"\n╰━ ⊱༺༒༻⊰ ━╯")
        return
    }

    if (targetJid === m.sender) {
        await m.reply("☽◯☾ ╭━ ♰ 👑 ADMIN ♰ ━╮ ☽◯☾\n┃ "+`❌ *ᴇʀʀᴏʀ*\n\n> ¡No puedes expulsarte a ti mismo!`+"\n╰━ ⊱༺༒༻⊰ ━╯")
        return
    }

    try {
        const groupMeta = m.groupMetadata
        const targetParticipant = findParticipantByNumber(groupMeta.participants, targetJid)
        
        if (!targetParticipant) {
            await m.reply("☽◯☾ ╭━ ♰ 👑 ADMIN ♰ ━╮ ☽◯☾\n┃ "+`❌ *ᴇʀʀᴏʀ*\n\n> ¡El usuario no está en el grupo!`+"\n╰━ ⊱༺༒༻⊰ ━╯")
            return
        }
        
        if (targetParticipant.admin) {
            await m.reply("☽◯☾ ╭━ ♰ 👑 ADMIN ♰ ━╮ ☽◯☾\n┃ "+`❌ *ᴇʀʀᴏʀ*\n\n> ¡No se puede expulsar a un admin del grupo!`+"\n╰━ ⊱༺༒༻⊰ ━╯")
            return
        }
        
        const realTargetJid = getParticipantJid(targetParticipant) || targetParticipant.id
        await sock.groupParticipantsUpdate(m.chat, [realTargetJid], 'remove')

        await m.reply("☽◯☾ ╭━ ♰ 👑 ADMIN ♰ ━╮ ☽◯☾\n┃ "+`✅ @${targetNumber} fue expulsado de este grupo.`+"\n╰━ ⊱༺༒༻⊰ ━╯", { mentions: [targetJid] })

    } catch (error) {
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }