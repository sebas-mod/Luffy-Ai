import { games } from '../../src/lib/ourin-games.js'

games.register('tebaktebakan', {
    alias: ['tbt', 'tebak2an', 'receh'],
    emoji: '😄',
    title: 'ACERTIJOS',
    description: 'Acertijos graciosos'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('tebaktebakan')
export { pluginConfig as config, handler, answerHandler }
