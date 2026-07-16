import { games } from '../../src/lib/ourin-games.js'

games.register('tebakkalimat', {
    alias: ['tkl', 'peribahasa'],
    emoji: '📖',
    title: 'ADIVINA FRASE',
    description: 'Adivina frases o proverbios'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('tebakkalimat')
export { pluginConfig as config, handler, answerHandler }
