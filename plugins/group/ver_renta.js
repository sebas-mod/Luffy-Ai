import { getDatabase } from '../../src/lib/luffy-database.js'
import { ensureSewa, formatCountdown, formatDateEs } from '../../src/lib/luffy-activation.js'

const pluginConfig = {
    name: 'ver_renta',
    alias: ["rentarestante", "estadobbot", "activacion", "estadobot"],
    category: 'group',
    description: 'Ver el estado de la activación del bot en este grupo (inicio y fin)',
    usage: '.ver_renta',
    example: '.ver_renta',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: false,
    cooldown: 10,
    carne: 0,
    isEnabled: true,
}

function handler(m) {
    const db = getDatabase()
    const sewa = ensureSewa(db)

    if (!sewa.enabled) {
        return m.reply(
            "☽◯☾ ╭━ ♰ ⚡ GRUPO ♰ ━╮ ☽◯☾\n┃ " +
            `ℹ️ El sistema de activación está inactivo\n\nEste bot se puede usar en todos los grupos.` +
            "\n╰━ ⊱༺༒༻⊰ ━╯"
        )
    }

    const data = sewa.groups[m.chat]

    if (!data) {
        return m.reply(
            "☽◯☾ ╭━ ♰ ⚡ GRUPO ♰ ━╮ ☽◯☾\n┃ " +
            `❌ Este grupo no está activado\n\nContacta al owner del bot para adquirir una activación.` +
            "\n╰━ ⊱༺༒༻⊰ ━╯"
        )
    }

    const groupName = data.name || m.chat.split('@')[0]
    const startDate = formatDateEs(data.startAt || data.addedAt)

    if (data.isLifetime) {
        m.react('♾️')
        return m.reply(
            `👑•─────•👑\n♾️ *ESTADO DEL BOT*\n\n` +
            `Grupo: *${groupName}*\n` +
            `Estado: *Permanente* ♾️\n` +
            `📅 Inicio: ${startDate}\n` +
            `⏰ Termina: *Nunca* ♾️\n\n` +
            `El bot estará activo para siempre en este grupo.` +
            `\n♰ ──────── ♱`
        )
    }

    const countdown = formatCountdown(data.expiredAt)
    const expiredStr = formatDateEs(data.expiredAt)

    if (countdown && countdown.expired) {
        m.react('❌')
        return m.reply(
            `👑•─────•👑\n❌ *ACTIVACIÓN EXPIRADA*\n\n` +
            `Grupo: *${groupName}*\n` +
            `📅 Inicio: ${startDate}\n` +
            `⏰ Terminó: *${expiredStr}*\n\n` +
            `Contacta al owner del bot para renovar la activación.` +
            `\n♰ ──────── ♱`
        )
    }

    const diff = data.expiredAt - Date.now()
    const isAlmostExpired = diff <= 259200000

    m.react(isAlmostExpired ? '⚠️' : '⏱️')
    let text = `👑•─────•👑\n⏱️ *ESTADO DEL BOT*\n\n`
    text += `Grupo: *${groupName}*\n`
    text += `📅 *Inicio:* ${startDate}\n`
    text += `⏰ *Termina:* ${expiredStr}\n`
    text += `⏳ Restante: *${countdown ? countdown.text : '-'}*\n`
    if (data.activeCode) text += `🎟️ Código: *\`${data.activeCode}\`*\n`

    if (isAlmostExpired) {
        text += `\n⚠️ ¡La activación está por vencer! Contacta al owner para renovarla.`
    }

    text += `\n♰ ──────── ♱`
    return m.reply(text)
}

export { pluginConfig as config, handler }