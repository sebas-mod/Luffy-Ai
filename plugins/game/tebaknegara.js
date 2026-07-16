import { games } from '../../src/lib/ourin-games.js'

games.register('tebaknegara', {
    alias: ['tn', 'guesscountry'],
    emoji: '🌍',
    title: 'ADIVINA PAIS',
    description: 'Adivina nombres de paises'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('tebaknegara')
export { pluginConfig as config, handler, answerHandler }
