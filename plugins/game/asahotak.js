import { games } from '../../src/lib/luffy-games.js'

games.register('asahotak', {
    alias: ['asah', 'quiz'],
    emoji: '🧠',
    title: 'AGUDIZA MENTAL',
    description: 'Juego de ingenio - adivina la respuesta'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('asahotak')
export { pluginConfig as config, handler, answerHandler }
