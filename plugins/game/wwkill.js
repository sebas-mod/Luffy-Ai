import { nightActionHandler } from './werewolf.js'
import te from '../../src/lib/luffy-error.js'
const pluginConfig = {
    name: 'wwkill',
    alias: ['wolfkill', 'wk'],
    category: 'game',
    description: 'Acción nocturna del hombre lobo - Matar al objetivo',
    usage: '.wwkill <número>',
    example: '.wwkill 2',
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
        console.error('[WWKILL ERROR]', error)
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }