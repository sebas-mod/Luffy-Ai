import { games } from '../../src/lib/luffy-games.js'

games.register('adivinar_pais', {
    alias: ['tn', 'guesscountry'],
    emoji: '🌍',
    title: 'ADIVINA EL PAÍS',
    description: 'Adivina el nombre del país'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('adivinar_pais')
export { pluginConfig as config, handler, answerHandler }
