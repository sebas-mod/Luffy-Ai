import { getParticipantJid } from '../../src/lib/luffy-lid.js'
import te from '../../src/lib/luffy-error.js'
const pluginConfig = {
    name: 'demote',
    alias: ['unadmin', 'turunkan'],
    category: 'group',
    description: 'Quitar el rango de admin a un miembro',
    usage: '.demote @user',
    example: '.demote @user',
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
    let target = null

    if (m.quoted) {
        target = m.quoted.sender
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
        target = m.mentionedJid[0]
    }

    if (!target) {
        await m.reply(
            `❌ *ᴛᴀʀɢᴇᴛ ɴᴏ ᴇɴᴄᴏɴᴛʀᴀᴅᴏ*\n\n` +
            `> Responde un mensaje o menciona!
` +
            `> Ejemplo: \`${m.prefix}demote @user\``
        )
        return
    }

    try {
        const groupMeta = m.groupMetadata
        const participant = groupMeta.participants.find(p => getParticipantJid(p) === target)

        if (!participant) {
            await m.reply("☽◯☾ ╭━ ♰ 👑 ADMIN ♰ ━╮ ☽◯☾\n┃ "+`❌ *ᴇʀʀᴏʀ*\n\n> El usuario no está en el grupo.`+"\n╰━ ⊱༺༒༻⊰ ━╯")
            return
        }

        if (!participant.admin) {
            await m.reply("☽◯☾ ╭━ ♰ 👑 ADMIN ♰ ━╮ ☽◯☾\n┃ "+`❌ *ᴇʀʀᴏʀ*\n\n> El usuario no es admin.`+"\n╰━ ⊱༺༒༻⊰ ━╯")
            return
        }

        if (participant.admin === 'superadmin') {
            await m.reply("☽◯☾ ╭━ ♰ 👑 ADMIN ♰ ━╮ ☽◯☾\n┃ "+`❌ *ᴇʀʀᴏʀ*\n\n> No se puede degradar al creador del grupo.`+"\n╰━ ⊱༺༒༻⊰ ━╯")
            return
        }

        await sock.groupParticipantsUpdate(m.chat, [target], 'demote')

        await m.reply(
            "☽◯☾ ╭━ ♰ 👑 ADMIN ♰ ━╮ ☽◯☾\n┃ "+`@${target.split('@')[0]} ya no es admin.`+"\n╰━ ⊱༺༒༻⊰ ━╯",
            { mentions: [target] }
        )

    } catch (error) {
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }