import { games } from '../../src/lib/luffy-games.js'

games.register('ordenar_palabras', {
    alias: ['susun', 'scramble'],
    emoji: '🔠',
    title: 'ORGANIZAR PALABRAS',
    description: 'Forma palabras con las letras'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('ordenar_palabras')
export { pluginConfig as config, handler, answerHandler }
