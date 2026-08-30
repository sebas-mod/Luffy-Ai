import { getParticipantJid } from '../../src/lib/luffy-lid.js'
import te from '../../src/lib/luffy-error.js'

const pluginConfig = {
    name: 'dameadm',
    alias: ['dame_adm', 'hazmeadmin', 'admya'],
    category: 'group',
    description: 'El bot te hace admin al instante (solo el owner puede pedirlo)',
    usage: '.dameadm',
    example: '.dameadm',
    isOwner: true,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: false,
    isBotAdmin: true,
    cooldown: 5,
    carne: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    try {
        const groupMeta = m.groupMetadata
        const participant = groupMeta.participants.find(p => getParticipantJid(p) === m.sender)

        if (participant && participant.admin) {
            return m.reply("☽◯☾ ╭━ ♰ 👑 ADMIN ♰ ━╮ ☽◯☾\n┃ "+`*Ya eres adm mi owner* 😎`+"\n╰━ ⊱༺༒༻⊰ ━╯")
        }

        await sock.groupParticipantsUpdate(m.chat, [m.sender], 'promote')

        await m.reply("☽◯☾ ╭━ ♰ 👑 ADMIN ♰ ━╮ ☽◯☾\n┃ "+`*Ya te di adm mi owner* 😎`+"\n╰━ ⊱༺༒༻⊰ ━╯")
    } catch (error) {
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
