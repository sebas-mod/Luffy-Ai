import { getDatabase } from '../../src/lib/luffy-database.js'
import * as timeHelper from '../../src/lib/luffy-time.js'
const pluginConfig = {
    name: 'lista_rentas',
    alias: ["sewalist"],
    category: 'owner',
    description: 'Ver la lista de grupos registrados en el alquiler',
    usage: '.listsewa',
    example: '.listsewa',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    carne: 0,
    isEnabled: true
}

function formatCountdown(data) {
    if (data.status === 'expired') return '🚫 EXPIRED (salido)'
    if (data.isLifetime) return '♾️ Permanente'
    const diff = data.expiredAt - Date.now()
    if (diff <= 0) return '❌ EXPIRED'
    const days = Math.floor(diff / 86400000)
    const hours = Math.floor((diff % 86400000) / 3600000)
    const minutes = Math.floor((diff % 3600000) / 60000)
    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
}

function getStatusEmoji(data) {
    if (data.status === 'expired') return '🚫'
    if (data.isLifetime) return '♾️'
    const diff = data.expiredAt - Date.now()
    if (diff <= 0) return '❌'
    if (diff <= 259200000) return '⚠️'
    return '✅'
}

function handler(m) {
    const db = getDatabase()
    if (!db.db.data.sewa) {
        db.db.data.sewa = { enabled: false, groups: {} }
        db.db.write()
    }

    const sewaGroups = db.db.data.sewa.groups || {}
    const groupIds = Object.keys(sewaGroups)

    if (groupIds.length === 0) {
        return m.reply(
            `╭━〔 ⚙️ SISTEMA 〕━╮\n` +
            `┃ 📋 *LISTA DE RENTAS*\n` +
            `╰━━━━━━━━╯\n\n` +
            `Estado: *${db.db.data.sewa.enabled ? '✅ ACTIVO' : '❌ INACTIVO'}*\n` +
            `Aún no hay grupos registrados\n\n` +
            `╰┈➤ Agrega con: *${m.prefix}agregar_renta <enlace> <duración>*`
        )
    }

    const sorted = groupIds.sort((a, b) => {
        const aData = sewaGroups[a]
        const bData = sewaGroups[b]
        if (aData.isLifetime && !bData.isLifetime) return 1
        if (!aData.isLifetime && bData.isLifetime) return -1
        return (aData.expiredAt || 0) - (bData.expiredAt || 0)
    })

    const active = sorted.filter(id => sewaGroups[id].isLifetime || sewaGroups[id].expiredAt > Date.now())
    const expired = sorted.filter(id => !sewaGroups[id].isLifetime && sewaGroups[id].expiredAt <= Date.now())

    let text = `╭━〔 ⚙️ SISTEMA 〕━╮\n┃ 📋 *LISTA DE RENTAS*\n╰━━━━━━━━╯\n\n`
    text += `Estado del sistema: *${db.db.data.sewa.enabled ? '✅ ACTIVO' : '❌ INACTIVO'}*\n`
    text += `Total: *${groupIds.length}* grupos (${active.length} activos, ${expired.length} expirados)\n\n`

    for (let i = 0; i < sorted.length; i++) {
        const gid = sorted[i]
        const data = sewaGroups[gid]
        const status = getStatusEmoji(data)
        const countdown = formatCountdown(data)
        const addedDate = data.addedAt ? timeHelper.fromTimestamp(data.addedAt, 'DD/MM/YYYY') : '-'

        text += `${status} *${i + 1}. ${data.name || 'Unknown'}*\n`
        text += `   ID: ${gid.split('@')[0]}\n`
        text += `   Restante: ${countdown}\n`
        text += `   Agregado: ${addedDate}\n\n`
    }

    text += `👑•─────•👑\n`
    text += `*ACCIONES:*\n`
    text += `• *${m.prefix}renovar_renta <id> <duración>* — Renovar\n`
    text += `• *${m.prefix}quitar_renta <id>* — Quitar de la lista blanca`

    return m.reply(text)
}

export { pluginConfig as config, handler }