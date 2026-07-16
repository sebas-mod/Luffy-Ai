import { games } from '../../src/lib/ourin-games.js'

games.register('tebaklirik', {
    alias: ['letra'],
    emoji: '🎤',
    title: 'ADIVINA LETRA',
    description: 'Adivina la letra de canciones'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('tebaklirik')
export { pluginConfig as config, handler, answerHandler }
