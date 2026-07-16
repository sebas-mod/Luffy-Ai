const pluginConfig = {
    name: 'cekimut',
    alias: ['imut', 'cute'],
    category: 'cek',
    description: 'Mide qué tan lindo/a eres',
    usage: '.cekimut <nombre>',
    example: '.cekimut Ani',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m) {
        const percent = Math.floor(Math.random() * 101)
    const mentioned = m.mentionedJid[0] || m.sender
                    
    let desc = ''
    if (percent >= 90) {
        desc = '¡SÚPER LINDO/A! ¡Kawaii~~ 🥺💕'
    } else if (percent >= 70) {
        desc = '¡Demasiado lindo/a! 😍'
    } else if (percent >= 50) {
        desc = 'Bastante lindo/a~ 🌸'
    } else if (percent >= 30) {
        desc = 'Un poco lindo/a 😊'
    } else {
        desc = '¿Quizás cool en vez de lindo/a? 😎'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}

Tu nivel de ternura es *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Quieres medir el nivel de ternura de @${mentioned.split('@')[0]}?

Su nivel de ternura es del *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }