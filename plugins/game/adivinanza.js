import { games } from '../../src/lib/luffy-games.js'

games.register('adivinanza', {
    alias: ['tbt', 'tebak2an', 'receh'],
    emoji: '😄',
    title: 'ADIVINANZAS',
    description: 'Adivinanzas divertidas'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('adivinanza')
export { pluginConfig as config, handler, answerHandler }
