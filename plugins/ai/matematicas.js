import te from '../../src/lib/luffy-error.js'
import axios from 'axios'
import config from '../../config.js'

const pluginConfig = {
    name: 'matematicas',
    alias: ['mathgpt', 'math', 'mathsolver'],
    category: 'ai',
    description: 'IA para resolver problemas de matemáticas',
    usage: '.matematicas <problema>',
    example: '.matematicas ¿cuánto es 2+2?',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    carne: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const text = m.args.join(' ')

    if (!text) {
        return m.reply(`☽◯☾ ╭━ ♰ ✦ ♰ ━╮ ☽◯☾\n\n📐 *ᴍᴀᴛʜ ɢᴘᴛ*\n\n> Escribe el problema de matemáticas\n\n\`Ejemplo: ${m.prefix}matematicas ¿cuánto es 2+2?\`\n\n╰━ ⊱༺༒༻⊰ ━╯`)
    }

    m.react('🕕')

    try {
        const url = `https://api.nexray.eu.cc/ai/mathgpt?text=${encodeURIComponent(text)}`
        
        const { data } = await axios.get(url, {
            timeout: 30000,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
            }
        })

        if (!data.status || !data.result) {
            await m.react('❌')
            return m.reply("✧ ⚠️ No se pudo procesar el problema de matemáticas.")
        }

        const answer = data.result

        m.react('✅')
        await m.reply(`${answer}`)

    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }