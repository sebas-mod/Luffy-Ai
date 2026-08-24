import axios from 'axios'
import config from '../../config.js'
import te from '../../src/lib/luffy-error.js'
const pluginConfig = {
    name: 'dolphin',
    alias: ['dolphinai', 'dphn'],
    category: 'ai',
    description: 'Chat con Dolphin AI (Modelo 24B)',
    usage: '.dolphin <pregunta> o .dolphin --<plantilla> <pregunta>',
    example: '.dolphin explica sobre IA',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    carne: 1,
    isEnabled: true
}

const TEMPLATES = ['logical', 'creative', 'summarize', 'code-beginner', 'code-advanced']

async function dolphinAI(question, template = 'logical') {
    const { data } = await axios.post('https://chat.dphn.ai/api/chat', {
        messages: [{
            role: 'user',
            content: question
        }],
        model: 'dolphinserver:24B',
        template: template
    }, {
        headers: {
            origin: 'https://chat.dphn.ai',
            referer: 'https://chat.dphn.ai/',
            'user-agent': 'Mozilla/5.0 (Linux; Android 15; SM-F958 Build/AP3A.240905.015) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.86 Mobile Safari/537.36'
        }
    })
    
    const result = data.split('\n\n')
        .filter(line => line && line.startsWith('data: {'))
        .map(line => JSON.parse(line.substring(6)))
        .map(line => line.choices[0].delta.content)
        .join('')
    
    if (!result) throw new Error('No hubo respuesta de la IA')
    
    return result
}

async function handler(m, { sock }) {
    let text = m.text?.trim()
    
    if (!text) {
        return m.reply(
            `╭━━━〔 ✦ 〕━━━╮\n\n` +
            `🐬 *ᴅᴏʟᴘʜɪɴ ᴀɪ*\n\n` +
            `> Chat con el Dolphin AI 24B Model\n\n` +
            `╭┈┈⬡「 📋 *ᴘʟᴀɴᴛɪʟʟᴀs* 」\n` +
            `┃ • \`logical\` - Respuesta lógica\n` +
            `┃ • \`creative\` - Respuesta creativa\n` +
            `┃ • \`summarize\` - Resumen\n` +
            `┃ • \`code-beginner\` - Código para principiantes\n` +
            `┃ • \`code-advanced\` - Código avanzado\n` +
            `╰┈┈┈┈┈┈┈┈⬡\n\n` +
            `> *Ejemplo:*\n` +
            `> ${m.prefix}dolphin ¿qué es la IA?\n` +
            `> ${m.prefix}dolphin --creative crea un poema\n\n` +
            `╰━━━━━━━━━━━━╯`
        )
    }
    
    let template = 'logical'
    
    const templateMatch = text.match(/^--(\S+)\s+/)
    if (templateMatch) {
        const requestedTemplate = templateMatch[1].toLowerCase()
        if (TEMPLATES.includes(requestedTemplate)) {
            template = requestedTemplate
            text = text.replace(templateMatch[0], '').trim()
        }
    }
    
    if (!text) {
        return m.reply(`✧ ❌ ¡Escribe una pregunta!`)
    }
    
    await m.react('🕕')
    
    try {
        const result = await dolphinAI(text, template)
        await m.reply(result)
        
        await m.react('✅')
        
    } catch (error) {
        await m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }