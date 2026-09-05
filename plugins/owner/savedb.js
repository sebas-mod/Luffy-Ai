import moment from 'moment-timezone'
import fs from 'fs'
import path from 'path'
import config from '../../config.js'
import te from '../../src/lib/luffy-error.js'
const pluginConfig = {
    name: 'savedb',
    alias: ['downloaddb', 'getdb'],
    category: 'owner',
    description: 'Descargar el archivo de la base de datos',
    usage: '.savedb',
    example: '.savedb',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 30,
    carne: 0,
    isEnabled: true
}
async function handler(m, { sock }) {
    if (!config.isOwner(m.sender)) {
        return m.reply('❌ *Solo Owner!*')
    }
    const dbPath = path.join(process.cwd(), 'database', 'db.json')
    if (!fs.existsSync(dbPath)) {
        return m.reply(`☽◯☾ ╭ ♰ ⚙️ SISTEMA ♰ ━╮ ☽◯☾\n┃ ❌ ¡El archivo de la base\n┃ de datos no existe! 📁\n╰━━━━━━━━╯`)
    }
    try {
        const stats = fs.statSync(dbPath)
        const data = fs.readFileSync(dbPath)
        const now = moment().tz('Asia/Jakarta')
        const timestamp = now.format('YYYY-MM-DD_HH-mm-ss')
        const fileName = `db_backup_${timestamp}.json`
        await sock.sendMessage(m.chat, {
            document: data,
            fileName: fileName,
            mimetype: 'application/json',
            caption: `📦 *ʀᴇsᴘᴀʟᴅᴏ ᴅᴇ ʟᴀ ʙᴀsᴇ ᴅᴇ ᴅᴀᴛᴏs*\n\n` +
                `☽◯☾ ♰ 「 📋 *ɪɴғᴏ* 」\n` +
                `┃ 📁 Archivo: \`db.json\`\n` +
                `┃ 📊 Tamaño: \`${(stats.size / 1024).toFixed(2)} KB\`\n` +
                `┃ 📅 Fecha: \`${now.format('DD/MM/YYYY')}\`\n` +
                `┃ ⏰ Hora: \`${now.format('HH:mm:ss')}\`\n` +
                `╰━ ⊱༺༒༻⊰ ━╯`
        }, { quoted: m })
    } catch (error) {
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}
export { pluginConfig as config, handler }