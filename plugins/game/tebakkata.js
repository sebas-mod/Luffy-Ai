import { games } from '../../src/lib/luffy-games.js'

games.register('tebakkata', {
    alias: ['tk', 'guessword'],
    emoji: '📝',
    title: 'ADIVINA LA PALABRA',
    description: 'Adivina la palabra por las pistas'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('tebakkata')
export { pluginConfig as config, handler, answerHandler }
