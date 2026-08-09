const afkStorage = global.afkStorage || (global.afkStorage = new Map())

const pluginConfig = {
    name: 'afk',
    alias: ['away', 'brb'],
    category: 'group',
    description: 'Configurar el estado AFK con una razón',
    usage: '.afk <razón>',
    example: '.afk comiendo',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    carne: 0,
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
        return `${hours} h ${minutes % 60} min`
    } else if (minutes > 0) {
        return `${minutes} min ${seconds % 60} s`
    } else {
        return `${seconds} s`
    }
}

async function handler(m, { sock }) {
    const reason = m.text || 'Sin razón'
    setAfkUser(m.sender, reason)
    await m.reply(
        `💤 *ᴀꜰᴋ ᴀᴄᴛɪᴠᴏ*\n\n` +
        `\`\`\`@${m.sender.split('@')[0]} ahora está AFK\`\`\`\n` +
        `🍀 \`Razón:\` *${reason}*\n\n` +
        `_Escribe cualquier cosa para desactivar el AFK._`,
        { mentions: [m.sender] }
    )
}

async function checkAfk(m, sock) {
    const afkData = getAfkUser(m.sender)
    if (afkData) {
        if (m.isCommand && m.command?.toLowerCase() === 'afk') return
        removeAfkUser(m.sender)
        const duration = formatDuration(Date.now() - afkData.time)
        await m.reply(`👋 *ᴀꜰᴋ ᴛᴇʀᴍɪɴᴀᴅᴏ*\n\n` +
                `\`\`\`@${m.sender.split('@')[0]} ya volvió!\`\`\`\n` +
                `🍀 \`Duración AFK:\` *${duration}*`, { mentions: [m.sender] })
    }
    if (m.isGroup && m.mentionedJid && m.mentionedJid.length > 0) {
        for (const mentioned of m.mentionedJid) {
            const mentionedAfk = getAfkUser(mentioned)
            if (mentionedAfk) {
                const duration = formatDuration(Date.now() - mentionedAfk.time)
                await m.reply(`💤 *ᴜsᴜᴀʀɪᴏ ᴀꜰᴋ*\n\n` +
                        `\`\`\`Shhh, no lo molestes!\`\`\` \`@${mentioned.split('@')[0]}\` está AFK\n` +
                        `🍀 \`Razón:\` *${mentionedAfk.reason}*\n` +
                        `🍀 \`Desde hace:\` *${duration}*`, { mentions: [mentioned] })
            }
        }
    }
}

export { pluginConfig as config, handler, checkAfk, getAfkUser, setAfkUser, removeAfkUser, isUserAfk }