import { games } from '../../src/lib/ourin-games.js'

games.register('tebakmakanan', {
    alias: ['makanan', 'food'],
    emoji: '🍲',
    title: 'ADIVINA COMIDA',
    description: 'Adivina nombres de comidas',
    hasImage: true
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('tebakmakanan')
export { pluginConfig as config, handler, answerHandler }
