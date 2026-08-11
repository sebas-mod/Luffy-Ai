import { games } from '../../src/lib/luffy-games.js'

games.register('adivinar_profesion', {
    alias: ['tp', 'guessjob'],
    emoji: '👨‍💼',
    title: 'ADIVINA LA PROFESIÓN',
    description: 'Adivina el nombre de la profesión'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('adivinar_profesion')
export { pluginConfig as config, handler, answerHandler }
