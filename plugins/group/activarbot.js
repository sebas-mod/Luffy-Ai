import { getDatabase } from '../../src/lib/luffy-database.js'
import {
    getCodes,
    saveCodes,
    ensureSewa,
    computeEndDate,
    formatDurationLabel,
    formatDateEs,
} from '../../src/lib/luffy-activation.js'

const pluginConfig = {
    name: 'activarbot',
    alias: ["activar", "canjear", "activarcodigo"],
    category: 'group',
    description: 'Activar el bot en este grupo con un código de activación',
    usage: '.activarbot <codigo>',
    example: '.activarbot ABC123',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: false,
    cooldown: 10,
    carne: 0,
    isEnabled: true,
}

async function handler(m, { sock }) {
    const db = getDatabase()

    if (m.args.length < 1) {
        m.react('❌')
        return m.reply(
            `👑•─────•👑\n🎟️ *ACTIVAR BOT*\n\n` +
            `Formato: *${m.prefix}activarbot <codigo>*\n\n` +
            `*EJEMPLO:*\n` +
            `• ${m.prefix}activarbot ABC123\n\n` +
            `💡 Consigue tu código con el owner del bot\n` +
            `💡 Estado con: *${m.prefix}ver_renta*\n` +
            `♰ ──────── ♱`
        )
    }

    const code = m.args[0].toUpperCase()
    const codes = getCodes(db)

    if (!codes[code]) {
        m.react('❌')
        return m.reply(
            `☽◯☾ ╭ ♰ 🎟️ ACTIVAR BOT ♰ ━╮ ☽◯☾\n` +
            `┃ ❌ El código \`${code}\` no es válido.\n` +
            `╰━ ⊱༺༒༻⊰ ━╯\n\n` +
            `Verificá que esté bien escrito o contactá al owner para adquirir uno.`
        )
    }

    if (codes[code].used) {
        m.react('❌')
        const usedIn = codes[code].groupName ? ` en *${codes[code].groupName}*` : ''
        return m.reply(
            `☽◯☾ ╭ ♰ 🎟️ ACTIVAR BOT ♰ ━╮ ☽◯☾\n` +
            `┃ ❌ El código \`${code}\` ya fue canjeado${usedIn}.\n` +
            `╰━ ⊱༺༒༻⊰ ━╯\n\n` +
            `Cada código se usa una sola vez. Contactá al owner para otro.`
        )
    }

    await m.react('🕕')

    const sewa = ensureSewa(db)
    const now = Date.now()
    const dur = {
        value: codes[code].duration.value,
        unit: codes[code].duration.unit,
        label: codes[code].durationLabel,
    }
    const expiredAt = computeEndDate(now, dur)
    const isLifetime = expiredAt === Infinity

    let groupName = m.chat.split('@')[0]
    try {
        const meta = await sock.groupMetadata(m.chat)
        if (meta?.subject) groupName = meta.subject
    } catch { }

    const previous = sewa.groups[m.chat] && !sewa.groups[m.chat].isLifetime && sewa.groups[m.chat].expiredAt > now

    sewa.enabled = true
    sewa.groups[m.chat] = {
        name: groupName,
        addedAt: now,
        startAt: now,
        expiredAt: isLifetime ? 0 : expiredAt,
        isLifetime,
        addedBy: m.sender,
        activeCode: code,
        status: 'active',
    }

    codes[code].used = true
    codes[code].usedBy = m.sender
    codes[code].usedAt = now
    codes[code].groupId = m.chat
    codes[code].groupName = groupName
    saveCodes(db, codes)
    db.db.write()

    m.react('✅')

    let text = `👑•─────•👑\n🎟️ *BOT ACTIVADO* ✅\n\n`
    text += `Grupo: *${groupName}*\n`
    text += `🆔 Código: *\`${code}\`*\n`
    text += `⏳ Duración: *${formatDurationLabel(dur)}*\n`
    text += `📅 *Inicio:* ${formatDateEs(now)}\n`
    text += `⏰ *Termina:* ${formatDateEs(expiredAt)}\n\n`
    if (isLifetime) {
        text += `♾️ Este grupo tiene el bot activado de forma permanente.`
    } else {
        const remaining = expiredAt - now
        const days = Math.floor(remaining / 86400000)
        text += `🔥 Cuando se venza el bot saldrá del grupo automáticamente.\n`
        text += `_Prórroga: ${days} día(s) para ${formatDateEs(expiredAt)}_\n\n`
        text += `¿Renovar? Consultá por *${m.prefix}ver_renta*`
    }
    text += `\n♰ ──────── ♱`

    if (previous) {
        text = `👑•─────•👑\n🎟️ *BOT RENOVADO* ✅\n\n` +
            `Grupo: *${groupName}*\n` +
            text.split('\n\n')[1] +
            `\n\n⚠️ La activación anterior fue reemplazada por la nueva (desde hoy).\n` +
            `♰ ──────── ♱`
    }

    return m.reply(text)
}

export { pluginConfig as config, handler }