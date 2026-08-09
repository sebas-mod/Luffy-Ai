import { games } from '../../src/lib/luffy-games.js'

games.register('siapakahaku', {
    alias: ['siapa', 'whoami'],
    emoji: '🎭',
    title: 'QUIÉN SOY',
    description: 'Adivina a partir de la descripción'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('siapakahaku')
export { pluginConfig as config, handler, answerHandler }
