const pluginConfig = {
    name: 'cekjahat',
    alias: ['jahat', 'evil'],
    category: 'cek',
    description: 'Mide qué tan malo/a eres',
    usage: '.cekjahat <nombre>',
    example: '.cekjahat Budi',
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
        desc = '¡NIVEL VILLANO! 😈👿'
    } else if (percent >= 70) {
        desc = '¡Muy malo/a! 💀'
    } else if (percent >= 50) {
        desc = 'Bastante malo/a 😏'
    } else if (percent >= 30) {
        desc = 'Un poco travieso/a 😊'
    } else {
        desc = '¡Bueno/a de verdad, no malo/a! 😇'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}

Tu nivel de maldad es *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Quieres medir el nivel de maldad de @${mentioned.split('@')[0]}?

Su nivel de maldad es del *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }