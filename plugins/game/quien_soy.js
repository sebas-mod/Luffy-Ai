import { games } from '../../src/lib/luffy-games.js'

games.register('quien_soy', {
    alias: ["quien", "whoami"],
    emoji: '🎭',
    title: 'QUIÉN SOY',
    description: 'Adivina a partir de la descripción'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('quien_soy')
export { pluginConfig as config, handler, answerHandler }
