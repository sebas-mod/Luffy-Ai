import { games } from '../../src/lib/luffy-games.js'

games.register('adivinar_frase', {
    alias: ['tkl', 'peribahasa'],
    emoji: '📖',
    title: 'ADIVINA LA FRASE',
    description: 'Adivina la frase o el refrán'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('adivinar_frase')
export { pluginConfig as config, handler, answerHandler }
