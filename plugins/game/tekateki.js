import { games } from '../../src/lib/luffy-games.js'

games.register('tekateki', {
    alias: ['teka'],
    emoji: '🧩',
    title: 'ACERTIJOS',
    description: 'Juego de acertijos tradicional'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('tekateki')
export { pluginConfig as config, handler, answerHandler }
