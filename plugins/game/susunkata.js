import { games } from '../../src/lib/luffy-games.js'

games.register('susunkata', {
    alias: ['susun', 'scramble'],
    emoji: '🔠',
    title: 'ORGANIZAR PALABRAS',
    description: 'Forma palabras con las letras'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('susunkata')
export { pluginConfig as config, handler, answerHandler }
