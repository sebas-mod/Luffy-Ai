import { getDatabase } from '../../src/lib/luffy-database.js'
import te from '../../src/lib/luffy-error.js'
import { findParticipantByNumber } from '../../src/lib/luffy-lid.js'

const pluginConfig = {
    name: 'solo_este_grupo',
    alias: ['onlythisgroup', 'lockgrup', 'lockgroup'],
    category: 'owner',
    description: 'El bot solo está activo en este grupo',
    usage: '.onlythisgrup',
    example: '.onlythisgrup',
    isOwner: true,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 5,
    carne: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    try {
        const db = getDatabase()
        const current = db.setting('onlyThisGroup') || null

        if (current && (current === m.chat || current.jid === m.chat)) {
            db.setting('onlyThisGroup', null)
            db.save()
            return m.reply(`╭━━━〔 ✦ ÉXITO 〕━━━╮\n┃ 🔓 *DESBLOQUEADO*\n╰━━━━━━━━━━━━╯\n\nEl bot vuelve a estar activo en todos los grupos de forma pública. ✅`)
        }

        const botNum = sock.user?.id?.split(':')[0] || ''
        const botLid = sock.user?.lid ? String(sock.user.lid).replace(/@.+/g, '') : null
        const botJid = botNum ? botNum + '@s.whatsapp.net' : ''
        const groupMetadata = await sock.groupMetadata(m.chat).catch(() => null)
        
        if (!groupMetadata) {
            return m.reply(`╰┈➤ ❌ Error al obtener los datos del grupo.`)
        }

        const participants = groupMetadata.participants || []
        let botParticipant = botJid ? findParticipantByNumber(participants, botJid) : null
        if (!botParticipant && botLid) {
            botParticipant = participants.find(
                (p) => String(p.lid || p.id || '').replace(/@.+/g, '') === botLid,
            ) || null
        }
        const isBotAdmin = botParticipant ? botParticipant.admin !== null : false

        if (!isBotAdmin) {
            return m.reply(`╭━〔 ⚙️ SISTEMA 〕━╮\n┃ ❌ *ACCESO DENEGADO*\n╰━━━━━━━━╯\n\nEl bot debe ser admin en este grupo para poder tomar el enlace de invitación.`)
        }

        const inviteCode = await sock.groupInviteCode(m.chat).catch(() => null)
        
        if (!inviteCode) {
            return m.reply(`╰┈➤ ❌ Error al obtener el enlace de invitación del grupo. Asegúrate de que el bot sea un admin válido.`)
        }

        const inviteLink = `https://chat.whatsapp.com/${inviteCode}`
        const groupName = groupMetadata.subject

        db.setting('onlyThisGroup', {
            jid: m.chat,
            name: groupName,
            link: inviteLink
        })
        db.save()

        await m.reply(
            `╭━━━〔 ✦ ÉXITO 〕━━━╮\n` +
            `┃ 🔒 *BLOQUEO EXITOSO*\n` +
            `╰━━━━━━━━━━━━╯\n\n` +
            `Desde ahora, el bot solo se puede usar de forma exclusiva en el grupo:\n` +
            `👑 *${groupName}*\n\n` +
            `Los usuarios de otros grupos serán dirigidos a unirse a través del enlace:\n` +
            `${inviteLink}\n\n` +
            `✦ Escribe \`.onlythisgrup\` nuevamente para desbloquear.`
        )
    } catch (error) {
        console.error(error)
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }