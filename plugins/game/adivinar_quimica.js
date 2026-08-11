import { games } from '../../src/lib/luffy-games.js'

games.register('adivinar_quimica', {
    alias: ['kimia', 'chemistry', 'unsur'],
    emoji: '🧪',
    title: 'ADIVINA LA QUÍMICA',
    description: 'Adivina el elemento químico',
    questionField: 'unsur',
    answerField: 'lambang'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('adivinar_quimica')
export { pluginConfig as config, handler, answerHandler }
