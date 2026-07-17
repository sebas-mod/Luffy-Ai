import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'hapusdata',
    alias: ['resetdata', 'cleardata', 'wipedata'],
    category: 'owner',
    description: 'Restablece todos los datos de la base de datos',
    usage: '.hapusdata',
    example: '.hapusdata',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 30,
    energi: 0,
    isEnabled: true
}

const pendingReset = new Map()

async function handler(m, { sock }) {
    const args = m.text

    if (args === 'ya' || args === 'yes' || args === 'confirm') {
        const pending = pendingReset.get(m.sender)
        if (!pending || Date.now() - pending > 60000) {
            pendingReset.delete(m.sender)
            return m.reply(`❌ No hay solicitud de reinicio activa.\n\n> Escribe \`${m.prefix}hapusdata\` primero`)
        }

        pendingReset.delete(m.sender)
        await m.react('🕕')

        const db = getDatabase()
        const result = db.resetToDefaults()

        await m.react('✅')

        await sock.sendMessage(m.chat, {
            text:
                `🗑️ *ᴅᴀᴛᴀ ᴅɪʀᴇsᴇᴛ*\n\n` +
                `> 📁 File reiniciado: *${result.resetCount}/${result.total}*\n` +
                `> 💾 Backup: \`${result.backupFolder}/\`\n\n` +
                `Todos los datos han sido restaurados a los valores predeterminados.\n\n` +
                `> ⚠️ Reinicia el bot para asegurar que los datos estén sincronizados`
        }, { quoted: m })
        return
    }

    const db = getDatabase()
    const dbPath = db.dbPath
    const fileMap = [
        { key: 'users', label: '👥 Users' },
        { key: 'groups', label: '👥 Groups' },
        { key: 'settings', label: '⚙️ Settings' },
        { key: 'stats', label: '📊 Stats' },
        { key: 'sewa', label: '🏪 Sewa' },
        { key: 'premium', label: '⭐ Premium' },
        { key: 'owner', label: '👑 Owner' },
        { key: 'partner', label: '🤝 Partner' },
    ]

    const existing = []
    let totalSize = 0

    for (const { key, label } of fileMap) {
        const data = db.db.data[key]
        if (!data) continue
        const entries = Array.isArray(data) ? data.length : Object.keys(data).length
        const size = Buffer.byteLength(JSON.stringify(data))
        totalSize += size
        existing.push({ label, key, entries, size: `${(size / 1024).toFixed(1)} KB` })
    }

    if (existing.length === 0) {
        return m.reply(`❌ No hay data database encontrado`)
    }

    pendingReset.set(m.sender, Date.now())

    let txt = `⚠️ *ᴘᴇʀɪɴɢᴀᴛᴀɴ — ʜᴀᴘᴜs ᴅᴀᴛᴀ*\n\n`
    txt += `Esta acción eliminará *TODOS* los siguientes datos:\n\n`

    for (const { label, entries, size } of existing) {
        txt += `> ${label}: *${entries}* data (${size})\n`
    }

    txt += `\n> 📦 Total: *${(totalSize / 1024).toFixed(1)} KB*\n`
    txt += `> 💾 Copia de seguridad creada automáticamente antes del reinicio\n\n`
    txt += `Escribe \`${m.prefix}hapusdata ya\` en 60 segundos para continuar.`

    await sock.sendMessage(m.chat, {
        text: txt,
        interactiveButtons: [
            {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                    display_text: '✅ Sí, Eliminar Todo',
                    id: `${m.prefix}hapusdata ya`
                })
            },
            {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                    display_text: '❌ Cancelar',
                    id: `${m.prefix}menu`
                })
            }
        ]
    }, { quoted: m })

    setTimeout(() => { pendingReset.delete(m.sender) }, 60000)
}

export { pluginConfig as config, handler }
