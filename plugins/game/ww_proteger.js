import { nightActionHandler } from './werewolf.js'
import te from '../../src/lib/luffy-error.js'
const pluginConfig = {
    name: 'ww_proteger',
    alias: ['protect', 'guardian', 'wpr'],
    category: 'game',
    description: 'Acción nocturna del guardián - Proteger al objetivo',
    usage: '.ww_proteger <número>',
    example: '.ww_proteger 3',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: true,
    cooldown: 0,
    carne: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    try {
        return await nightActionHandler(m, { sock })
    } catch (error) {
        console.error('[WWPROTECT ERROR]', error)
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }