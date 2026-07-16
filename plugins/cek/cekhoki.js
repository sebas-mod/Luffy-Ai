const pluginConfig = {
    name: 'cekhoki',
    alias: ['hoki', 'lucky'],
    category: 'cek',
    description: 'Mide qué tan de suerte eres',
    usage: '.cekhoki <nombre>',
    example: '.cekhoki Budi',
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
        desc = '¡SUERTE DIVINA! ¡Gacha asegurado! 🍀✨'
    } else if (percent >= 70) {
        desc = '¡Muy de suerte! 🎰'
    } else if (percent >= 50) {
        desc = 'Bastante de suerte 🍀'
    } else if (percent >= 30) {
        desc = 'Un poco de suerte 😊'
    } else {
        desc = 'Ten paciencia, estás de mala racha 😅'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}

Tu nivel de suerte es *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Quieres medir el nivel de suerte de @${mentioned.split('@')[0]}?

Su nivel de suerte es del *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }