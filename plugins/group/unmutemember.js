import { getDatabase } from '../../src/lib/luffy-database.js'
import { isLid, lidToJid } from '../../src/lib/luffy-lid.js'

const pluginConfig = {
    name: 'unmutemember',
    alias: ['unmutmember', 'unsilentmember', 'unbisukanmember', 'listmutemember', 'listmute'],
    category: 'group',
    description: 'Desilenciar a un miembro específico',
    usage: '.unmutemember <@tag/reply/número>',
    example: '.unmutemember @user',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    isBotAdmin: true,
    cooldown: 5,
    carne: 0,
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
            return m.reply("╭━━━〔 ⚡ GRUPO 〕━━━╮\n┃ "+`🔇 *LISTA DE MIEMBROS SILENCIADOS*\n\n> No hay miembros silenciados en este grupo`+"\n╰━━━━━━━━━━━━╯")
        }

        let txt = `🔇 *LISTA DE MIEMBROS SILENCIADOS*\n\n╭┈┈⬡「 📋 *ʟɪsᴛᴀ* 」\n`
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
            `> Desilencia a un miembro específico\n\n` +
            `\`Ejemplo:\`\n` +
            `> ${m.prefix}unmutemember @user\n` +
            `> ${m.prefix}unmutemember 6281234567890\n` +
            `> Responde el mensaje del miembro + ${m.prefix}unmutemember`
        )
    }

    const targetNumber = targetJid.replace(/@.+/g, '')

    const index = mutedMembers.findIndex(jid => {
        const c = jid.replace(/@.+/g, '')
        return c === targetNumber || c.endsWith(targetNumber) || targetNumber.endsWith(c)
    })

    if (index === -1) {
        return m.reply("╭━━━〔 ⚡ GRUPO 〕━━━╮\n"+`❌ *ᴇʀʀᴏʀ*\n\n> El miembro @${targetNumber} no está silenciado`+"\n╰━━━━━━━━━━━━╯", { mentions: [targetJid] })
    }

    mutedMembers.splice(index, 1)
    db.setGroup(m.chat, { ...groupData, mutedMembers })

    m.react('🔊')
    await m.reply(
        `🔊 *MIEMBRO DESILENCIADO*\n\n` +
        `╭┈┈⬡「 📋 *ᴅᴇᴛᴀʟʟᴇ* 」\n` +
        `┃ 👤 ᴍɪᴇᴍʙʀᴏ: @${targetNumber}\n` +
        `┃ 🔊 ᴇsᴛᴀᴅᴏ: \`Desilenciado\`\n` +
        `┃ 📊 sɪʟᴇɴᴄɪᴀᴅᴏs ʀᴇsᴛᴀɴᴛᴇs: \`${mutedMembers.length}\` ᴍɪᴇᴍʙʀᴏs\n` +
        `╰┈┈⬡`,
        { mentions: [targetJid] }
    )
}

export { pluginConfig as config, handler }
