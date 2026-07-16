import { games } from '../../src/lib/ourin-games.js'

games.register('tebaklagu', {
    alias: ['tl', 'guesssong'],
    emoji: '🎵',
    title: 'ADIVINA CANCION',
    description: 'Adivina titulos de canciones'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('tebaklagu')
export { pluginConfig as config, handler, answerHandler }
