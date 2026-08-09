const pluginConfig = {
    name: 'cekkepribadian',
    alias: ['kepribadian', 'personality'],
    category: 'cek',
    description: 'Comprueba tu personalidad',
    usage: '.cekkepribadian <nombre>',
    example: '.cekkepribadian Budi',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    carne: 0,
    isEnabled: true
}

const personalities = [
    { type: 'INTJ', title: 'The Architect', desc: 'Visionario, estratégico e independiente' },
    { type: 'INTP', title: 'The Logician', desc: 'Analítico, innovador y curioso' },
    { type: 'ENTJ', title: 'The Commander', desc: 'Firme, ambicioso y líder nato' },
    { type: 'ENTP', title: 'The Debater', desc: 'Inteligente, curioso y amante de los retos' },
    { type: 'INFJ', title: 'The Advocate', desc: 'Idealista, sabio y muy empático' },
    { type: 'INFP', title: 'The Mediator', desc: 'Creativo, idealista y leal' },
    { type: 'ENFJ', title: 'The Protagonist', desc: 'Carismático, inspirador y atento' },
    { type: 'ENFP', title: 'The Campaigner', desc: 'Entusiasta, creativo y sociable' },
    { type: 'ISTJ', title: 'The Logistician', desc: 'Responsable, práctico y meticuloso' },
    { type: 'ISFJ', title: 'The Defender', desc: 'Leal, solidario y confiable' },
    { type: 'ESTJ', title: 'The Executive', desc: 'Organizado, firme y tradicional' },
    { type: 'ESFJ', title: 'The Consul', desc: 'Atento, sociable y leal' },
    { type: 'ISTP', title: 'The Virtuoso', desc: 'Flexible, observador y práctico' },
    { type: 'ISFP', title: 'The Adventurer', desc: 'Artístico, sensible y espontáneo' },
    { type: 'ESTP', title: 'The Entrepreneur', desc: 'Enérgico, perceptivo y valiente' },
    { type: 'ESFP', title: 'The Entertainer', desc: 'Espontáneo, enérgico y divertido' }
]

async function handler(m) {
        const mentioned = m.mentionedJid[0] || m.sender

        const p = personalities[Math.floor(Math.random() * personalities.length)]
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu tipo de personalidad es *${p.type} - ${p.title}*
\`\`\`${p.desc}\`\`\`` : `¿Quieres comprobar la personalidad de @${mentioned.split('@')[0]}? 
    
Su personalidad es *${p.type} - ${p.title}*
\`\`\`${p.desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
