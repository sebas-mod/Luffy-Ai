import { getDatabase } from '../../src/lib/ourin-database.js'
import { getParticipantJid } from '../../src/lib/ourin-lid.js'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'warn',
    alias: ['warning', 'peringatan'],
    category: 'group',
    description: 'Dar advertencia a un miembro del grupo',
    usage: '.warn @user <alasan>',
    example: '.warn @user spam',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    
    let groupData = db.getGroup(m.chat) || {}
    let warnings = groupData.warnings || {}
    const maxWarns = groupData.maxWarnings || 3

    const args = m.args
    if (!args[0] && !m.quoted && (!m.mentionedJid || m.mentionedJid.length === 0)) {
        return m.reply(
            `⚠️ *SISTEMA DE ADVERTENCIAS DEL GRUPO*\n\n` +
            `Sistema de gestión de infracciones para miembros del grupo.\n` +
            `Límite de Advertencias: *${maxWarns} veces* (Expulsión Automática)\n\n` +
            `*USO:*\n` +
            `• *${m.prefix}warn @user <razón>* — Dar advertencia\n` +
            `• *${m.prefix}warn max <número>* — Cambiar el límite máximo de advertencias\n` +
            `• *${m.prefix}listwarn* — Ver lista de miembros con problemas\n` +
            `• *${m.prefix}resetwarn @user* — Eliminar todas las advertencias de un miembro\n\n` +
            `*EXPLICACIÓN DEL FLUJO DE USO:*\n` +
            `1. Cuando un miembro comete la primera infracción, dale SP1: *${m.prefix}warn @user Spam de mensajes*\n` +
            `2. El bot registrará "Spam de mensajes" como su advertencia n.º 1.\n` +
            `3. Si vuelve a infringir, dale la segunda advertencia con una nueva razón: *${m.prefix}warn @user Lenguaje ofensivo*\n` +
            `4. Si el total de advertencias del miembro alcanza el límite máximo (actualmente *${maxWarns}*), el bot EXPULSARÁ automáticamente al miembro. 🏴‍☠️\n` +
            `5. El historial de infracciones se puede ver completo escribiendo *${m.prefix}listwarn @user*.`
        )
    }
    if (args[0]?.toLowerCase() === 'max') {
        const newMax = parseInt(args[1])
        if (isNaN(newMax) || newMax < 1 || newMax > 20) {
            return m.reply(`❌ *GAGAL*\n\nEl límite de referencia de advertencias debe ser un número del 1-20.\nEjemplo: *${m.prefix}warn max 5*`)
        }
        groupData.maxWarnings = newMax
        db.setGroup(m.chat, groupData)
        return m.reply(`✅ *LÍMITE DE ADVERTENCIAS CAMBIADO*\n\nEl límite máximo de advertencias de este grupo ha sido actualizado a *${newMax} veces*.`)
    }

    let targetUser = null
    if (m.quoted) {
        targetUser = m.quoted.sender
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
        targetUser = m.mentionedJid[0]
    }
    
    if (!targetUser) {
        await m.reply(
            `⚠️ *CÓMO USAR*\n\n` +
            `> Responde al mensaje del usuario + \`${m.prefix}warn razón\`\n` +
            `> O: \`${m.prefix}warn @user razón\``
        )
        return
    }
    try {
        const groupMeta = m.groupMetadata
        const participant = groupMeta.participants.find(p => getParticipantJid(p) === targetUser)
        if (participant?.admin) {
            await m.reply(`❌ No se puede dar advertencias a un admin del grupo.`)
            return
        }
    } catch (e) {}
    
    const botJid = sock.user?.id?.split(':')[0] + '@s.whatsapp.net'
    if (targetUser === botJid) {
        await m.reply(`❌ No me des advertencias, soy solo un bot. 🏴‍☠️`)
        return
    }
    
    const reasonArg = m.quoted ? m.text?.trim() : m.text?.replace(/@\d+/g, '').replace(/^\s*warn\s*/i, '').trim()
    const reason = reasonArg || 'Sin razón'
    
    let userWarnings = warnings[targetUser] || []
    userWarnings.push({
        reason: reason,
        by: m.sender,
        time: Date.now()
    })
    
    warnings[targetUser] = userWarnings
    db.setGroup(m.chat, { ...groupData, warnings: warnings })
    
    const warnCount = userWarnings.length
    const targetName = targetUser.split('@')[0]
    
    if (warnCount >= maxWarns) {
        try {
            await sock.groupParticipantsUpdate(m.chat, [targetUser], 'remove')
            await m.reply(
                `🚨 *MÁXIMO DE ADVERTENCIAS ALCANZADO*\n\n` +
                `@${targetName} ha sido expulsado del grupo por alcanzar el límite de infracciones!\n\n` +
                `*Detalles:*\n` +
                `> Advertencias: *${warnCount}/${maxWarns}*\n` +
                `> Última Razón: *${reason}*`,
                { mentions: [targetUser] }
            )
            delete warnings[targetUser]
            db.setGroup(m.chat, { ...groupData, warnings: warnings })
        } catch (e) {
            m.reply(te(m.prefix, m.command, m.pushName))
        }
    } else {
        await m.reply(
            `⚠️ *ADVERTENCIA RECIBIDA*\n\n` +
            `@${targetName} ha recibido una Carta de Advertencia (SP${warnCount})!\n\n` +
            `*Detalles:*\n` +
            `> Advertencia n.º: *${warnCount}/${maxWarns}*\n` +
            `> Razón: *${reason}*\n\n` +
            `_${maxWarns - warnCount} advertencias más = EXPULSIÓN AUTOMÁTICA_`,
            { mentions: [targetUser] }
        )
    }
}

export { pluginConfig as config, handler }
