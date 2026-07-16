import { games } from '../../src/lib/ourin-games.js'

games.register('tebakhewan', {
    alias: ['th', 'guessanimal'],
    emoji: '🐾',
    title: 'ADIVINA ANIMAL',
    description: 'Adivina nombres de animales',
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('tebakhewan')
export { pluginConfig as config, handler, answerHandler }