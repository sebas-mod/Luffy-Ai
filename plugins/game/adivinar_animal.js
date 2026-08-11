import { games } from '../../src/lib/luffy-games.js'

games.register('adivinar_animal', {
    alias: ['th', 'guessanimal'],
    emoji: '🐾',
    title: 'ADIVINA EL ANIMAL',
    description: 'Adivina el nombre del animal',
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('adivinar_animal')
export { pluginConfig as config, handler, answerHandler }