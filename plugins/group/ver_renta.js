import { getDatabase } from '../../src/lib/luffy-database.js'
import * as timeHelper from '../../src/lib/luffy-time.js'
const pluginConfig = {
    name: 'ver_renta',
    alias: ["rentarestante"],
    category: 'group',
    description: 'Ver el tiempo restante del alquiler del bot en este grupo',
    usage: '.ver_renta',
    example: '.ver_renta',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: false,
    cooldown: 10,
    carne: 0,
    isEnabled: true
}

function formatCountdown(expiredAt) {
    const diff = expiredAt - Date.now()
    if (diff <= 0) return { text: 'EXPIRADO', expired: true }
    const days = Math.floor(diff / 86400000)
    const hours = Math.floor((diff % 86400000) / 3600000)
    const minutes = Math.floor((diff % 3600000) / 60000)
    let text = ''
    if (days > 0) text += `${days} días `
    if (hours > 0) text += `${hours} horas `
    if (minutes > 0 && days === 0) text += `${minutes} minutos`
    return { text: text.trim(), expired: false }
}

function handler(m) {
    const db = getDatabase()
    if (!db.db.data.sewa) {
        db.db.data.sewa = { enabled: false, groups: {} }
        db.db.write()
    }

    if (!db.db.data.sewa.enabled) {
        return m.reply("╭━━━〔 ⚡ GRUPO 〕━━━╮\n┃ "+`ℹ️ El sistema de alquiler está inactivo\n\nEste bot se puede usar en todos los grupos.`+"\n╰━━━━━━━━━━━━╯")
    }

    const sewaData = db.db.data.sewa.groups[m.chat]

    if (!sewaData) {
        return m.reply("╭━━━〔 ⚡ GRUPO 〕━━━╮\n┃ "+`❌ Este grupo no está registrado en el sistema de alquiler\n\nContacta al owner del bot para info sobre el alquiler.`+"\n╰━━━━━━━━━━━━╯")
    }

    const groupName = sewaData.name || m.chat.split('@')[0]
    const addedDate = sewaData.addedAt ? timeHelper.fromTimestamp(sewaData.addedAt, 'D MMMM YYYY') : '-'

    if (sewaData.isLifetime) {
        m.react('♾️')
        return m.reply(
            `♾️ *ESTADO DEL ALQUILER*\n\n` +
            `Grupo: *${groupName}*\n` +
            `Estado: *Permanente* ♾️\n` +
            `Registrado desde: *${addedDate}*\n\n` +
            `El bot estará activo para siempre en este grupo.`
        )
    }

    const countdown = formatCountdown(sewaData.expiredAt)
    const expiredStr = timeHelper.fromTimestamp(sewaData.expiredAt, 'D MMMM YYYY HH:mm')

    if (countdown.expired) {
        return m.reply(
            `❌ *ALQUILER EXPIRADO*\n\n` +
            `Grupo: *${groupName}*\n` +
            `Termina: *${expiredStr}*\n\n` +
            `Contacta al owner del bot para renovar el alquiler.`
        )
    }

    const diff = sewaData.expiredAt - Date.now()
    const isAlmostExpired = diff <= 259200000

    m.react(isAlmostExpired ? '⚠️' : '⏱️')
    let text = `⏱️ *ESTADO DEL ALQUILER*\n\n`
    text += `Grupo: *${groupName}*\n`
    text += `Tiempo restante: *${countdown.text}*\n`
    text += `Termina: *${expiredStr}*\n`
    text += `Registrado desde: *${addedDate}*`

    if (isAlmostExpired) {
        text += `\n\n⚠️ ¡El alquiler está por expirar! Contacta al owner del bot para renovarlo.`
    }

    return m.reply(text)
}

export { pluginConfig as config, handler }