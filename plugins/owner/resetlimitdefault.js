import { getDatabase } from '../../src/lib/ourin-database.js'
import config from '../../config.js'
const pluginConfig = {
    name: 'resetlimitdefault',
    alias: ['defaultlimitreset'],
    category: 'owner',
    description: 'Restablece el límite predeterminado de la configuración',
    usage: '.resetlimitdefault',
    example: '.resetlimitdefault',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const configDefault = config.limits?.default || 25
    
    db.setting('defaultLimit', null)
    db.save()
    
    await m.reply(
        `✅ *ᴇxɪᴛᴏ*\n\n` +
        `> Default limit direset a config: \`${configDefault}\`\n` +
        `> User nuevo va a menpuede limit de config`
    )
}

export { pluginConfig as config, handler }
