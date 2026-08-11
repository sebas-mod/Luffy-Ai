import { games } from '../../src/lib/luffy-games.js'

games.register('palabra_azar', {
    alias: ["ka"],
    emoji: '🔤',
    title: 'PALABRAS DESORDENADAS',
    description: 'Ordena letras desordenadas'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('palabra_azar')
export { pluginConfig as config, handler, answerHandler }
