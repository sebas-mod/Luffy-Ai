import { getDatabase } from '../../src/lib/luffy-database.js'
import config from '../../config.js'
const pluginConfig = {
    name: ['disablecarne', 'enablecarne'],
    alias: ['offcarne', 'oncarne'],
    category: 'owner',
    description: 'Activar/desactivar el sistema de carne',
    usage: '.disablecarne o .enablecarne',
    example: '.disablecarne',
    isOwner: true,
    cooldown: 5,
    carne: 0,
    isEnabled: true
}

async function handler(m) {
    const db = getDatabase()
    const cmd = m.command.toLowerCase()
    const isEnable = ['enablecarne', 'oncarne'].includes(cmd)

    db.setting('carne', isEnable)
    db.save()

    await m.react(isEnable ? '⚡' : '🔌')
    return m.reply(
        isEnable
            ? '⚡ *sɪsᴛᴇᴍᴀ ᴅᴇ ᴇɴᴇʀɢɪ́ᴀ ᴀᴄᴛɪᴠᴀᴅᴏ* ✅\n\n' +
              '╭━〔 ⚙️ SISTEMA 〕━╮\n' +
              '┃ Cada comando ahora requiere energía.\n' +
              '╰━━━━━━━━╯'
            : '🔌 *sɪsᴛᴇᴍᴀ ᴅᴇ ᴇɴᴇʀɢɪ́ᴀ ᴅᴇsᴀᴄᴛɪᴠᴀᴅᴏ* ❌\n\n' +
              '╭━〔 ⚙️ SISTEMA 〕━╮\n' +
              '┃ Los comandos ya no requieren energía.\n' +
              '╰━━━━━━━━╯'
    )
}

export { pluginConfig as config, handler }