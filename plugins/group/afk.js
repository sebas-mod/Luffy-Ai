const afkStorage = global.afkStorage || (global.afkStorage = new Map())

const pluginConfig = {
    name: 'afk',
    alias: ['away', 'brb'],
    category: 'group',
    description: 'Establece estado AFK con razón',
    usage: '.afk <alasan>',
    example: '.afk lagi makan',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function getAfkUser(jid) {
    return afkStorage.get(jid) || null
}

function setAfkUser(jid, reason) {
    afkStorage.set(jid, {
        reason: reason || 'Sin razón',
        time: Date.now()
    })
}

function removeAfkUser(jid) {
    afkStorage.delete(jid)
}

function isUserAfk(jid) {
    return afkStorage.has(jid)
}

function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    if (hours > 0) {
        return `${hours} horas ${minutes % 60} minutos`
    } else if (minutes > 0) {
        return `${minutes} minutos ${seconds % 60} segundos`
    } else {
        return `${seconds} segundos`
    }
}

async function handler(m, { sock }) {
    const reason = m.text || 'Sin razón'
    setAfkUser(m.sender, reason)
    await m.reply(
        `💤 *ᴀꜰᴋ ᴀᴄᴛɪᴠᴏ*\n\n` +
        `\`\`\`@${m.sender.split('@')[0]} ahora está AFK\`\`\`\n` +
        `🍀 \`Razón:\` *${reason}*\n\n` +
        `_Escribe algo para desactivar AFK._`,
        { mentions: [m.sender] }
    )
}

async function checkAfk(m, sock) {
    const afkData = getAfkUser(m.sender)
    if (afkData) {
        if (m.isCommand && m.command?.toLowerCase() === 'afk') return
        removeAfkUser(m.sender)
        const duration = formatDuration(Date.now() - afkData.time)
        await m.reply(`👋 *ᴀꜰᴋ ꜰɪɴᴀʟɪᴢᴀᴅᴏ*\n\n` +
                `\`\`\`@${m.sender.split('@')[0]} ¡ya regresó!\`\`\`\n` +
                `🍀 \`Duración AFK:\` *${duration}*`, { mentions: [m.sender] })
    }
    if (m.isGroup && m.mentionedJid && m.mentionedJid.length > 0) {
        for (const mentioned of m.mentionedJid) {
            const mentionedAfk = getAfkUser(mentioned)
            if (mentionedAfk) {
                const duration = formatDuration(Date.now() - mentionedAfk.time)
                await m.reply(`💤 *ᴜsᴇʀ ᴀꜰᴋ*\n\n` +
                        `\`\`\`¡Shh, no lo molestes!\`\`\` \`@${mentioned.split('@')[0]}\` está AFK\n` +
                        `🍀 \`Razón:\` *${mentionedAfk.reason}*\n` +
                        `🍀 \`Desde:\` *${duration} atrás*`, { mentions: [mentioned] })
            }
        }
    }
}

export { pluginConfig as config, handler, checkAfk, getAfkUser, setAfkUser, removeAfkUser, isUserAfk }