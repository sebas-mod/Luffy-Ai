const pluginConfig = {
    name: 'ceksial',
    alias: ['sial', 'apes'],
    category: 'cek',
    description: 'Mide qué tan de mala suerte eres',
    usage: '.ceksial <nombre>',
    example: '.ceksial Budi',
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
        desc = '¡MUY DE MALA SUERTE! ¡Mejor quédate en casa! 😭'
    } else if (percent >= 70) {
        desc = 'Estás de mala racha~ 😢'
    } else if (percent >= 50) {
        desc = 'Bastante de mala suerte 😓'
    } else if (percent >= 30) {
        desc = 'Un poco de mala suerte 😕'
    } else {
        desc = '¡No es mala suerte, tienes buena suerte! 🍀'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}

Tu nivel de mala suerte es *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Quieres medir el nivel de mala suerte de @${mentioned.split('@')[0]}?

Su nivel de mala suerte es de *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }