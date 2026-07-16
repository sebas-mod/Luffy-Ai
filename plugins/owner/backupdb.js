import { sendStoreBackup, SCHEMA_VERSION } from '../../src/lib/ourin-store-backup.js'
const pluginConfig = {
    name: 'backupdb',
    alias: ['dbbackup', 'backupstore', 'storebackup'],
    category: 'owner',
    description: 'Crea una copia de la base de datos y la envía al dueño',
    usage: '.backupdb',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const backupContents = [
        '📁 database/*.json (todos file JSON)',
        '📁 database/cpanel/* (data cPanel)',
        '📄 storage/database.json (main database)',
        '📄 db.json (root database)',
        '📄 database/main/*.json (main database)',
        '📋 backup_methayta.json (info schema)'
    ]
    
    await m.reply(
        `🕕 *Creando backup database...*\n\n` +
        `╭┈┈⬡「 📦 *ᴀᴘᴀ ʏᴀɴɢ ᴅɪ-ʙᴀᴄᴋᴜᴘ* 」\n` +
        backupContents.map(c => `┃ ${c}`).join('\n') +
        `\n╰┈┈┈┈┈┈┈┈⬡`
    )
    
    const result = await sendStoreBackup(sock)
    
    if (result.success) {
        await m.reply(
            `✅ *Backup Éxito!*\n\n` +
            `📦 Size: ${result.size}\n` +
            `📁 Files: ${result.files}\n` +
            `🔖 Schema: v${SCHEMA_VERSION}\n\n` +
            `> Type-safe backup, kompatibel con update mendatang.\n` +
            `> Backup ha dienvía a owner utama.`
        )
    } else {
        await m.reply(`❌ Backup fallo: ${result.error}`)
    }
}

export { pluginConfig as config, handler }
