import { nightActionHandler } from './werewolf.js'
const pluginConfig = {
    name: 'ww_hechicero',
    alias: ['sorcerer', 'wws'],
    category: 'game',
    description: 'Acción nocturna del hechicero - Comprobar si el objetivo es el Vidente',
    usage: '.wwsorcerer <número>',
    example: '.wwsorcerer 3',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: true,
    cooldown: 0,
    carne: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    return await nightActionHandler(m, { sock })
}

export { pluginConfig as config, handler }