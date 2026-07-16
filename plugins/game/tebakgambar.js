import { games } from '../../src/lib/ourin-games.js'

games.register('tebakgambar', {
    alias: ['tg', 'guessimage'],
    emoji: '🖼️',
    title: 'ADIVINA IMAGEN',
    description: 'Adivina palabras de imagenes',
    timeout: 90000,
    hasImage: true,
    questionField: null,
    hintCount: 3
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('tebakgambar')
export { pluginConfig as config, handler, answerHandler }
