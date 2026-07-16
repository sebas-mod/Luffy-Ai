import { games } from '../../src/lib/ourin-games.js'

games.register('asahotak', {
    alias: ['asah', 'quiz'],
    emoji: '🧠',
    title: 'ENTRENAMIENTO CEREBRAL',
    description: 'Juego de entrenamiento cerebral - adivina respuestas'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('asahotak')
export { pluginConfig as config, handler, answerHandler }
