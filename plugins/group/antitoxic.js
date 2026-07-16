import { getDatabase } from '../../src/lib/ourin-database.js'
import config from '../../config.js'
const pluginConfig = {
    name: 'antitoxic',
    alias: ['toxic', 'antitoxik'],
    category: 'group',
    description: 'Gestiona antitóxico en el grupo',
    usage: '.antitoxic <on/off/warn/metode>',
    example: '.antitoxic on',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

const DEFAULT_TOXIC_WORDS = [
    'anjing', 'bangsat', 'kontol', 'memek', 'ngentot', 'babi', 'tolol',
    'goblok', 'idiot', 'bodoh', 'kampret', 'asu', 'jancok', 'bajingan',
    'keparat', 'setan', 'iblis', 'tai', 'brengsek', 'sialan'
]

function isToxic(text, toxicList) {
    if (!text || typeof text !== 'string') return { toxic: false, word: null }

    const lowerText = text.toLowerCase().trim()
    if (!lowerText) return { toxic: false, word: null }

    const words = (toxicList && toxicList.length > 0) ? toxicList : DEFAULT_TOXIC_WORDS

    for (const word of words) {
        if (!word) continue
        const lowerWord = word.toLowerCase().trim()
        if (!lowerWord) continue

        const escapedWord = lowerWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const regex = new RegExp(`(^|\\s|[^a-zA-Z0-9])${escapedWord}($|\\s|[^a-zA-Z0-9])`, 'i')

        if (regex.test(lowerText)) {
            return { toxic: true, word }
        }
    }

    return { toxic: false, word: null }
}

function gpMsg(key, replacements = {}) {
    const defaults = {
        antitoxicWarn: '⚠ @%user% berkata kasar.\nPeringatan ke %warn% dari %max%, pelanggaran berikutnya bisa di-%method%.',
        antitoxicAction: '🚫 @%user% di-%method% karena toxic. (%warn%/%max%)',
    }
    let text = config.groupProtection?.[key] || defaults[key] || ''
    for (const [k, v] of Object.entries(replacements)) {
        text = text.replace(new RegExp(`%${k}%`, 'g'), v)
    }
    return text
}

async function handleToxicMessage(m, sock, db, toxicWord) {
    const groupData = db.getGroup(m.chat) || {}
    const maxWarn = groupData.toxicMaxWarn || 3
    const method = groupData.toxicMethod || 'kick'
    const warnCount = (groupData.toxicWarns?.[m.sender] || 0) + 1

    if (!groupData.toxicWarns) groupData.toxicWarns = {}
    groupData.toxicWarns[m.sender] = warnCount
    db.setGroup(m.chat, groupData)

    try {
        await sock.sendMessage(m.chat, { delete: m.key })
    } catch {}

    const senderTag = m.sender.split('@')[0]

    if (warnCount >= maxWarn) {
        if (method === 'kick') {
            try {
                await sock.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
            } catch {}
        }

        groupData.toxicWarns[m.sender] = 0
        db.setGroup(m.chat, groupData)

        await sock.sendMessage(m.chat, {
            text: gpMsg('antitoxicAction', {
                user: senderTag,
                warn: String(warnCount),
                max: String(maxWarn),
                method
            }),
            mentions: [m.sender],
        })
    } else {
        await sock.sendMessage(m.chat, {
            text: gpMsg('antitoxicWarn', {
                user: senderTag,
                warn: String(warnCount),
                max: String(maxWarn),
                method
            }),
            mentions: [m.sender],
        })
    }

    return true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.args || []
    const subCommand = args[0]?.toLowerCase()

    const groupData = db.getGroup(m.chat) || {}

    if (!subCommand) {
        const status = groupData.antitoxic ? '✅ ON' : '❌ OFF'
        const toxicCount = groupData.toxicWords?.length || DEFAULT_TOXIC_WORDS.length
        const maxWarn = groupData.toxicMaxWarn || 3
        const method = groupData.toxicMethod || 'kick'

        let txt = `🛡️ *ᴀɴᴛɪᴛᴏxɪᴄ*\n\n`
        txt += `> Estado: *${status}*\n`
        txt += `> Palabras: *${toxicCount}*\n`
        txt += `> Máx Advertencias: *${maxWarn}*\n`
        txt += `> Método: *${method}*\n\n`
        txt += `*Comandos:*\n`
        txt += `> \`.antitoxic on/off\`\n`
        txt += `> \`.antitoxic warn <1-10>\`\n`
        txt += `> \`.antitoxic metode kick/delete\`\n`
        txt += `> \`.addtoxic <palabra>\`\n`
        txt += `> \`.deltoxic <palabra>\`\n`
        txt += `> \`.listtoxic\``

        await m.reply(txt)
        return
    }

    if (subCommand === 'on') {
        db.setGroup(m.chat, { antitoxic: true })
        m.react('✅')
        await m.reply(`✅ *Antitóxico activado*`)
        return
    }

    if (subCommand === 'off') {
        db.setGroup(m.chat, { antitoxic: false })
        m.react('❌')
        await m.reply(`❌ *Antitóxico desactivado*`)
        return
    }

    if (subCommand === 'warn') {
        const count = parseInt(args[1])
        if (!count || count < 1 || count > 10) {
            return m.reply(`❌ Ingresa un número del 1-10\n> Ejemplo: \`.antitoxic warn 5\``)
        }
        db.setGroup(m.chat, { toxicMaxWarn: count })
        m.react('✅')
        await m.reply(`✅ Máximo de advertencias cambiado a *${count}*`)
        return
    }

    if (subCommand === 'metode' || subCommand === 'method' || subCommand === 'mode') {
        const method = args[1]?.toLowerCase()
        if (!method || !['kick', 'delete'].includes(method)) {
            return m.reply(`❌ Elige un método: *kick* o *delete*\n> Ejemplo: \`.antitoxic metode kick\``)
        }
        db.setGroup(m.chat, { toxicMethod: method })
        m.react('✅')
        await m.reply(`✅ Método cambiado a *${method}*`)
        return
    }

    await m.reply(`❌ Subcomando desconocido.\n> Escribe \`.antitoxic\` para ver la lista de comandos.`)
}

export { pluginConfig as config, handler, isToxic, handleToxicMessage, DEFAULT_TOXIC_WORDS }