import { games } from '../../src/lib/luffy-games.js'

games.register('adivinar_drama', {
    alias: ['drakor', 'kdrama'],
    emoji: '🇰🇷',
    title: 'ADIVINA EL DRAMA',
    description: 'Adivina el título del drama coreano',
    hasImage: true
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('adivinar_drama')
export { pluginConfig as config, handler, answerHandler }
