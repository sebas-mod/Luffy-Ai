import { getDatabase } from '../../src/lib/luffy-database.js'
import {
    generateActivationCode,
    parseActivationInput,
    saveCodes,
    getCodes,
    formatDurationLabel,
    formatDateEs,
} from '../../src/lib/luffy-activation.js'

const pluginConfig = {
    name: 'nuevocodigo',
    alias: ["generarcodigo", "crearcodigo", "codegen"],
    category: 'owner',
    description: 'Generar un código de activación del bot por días o meses',
    usage: '.nuevocodigo <cantidad> <dias|meses> [codigo_opcional]',
    example: '.nuevocodigo 30 dias / .nuevocodigo 2 meses / .nuevocodigo 1m ABC123',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    carne: 0,
    isEnabled: true,
}

function buildHelp(m) {
    return `👑•─────•👑\n🎟️ *NUEVO CÓDIGO DE ACTIVACIÓN*\n\n` +
        `> Genera un código que el usuario canjea en su grupo con *${m.prefix}activarbot*\n\n` +
        `*FORMATO:*\n` +
        `• *${m.prefix}nuevocodigo <cantidad> <dias|meses>*\n` +
        `• *${m.prefix}nuevocodigo <cantidad> <dias|meses> <código personalizado>*\n\n` +
        `*EJEMPLOS:*\n` +
        `• ${m.prefix}nuevocodigo 7 dias\n` +
        `• ${m.prefix}nuevocodigo 2 meses\n` +
        `• ${m.prefix}nuevocodigo 1m VIP12345\n` +
        `• ${m.prefix}nuevocodigo 30\n` +
        `• ${m.prefix}nuevocodigo lifetime\n\n` +
        `💡 *1 mes = 30 días*\n` +
        `💡 Si no pasas un código, se genera uno aleatorio\n` +
        `♰ ──────── ♱`
}

function handler(m) {
    const db = getDatabase()

    if (m.args.length < 1) {
        m.react('❌')
        return m.reply(buildHelp(m))
    }

    const input = m.args.join(' ')

    // El último argumento puede ser el código personalizado (alfanumérico)
    let customCode = null
    let durStr = input
    const parts = input.trim().split(/\s+/)
    const last = parts[parts.length - 1]
    if (parts.length >= 2 && /^[A-Za-z0-9]{3,20}$/.test(last)) {
        customCode = last.toUpperCase()
        durStr = parts.slice(0, -1).join(' ')
    }

    const dur = parseActivationInput(durStr)
    if (!dur) {
        m.react('❌')
        return m.reply(buildHelp(m))
    }

    const codes = getCodes(db)

    let code = customCode
    if (code) {
        if (codes[code]) {
            return m.reply(`☽◯☾ ♰ ❌ El código \`${code}\` ya existe. Usa otro.`)
        }
    } else {
        do {
            code = generateActivationCode(6)
        } while (codes[code])
    }

    codes[code] = {
        duration: { value: dur.value, unit: dur.unit },
        durationLabel: dur.label,
        createdAt: Date.now(),
        createdBy: m.sender,
        used: false,
        usedBy: null,
        usedAt: null,
        groupId: null,
        groupName: null,
    }
    saveCodes(db, codes)

    const endPreview = formatDateEs(Date.now() + (dur.value === Infinity ? 0 : dur.value * (dur.unit === 'h' ? 3600000 : dur.unit === 'd' ? 86400000 : 2592000000)))

    m.react('✅')
    return m.reply(
        `👑•─────•👑\n🎟️ *CÓDIGO GENERADO*\n\n` +
        `🆔 Código: *\`${code}\`*\n` +
        `⏳ Duración: *${formatDurationLabel(dur)}*\n` +
        `📅 Previsualización del fin: ${endPreview}\n\n` +
        `_Envíale este código al usuario. Lo canjea en su grupo con_\n_\`${m.prefix}activarbot ${code}\`_\n` +
        `♰ ──────── ♱`
    )
}

export { pluginConfig as config, handler }