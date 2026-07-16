import { getDatabase } from '../../src/lib/ourin-database.js'
import { isLid, lidToJid, resolveAnyLidToJid } from '../../src/lib/ourin-lid.js'

const pluginConfig = {
    name: 'mutemember',
    alias: ['mutmember', 'silentmember', 'bisukanmember'],
    category: 'group',
    description: 'Silenciar a un miembro específico (los mensajes serán eliminados por el bot)',
    usage: '.mutemember <@tag/reply/nomor>',
    example: '.mutemember @user',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    isBotAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function resolveTarget(m) {
    let raw = ''

    if (m.quoted) {
        raw = m.quoted.sender || ''
    } else if (m.mentionedJid?.length) {
        raw = m.mentionedJid[0] || ''
    } else if (m.args[0]) {
        raw = m.args[0]
    }

    if (!raw) return ''

    if (isLid(raw)) raw = lidToJid(raw)
    if (!raw.includes('@')) raw = raw.replace(/[^0-9]/g, '') + '@s.whatsapp.net'

    return raw
}

async function handler(m, { sock }) {
    const targetJid = resolveTarget(m)

    if (!targetJid) {
        return m.reply(
            `🔇 *SILENCIAR MIEMBRO*\n\n` +
            `> Silenciar a un miembro específico del grupo\n` +
            `> Los mensajes del miembro silenciado serán eliminados por el bot\n\n` +
            `\`Ejemplo:\`\n` +
            `> ${m.prefix}mutemember @user\n` +
            `> ${m.prefix}mutemember 6281234567890\n` +
            `> Responde al mensaje del miembro + ${m.prefix}mutemember\n\n` +
            `_¡No tenemos miedo! Pero hay que saber callar a los enemigos._`
        )
    }

    const targetNumber = targetJid.replace(/@.+/g, '')

    if (m.isGroup) {
        const isTargetAdmin = m.groupMetadata?.participants?.some(p => {
            const pJid = (p.id || p.jid || '').replace(/@.+/g, '')
            return pJid === targetNumber && (p.admin === 'admin' || p.admin === 'superadmin')
        })
        if (isTargetAdmin) {
            return m.reply(`❌ *ғᴀᴄᴇʟ*\n\n> No se puede silenciar a un admin del grupo`)
        }
    }

    const db = getDatabase()
    const groupData = db.getGroup(m.chat) || {}
    const mutedMembers = groupData.mutedMembers || []

    const alreadyMuted = mutedMembers.some(jid => {
        const c = jid.replace(/@.+/g, '')
        return c === targetNumber || c.endsWith(targetNumber) || targetNumber.endsWith(c)
    })

    if (alreadyMuted) {
        return m.reply(`❌ *ғᴀᴄᴇʟ*\n\n> El miembro @${targetNumber} ya está silenciado`, { mentions: [targetJid] })
    }

    mutedMembers.push(targetJid)
    db.setGroup(m.chat, { ...groupData, mutedMembers })

    m.react('🔇')
    await m.reply(
        `🔇 *MIEMBRO SILENCIADO*\n\n` +
        `╭┈┈⬡「 📋 *ᴅᴇᴛᴀʟʟᴇs* 」\n` +
        `┃ 👤 ᴍɪᴇᴍʙʀᴏ: @${targetNumber}\n` +
        `┃ 🔇 ᴇsᴛᴀᴅᴏ: \`Silenciado\`\n` +
        `┃ 📊 ᴛᴏᴛᴀʟ sɪʟᴇɴᴄɪᴀᴅᴏs: \`${mutedMembers.length}\` ᴍɪᴇᴍʙʀᴏs\n` +
        `╰┈┈⬡\n\n` +
        `> Todos los mensajes de este miembro serán eliminados automáticamente\n` +
        `> Usa \`${m.prefix}unmutemember\` para des-silenciar\n\n` +
        `_¡Shishishi! El silencio es una arma poderosa._`,
        { mentions: [targetJid] }
    )
}

function isMutedMember(groupJid, senderJid, db) {
    const groupData = db.getGroup(groupJid) || {}
    const mutedMembers = groupData.mutedMembers || []
    if (mutedMembers.length === 0) return false

    const senderNumber = senderJid.replace(/@.+/g, '')
    return mutedMembers.some(jid => {
        const c = jid.replace(/@.+/g, '')
        return c === senderNumber || c.endsWith(senderNumber) || senderNumber.endsWith(c)
    })
}

export { pluginConfig as config, handler, isMutedMember }
