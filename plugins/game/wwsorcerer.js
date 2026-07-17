import { nightActionHandler } from './werewolf.js'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'wwsorcerer',
    alias: ['sorcerer', 'wws'],
    category: 'game',
    description: 'Acción nocturna del Hechicero - Verificar si el objetivo es el Vidente',
    usage: '.wwsorcerer <numero>',
    example: '.wwsorcerer 3',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: true,
    cooldown: 0,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    try {
        return await nightActionHandler(m, { sock })
    } catch (error) {
        console.error('[WWSORCERER ERROR]', error)
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }