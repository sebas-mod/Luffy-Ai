import { games } from '../../src/lib/ourin-games.js'

games.register('tebakkata', {
    alias: ['tk', 'guessword'],
    emoji: '📝',
    title: 'ADIVINA PALABRA',
    description: 'Adivina palabras por pistas'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('tebakkata')
export { pluginConfig as config, handler, answerHandler }
