import { games } from '../../src/lib/luffy-games.js'

games.register('riddle', {
    alias: ['rd', 'tebaktebak', 'riddles'],
    emoji: '❓',
    title: 'ACERTIJO',
    description: 'Acertijo/adivinanzas'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('riddle')
export { pluginConfig as config, handler, answerHandler }
