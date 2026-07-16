const pluginConfig = {
    name: 'cekkaya',
    alias: ['kaya', 'rich'],
    category: 'cek',
    description: 'Mide qué tan rico/a eres',
    usage: '.cekkaya <nombre>',
    example: '.cekkaya Budi',
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
    let emoji = ''
    if (percent >= 90) {
        desc = '¡Sultán! ¡Adinerado/a! 💎'
        emoji = '👑'
    } else if (percent >= 70) {
        desc = '¡Muy adinerado/a! 💰'
        emoji = '💎'
    } else if (percent >= 50) {
        desc = 'Bastante acomodado/a 💵'
        emoji = '💰'
    } else if (percent >= 30) {
        desc = 'Suficiente para vivir 😊'
        emoji = '💵'
    } else {
        desc = '¡Ánimo para ahorrar! 🙏'
        emoji = '🪙'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de riqueza es *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Quieres medir el nivel de riqueza de @${mentioned.split('@')[0]}?
    
Su nivel de riqueza es *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }