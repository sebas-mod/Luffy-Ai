import { games } from '../../src/lib/ourin-games.js'

games.register('tebakbendera', {
    alias: ['tbendera', 'flag'],
    emoji: '🏳️',
    title: 'ADIVINA BANDERA',
    description: 'Adivina el pais por la bandera',
    dataFile: 'tebakbendera2.json',
    answerField: 'name',
    hasImage: true
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('tebakbendera')
export { pluginConfig as config, handler, answerHandler }
