import { games } from '../../src/lib/luffy-games.js'

games.register('adivinar_epep', {
    alias: ['tebakff', 'tebakfreefire'],
    emoji: '🔫',
    title: 'ADIVINA EL EPEP',
    description: 'Adivina el personaje de Free Fire',
    hasImage: true
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('adivinar_epep')
export { pluginConfig as config, handler, answerHandler }