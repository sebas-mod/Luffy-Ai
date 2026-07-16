import { getDatabase } from '../../src/lib/ourin-database.js'
import { isLid, lidToJid } from '../../src/lib/ourin-lid.js'

const pluginConfig = {
    name: 'unmutemember',
    alias: ['unmutmember', 'unsilentmember', 'unbisukanmember', 'listmutemember', 'listmute'],
    category: 'group',
    description: 'Membuka mute member tertentu',
    usage: '.unmutemember <@tag/reply/nomor>',
    example: '.unmutemember @user',
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
    const db = getDatabase()
    const groupData = db.getGroup(m.chat) || {}
    const mutedMembers = groupData.mutedMembers || []

    if (m.command === 'listmutemember' || m.command === 'listmute') {
        if (mutedMembers.length === 0) {
            return m.reply(`🔇 *LISTA DE MIEMBROS SILENCIADOS*\n\n> No hay miembros silenciados en este grupo`)
        }

        let txt = `🔇 *LISTA DE MIEMBROS SILENCIADOS*\n\n╭┈┈⬡「 📋 *ᴅᴀꜰᴛᴀʀ* 」\n`
        mutedMembers.forEach((jid, i) => {
            const num = jid.replace(/@.+/g, '')
            txt += `┃ ${i + 1}. @${num}\n`
        })
        txt += `╰┈┈⬡\n\n> Total: \`${mutedMembers.length}\` miembros silenciados`

        return m.reply(txt, { mentions: mutedMembers })
    }

    const targetJid = resolveTarget(m)

    if (!targetJid) {
        return m.reply(
            `🔊 *DESILENCIAR MIEMBRO*\n\n` +
            `> Desilenciar a un miembro específico\n\n` +
            `\`Ejemplo:\`\n` +
            `> ${m.prefix}unmutemember @user\n` +
            `> ${m.prefix}unmutemember 6281234567890\n` +
            `> Responde a un mensaje del miembro + ${m.prefix}unmutemember`
        )
    }

    const targetNumber = targetJid.replace(/@.+/g, '')

    const index = mutedMembers.findIndex(jid => {
        const c = jid.replace(/@.+/g, '')
        return c === targetNumber || c.endsWith(targetNumber) || targetNumber.endsWith(c)
    })

    if (index === -1) {
        return m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> El miembro @${targetNumber} no está silenciado`, { mentions: [targetJid] })
    }

    mutedMembers.splice(index, 1)
    db.setGroup(m.chat, { ...groupData, mutedMembers })

    m.react('🔊')
    await m.reply(
        `🔊 *MIEMBRO DESILENCIADO*\n\n` +
        `╭┈┈⬡「 📋 *ᴅᴇᴛᴀɪʟ* 」\n` +
        `┃ 👤 ᴍᴇᴍʙᴇʀ: @${targetNumber}\n` +
        `┃ 🔊 sᴛᴀᴛᴜs: \`Desilenciado\`\n` +
        `┃ 📊 sɪsᴀ ᴍᴜᴛᴇ: \`${mutedMembers.length}\` ᴍᴇᴍʙᴇʀ\n` +
        `╰┈┈⬡`,
        { mentions: [targetJid] }
    )
}

export { pluginConfig as config, handler }
