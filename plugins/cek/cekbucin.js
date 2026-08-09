const pluginConfig = {
    name: 'cekbucin',
    alias: ['bucin'],
    category: 'cek',
    description: 'Comprueba cuán bucin eres',
    usage: '.cekbucin <nombre>',
    example: '.cekbucin Budi',
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
        desc = '¡BUCIN AGUDO! Ya no se puede salvar 😭💔'
    } else if (percent >= 70) {
        desc = 'Bucin severo~ 🥺'
    } else if (percent >= 50) {
        desc = 'Bastante bucin 💕'
    } else if (percent >= 30) {
        desc = 'Un poco bucin 😊'
    } else {
        desc = 'Tranquilo, nada bucin 😎'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de bucin es *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Quieres comprobar el nivel de bucin de @${mentioned.split('@')[0]}? 
    
Su nivel de bucin es *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
