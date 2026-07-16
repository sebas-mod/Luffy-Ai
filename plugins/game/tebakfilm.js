import { games } from '../../src/lib/ourin-games.js'

games.register('tebakfilm', {
    alias: ['tf', 'guessmovie'],
    emoji: '🎬',
    title: 'ADIVINA PELICULA',
    description: 'Adivina titulos de peliculas'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('tebakfilm')
export { pluginConfig as config, handler, answerHandler }
