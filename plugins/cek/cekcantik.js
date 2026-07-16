const pluginConfig = {
    name: 'cekcantik',
    alias: ['cantik', 'beautiful'],
    category: 'cek',
    description: 'Mide qué tan hermosa eres',
    usage: '.cekcantik <nombre>',
    example: '.cekcantik Ani',
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
        desc = '¡Hermosa como un ángel! 👸✨'
    } else if (percent >= 70) {
        desc = '¡Muy hermosa! 💕'
    } else if (percent >= 50) {
        desc = 'Dulce y hermosa~ 🌸'
    } else if (percent >= 30) {
        desc = 'Bastante hermosa 😊'
    } else {
        desc = '¡Sigues siendo hermosa! 💖'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}

Tu nivel de belleza es *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Quieres medir el nivel de belleza de @${mentioned.split('@')[0]}?

Su nivel de belleza es del *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }