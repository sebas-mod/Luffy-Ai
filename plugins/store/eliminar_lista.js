import { getDatabase } from '../../src/lib/luffy-database.js'

const pluginConfig = {
    name: 'eliminar_lista',
    alias: ['dellist', 'deletelist'],
    category: 'store',
    description: '🗑️ Eliminar información de la tienda',
    usage: '.hapuslist <numero>',
    example: '.hapuslist 1',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    carne: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const lists = db.setting('storeLists') || []

    if (lists.length === 0) {
        return m.reply(`📭 *Aún no hay información.*\n\nAgrega primero información: \`${m.prefix}agregar_lista\` ➕`)
    }

    const idx = parseInt(m.text?.trim()) - 1

    if (isNaN(idx) || idx < 0 || idx >= lists.length) {
        let txt = `🗑️ *Elige la Información a Eliminar*\n\nEscribe \`${m.prefix}eliminar_lista <numero>\`\n\n`
        for (let i = 0; i < lists.length; i++) {
            const l = lists[i]
            const mediaIcon = l.image ? '🖼️' : l.video ? '🎬' : '📝'
            txt += `${mediaIcon} *${i + 1}.* ${l.name}\n`
        }
        return m.reply(txt)
    }

    const deleted = lists.splice(idx, 1)[0]
    db.setting('storeLists', lists)

    await m.react('✅')
    return m.reply(
        `🗑️ *INFORMACIÓN ELIMINADA*\n\n` +
        `🏷️ Nombre: *${deleted.name}*\n\n` +
        `⚠️ _La información fue eliminada permanentemente y no se puede recuperar._`
    )
}

export { pluginConfig as config, handler }
