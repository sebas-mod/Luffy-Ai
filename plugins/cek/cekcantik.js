const pluginConfig = {
    name: 'cekcantik',
    alias: ['cantik', 'beautiful'],
    category: 'cek',
    description: 'Comprueba cuán hermosa eres',
    usage: '.cekcantik <nombre>',
    example: '.cekcantik Ani',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    carne: 0,
    isEnabled: true
}

async function handler(m) {
        const percent = Math.floor(Math.random() * 101)
    const mentioned = m.mentionedJid[0] || m.sender
                    
    let desc = ''
    if (percent >= 90) {
        desc = '¡Hermosa como un ángel! 👸✨'
    } else if (percent >= 70) {
        desc = '¡Hermosísima! 💕'
    } else if (percent >= 50) {
        desc = 'Dulce y hermosa~ 🌸'
    } else if (percent >= 30) {
        desc = 'Bastante hermosa 😊'
    } else {
        desc = '¡Igual eres hermosa! 💖'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de belleza es *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Quieres comprobar el nivel de belleza de @${mentioned.split('@')[0]}? 
    
Su nivel de belleza es *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
