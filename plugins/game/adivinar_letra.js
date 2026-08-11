import { games } from '../../src/lib/luffy-games.js'

games.register('adivinar_letra', {
    alias: [],
    emoji: '🎤',
    title: 'ADIVINA LA LETRA',
    description: 'Adivina la letra de la canción'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('adivinar_letra')
export { pluginConfig as config, handler, answerHandler }
