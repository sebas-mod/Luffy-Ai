import { getDatabase } from '../../src/lib/luffy-database.js'
const pluginConfig = {
    name: 'eliminar_datos',
    alias: ['resetdata', 'cleardata', 'wipedata'],
    category: 'owner',
    description: 'Restablecer todos los datos de la base de datos al predeterminado',
    usage: '.hapusdata',
    example: '.hapusdata',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 30,
    carne: 0,
    isEnabled: true
}

const pendingReset = new Map()

async function handler(m, { sock }) {
    const args = m.text

    if (args === 'si' || args === 'yes' || args === 'confirm') {
        const pending = pendingReset.get(m.sender)
        if (!pending || Date.now() - pending > 60000) {
            pendingReset.delete(m.sender)
            return m.reply(`👑•─────•👑\n❌ No hay una solicitud de reinicio activa.\n\n> Escribe \`${m.prefix}eliminar_datos\` primero\n♰ ──────── ♱✦`)
        }

        pendingReset.delete(m.sender)
        await m.react('🕕')

        const db = getDatabase()
        const result = db.resetToDefaults()

        await m.react('✅')

        await sock.sendMessage(m.chat, {
            text:
                `🗑️ *ᴅᴀᴛᴏs ʀᴇɪɴɪᴄɪᴀᴅᴏs*\n\n` +
                `> 📁 Archivos reiniciados: *${result.resetCount}/${result.total}*\n` +
                `> 💾 Backup: \`${result.backupFolder}/\`\n\n` +
                `Todos los datos han sido restaurados al valor predeterminado.\n\n` +
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
        { key: 'sewa', label: '🏪 Renta' },
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
        return m.reply(`☽◯☾ ♰ ❌ No se encontraron datos en la base de datos`)
    }

    pendingReset.set(m.sender, Date.now())

    let txt = `⚠️ *ᴀᴅᴠᴇʀᴛᴇɴᴄɪᴀ — ʙᴏʀʀᴀʀ ᴅᴀᴛᴏs*\n\n`
    txt += `Esta acción eliminará *TODOS* los siguientes datos:\n\n`

    for (const { label, entries, size } of existing) {
        txt += `> ${label}: *${entries}* datos (${size})\n`
    }

    txt += `\n> 📦 Total: *${(totalSize / 1024).toFixed(1)} KB*\n`
    txt += `> 💾 Se creará una copia de seguridad automática antes del reinicio\n\n`
    txt += `Escribe \`${m.prefix}eliminar_datos si\` dentro de 60 segundos para continuar.`

    await sock.sendMessage(m.chat, {
        text: txt,
        interactiveButtons: [
            {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                    display_text: '✅ Sí, Borrar Todo',
                    id: `${m.prefix}eliminar_datos si`
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
