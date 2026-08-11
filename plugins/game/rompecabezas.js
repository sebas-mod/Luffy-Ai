import { games } from '../../src/lib/luffy-games.js'

games.register('rompecabezas', {
    alias: ['teka'],
    emoji: '🧩',
    title: 'ACERTIJOS',
    description: 'Juego de acertijos tradicional'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('rompecabezas')
export { pluginConfig as config, handler, answerHandler }
