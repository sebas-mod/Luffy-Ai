import { games } from '../../src/lib/luffy-games.js'

games.register('adivinar_palabra', {
    alias: ['tk', 'guessword'],
    emoji: '📝',
    title: 'ADIVINA LA PALABRA',
    description: 'Adivina la palabra por las pistas'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('adivinar_palabra')
export { pluginConfig as config, handler, answerHandler }
