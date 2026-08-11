import { games } from '../../src/lib/luffy-games.js'

games.register('acertijo', {
    alias: ['asah', 'quiz'],
    emoji: '🧠',
    title: 'AGUDIZA MENTAL',
    description: 'Juego de ingenio - adivina la respuesta'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('acertijo')
export { pluginConfig as config, handler, answerHandler }
