import { games } from '../../src/lib/luffy-games.js'

games.register('kataacak', {
    alias: ['ka', 'acakkata'],
    emoji: '🔤',
    title: 'PALABRAS DESORDENADAS',
    description: 'Ordena letras desordenadas'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('kataacak')
export { pluginConfig as config, handler, answerHandler }
