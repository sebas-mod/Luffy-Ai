import { games } from '../../src/lib/luffy-games.js'

games.register('adivinar_pelicula', {
    alias: ['tf', 'guessmovie'],
    emoji: '🎬',
    title: 'ADIVINA LA PELÍCULA',
    description: 'Adivina el título de la película'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('adivinar_pelicula')
export { pluginConfig as config, handler, answerHandler }
