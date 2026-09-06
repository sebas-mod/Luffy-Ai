import { getDatabase } from '../../src/lib/luffy-database.js'
import { getCodes, formatDurationLabel, formatDateEs } from '../../src/lib/luffy-activation.js'

const pluginConfig = {
    name: 'listacodigos',
    alias: ["codigos", "lscodigos", "vercodigos"],
    category: 'owner',
    description: 'Ver la lista de códigos de activación generados',
    usage: '.listacodigos',
    example: '.listacodigos',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    carne: 0,
    isEnabled: true,
}

function handler(m) {
    const db = getDatabase()
    const codes = getCodes(db)
    const entries = Object.entries(codes)

    if (entries.length === 0) {
        m.react('❌')
        return m.reply(
            `👑•─────•👑\n🎟️ *LISTA DE CÓDIGOS*\n\n` +
            `Aún no hay códigos generados.\n\n` +
            `Genera uno con: *${m.prefix}nuevocodigo <cantidad> <dias|meses>*\n` +
            `♰ ──────── ♱`
        )
    }

    const used = entries.filter(([, c]) => c.used)
    const available = entries.filter(([, c]) => !c.used)

    let text = `👑•─────•👑\n🎟️ *LISTA DE CÓDIGOS*\n\n`
    text += `Total: *${entries.length}* (${available.length} disponibles · ${used.length} usados)\n\n`

    const sorted = entries.sort((a, b) => (b[1].createdAt || 0) - (a[1].createdAt || 0))
    for (const [code, c] of sorted) {
        const status = c.used ? '✅' : '🟢'
        text += `${status} *\`${code}\`*\n`
        text += `   ⏳ ${formatDurationLabel(c.duration)}\n`
        text += `   📅 Creado: ${formatDateEs(c.createdAt)}\n`
        if (c.used) {
            text += `   🏠 Usado en: *${c.groupName || 'desconocido'}*\n`
            text += `   📆 Canjeado: ${formatDateEs(c.usedAt)}\n`
        } else {
            text += `   📌 Estado: Disponible\n`
        }
        text += `\n`
    }

    text += `*ACCIONES:*\n`
    text += `• *${m.prefix}nuevocodigo <cantidad> <dias|meses>* — Generar\n`
    text += `• *${m.prefix}eliminarcodigo <codigo>* — Eliminar\n`
    text += `♰ ──────── ♱`

    return m.reply(text)
}

export { pluginConfig as config, handler }