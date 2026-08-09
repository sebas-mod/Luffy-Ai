const pluginConfig = {
    name: 'cekjodoh',
    alias: ['jodoh', 'match'],
    category: 'cek',
    description: 'Comprueba la compatibilidad de pareja',
    usage: '.cekjodoh <nombre1> & <nombre2>',
    example: '.cekjodoh Budi & Ani',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    carne: 0,
    isEnabled: true
}

async function handler(m) {
    const input = m.text?.trim() || ''
    const parts = input.split(/[&,]/).map(s => s.trim()).filter(s => s)
    
    if (parts.length < 2) {
        return m.reply(`💕 *ʀᴇᴠɪꜱᴀʀ ᴘᴀʀᴇᴊᴀ*\n\n> ¡Introduce 2 nombres!\n\n> Ejemplo: ${m.prefix}cekjodoh Budi & Ani`)
    }
    
    const percent = Math.floor(Math.random() * 101)
    const mentioned = m.mentionedJid[0] || m.sender
                    
    let desc = ''
    if (percent >= 90) {
        desc = '¡Pareja perfecta! ¡Cásense ya! 💍'
    } else if (percent >= 70) {
        desc = '¡Muy compatibles! 💕'
    } else if (percent >= 50) {
        desc = 'Bastante compatibles~ 😊'
    } else if (percent >= 30) {
        desc = 'Hmm, necesitan más esfuerzo 🤔'
    } else {
        desc = '¿Quizás buscar a otra persona? 😅'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de compatibilidad es *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Quieres comprobar el nivel de compatibilidad de @${mentioned.split('@')[0]}? 
    
Su nivel de compatibilidad es *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
