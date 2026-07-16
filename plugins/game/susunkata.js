import { games } from '../../src/lib/ourin-games.js'

games.register('susunkata', {
    alias: ['susun', 'scramble'],
    emoji: '🔠',
    title: 'FORMAR PALABRAS',
    description: 'Forma palabras con letras'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('susunkata')
export { pluginConfig as config, handler, answerHandler }
