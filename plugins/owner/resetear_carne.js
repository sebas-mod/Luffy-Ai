import { getDatabase } from '../../src/lib/luffy-database.js'
import config from '../../config.js'
const pluginConfig = {
    name: 'resetear_carne',
    alias: ['defaultcarnereset'],
    category: 'owner',
    description: 'Reiniciar la carne predeterminada al config original',
    usage: '.resetcarnedefault',
    example: '.resetcarnedefault',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    carne: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const configDefault = config.carne?.default || 25
    
    db.setting('defaultCarne', null)
    
    await m.reply(
        `☽◯☾ ╭━ ♰ ✦ ÉXITO ♰ ━╮ ☽◯☾\n` +
        `┃ ✅ *ᴇxɪᴛᴏsᴏ*\n` +
        `╰━ ⊱༺༒༻⊰ ━╯\n\n` +
        `☽◯☾ ♰ Carne predeterminada reiniciada al config: \`${configDefault}\`\n` +
        `› Los nuevos usuarios obtendrán la carne del config`
    )
}

export { pluginConfig as config, handler }
