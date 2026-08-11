import { games } from '../../src/lib/luffy-games.js'

games.register('adivinar_bandera', {
    alias: ['tbendera', 'flag'],
    emoji: '🏳️',
    title: 'ADIVINA LA BANDERA',
    description: 'Adivina el país por su bandera',
    dataFile: 'adivinar_bandera.json',
    answerField: 'name',
    hasImage: true
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('adivinar_bandera')
export { pluginConfig as config, handler, answerHandler }
