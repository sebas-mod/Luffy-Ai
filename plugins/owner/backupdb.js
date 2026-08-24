import { sendStoreBackup, SCHEMA_VERSION } from '../../src/lib/luffy-store-backup.js'
const pluginConfig = {
    name: 'backupdb',
    alias: ['dbbackup', 'backupstore', 'storebackup'],
    category: 'owner',
    description: 'Hacer backup de la base de datos/tienda y enviarlo al capitán',
    usage: '.backupdb',
    isOwner: true,
    isGroup: false,
    isEnabled: true
}

async function handler(m, { sock }) {
    const backupContents = [
        '📁 database/*.json (todos los archivos JSON)',
        '📄 storage/database.json (base de datos principal)',
        '📄 db.json (base de datos raíz)',
        '📄 database/main/*.json (base de datos principal)',
        '📋 backup_metadata.json (info del schema)'
    ]
    
    await m.reply(
        `🕕 *Creando backup de la base de datos...*\n\n` +
        `╭┈┈⬡「 📦 *ʟᴏ ǫᴜᴇ sᴇ ʀᴇsᴘᴀʟᴅᴀ* 」\n` +
        backupContents.map(c => `┃ ${c}`).join('\n') +
        `\n╰┈┈┈┈┈┈┈┈⬡`
    )
    
    const result = await sendStoreBackup(sock)
    
    if (result.success) {
        await m.reply(
            `✅ *¡Backup exitoso!*\n\n` +
            `📦 Tamaño: ${result.size}\n` +
            `📁 Archivos: ${result.files}\n` +
            `🔖 Schema: v${SCHEMA_VERSION}\n\n` +
            `> Backup type-safe, compatible con futuras actualizaciones.\n` +
            `> El backup fue enviado al capitán principal.`
        )
    } else {
        await m.reply(`╰┈➤ ❌ Backup fallido: ${result.error}`)
    }
}

export { pluginConfig as config, handler }
