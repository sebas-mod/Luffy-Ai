import { getDatabase } from '../../src/lib/luffy-database.js'
import { getCodes, saveCodes } from '../../src/lib/luffy-activation.js'

const pluginConfig = {
    name: 'eliminarcodigo',
    alias: ["deletecode", "borrarcodigo", "eliminarcodigobot"],
    category: 'owner',
    description: 'Eliminar un código de activación',
    usage: '.eliminarcodigo <codigo>',
    example: '.eliminarcodigo ABC123',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    carne: 0,
    isEnabled: true,
}

function handler(m) {
    const db = getDatabase()

    if (m.args.length < 1) {
        m.react('❌')
        return m.reply(
            `👑•─────•👑\n🗑️ *ELIMINAR CÓDIGO*\n\n` +
            `Formato: *${m.prefix}eliminarcodigo <codigo>*\n\n` +
            `*EJEMPLO:*\n` +
            `• ${m.prefix}eliminarcodigo ABC123\n\n` +
            `💡 Usa *${m.prefix}listacodigos* para ver los códigos\n` +
            `♰ ──────── ♱`
        )
    }

    const code = m.args[0].toUpperCase()
    const codes = getCodes(db)

    if (!codes[code]) {
        m.react('❌')
        return m.reply(`☽◯☾ ♰ ❌ El código \`${code}\` no existe.`)
    }

    const wasUsed = codes[code].used
    const groupName = codes[code].groupName || null
    delete codes[code]
    saveCodes(db, codes)

    m.react('✅')
    let text = `👑•─────•👑\n🗑️ *CÓDIGO ELIMINADO*\n\n`
    text += `🆔 Código: *\`${code}\`*\n`
    if (wasUsed) {
        text += `⚠️ Este código ya había sido canjeado en *${groupName || 'un grupo'}*.\n`
        text += `_La activación de ese grupo sigue vigente hasta su vencimiento._\n`
    } else {
        text += `El código estaba disponible y ya no podrá usarse.\n`
    }
    text += `♰ ──────── ♱`
    return m.reply(text)
}

export { pluginConfig as config, handler }