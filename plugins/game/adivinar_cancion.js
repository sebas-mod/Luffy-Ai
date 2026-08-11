import { games } from '../../src/lib/luffy-games.js'

games.register('adivinar_cancion', {
    alias: ['tl', 'guesssong'],
    emoji: '🎵',
    title: 'ADIVINA LA CANCIÓN',
    description: 'Adivina el título de la canción'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('adivinar_cancion')
export { pluginConfig as config, handler, answerHandler }
