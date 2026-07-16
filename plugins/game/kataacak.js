import { games } from '../../src/lib/ourin-games.js'

games.register('kataacak', {
    alias: ['ka', 'acakkata'],
    emoji: '🔤',
    title: 'PALABRAS ALEATORIAS',
    description: 'Forma palabras con letras aleatorias'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('kataacak')
export { pluginConfig as config, handler, answerHandler }
