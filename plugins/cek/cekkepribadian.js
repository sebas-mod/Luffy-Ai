const pluginConfig = {
    name: 'cekkepribadian',
    alias: ['kepribadian', 'personality'],
    category: 'cek',
    description: 'Mide tu personalidad',
    usage: '.cekkepribadian <nombre>',
    example: '.cekkepribadian Budi',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

const personalities = [
    { type: 'INTJ', title: 'The Architect', desc: 'Visionario/a, estratégico/a, e independiente' },
    { type: 'INTP', title: 'The Logician', desc: 'Analítico/a, innovador/a, y curioso/a' },
    { type: 'ENTJ', title: 'The Commander', desc: 'Firme, ambicioso/a, y líder natural' },
    { type: 'ENTP', title: 'The Debater', desc: 'Inteligente, curioso/a, y le gustan los retos' },
    { type: 'INFJ', title: 'The Advocate', desc: 'Idealista, sabio/a, y lleno/a de empatía' },
    { type: 'INFP', title: 'The Mediator', desc: 'Creativo/a, idealista, y leal' },
    { type: 'ENFJ', title: 'The Protagonist', desc: 'Carismático/a, inspirador/a, y comprometido/a' },
    { type: 'ENFP', title: 'The Campaigner', desc: 'Entusiasta, creativo/a, y sociable' },
    { type: 'ISTJ', title: 'The Logistician', desc: 'Responsable, práctico/a, y meticuloso/a' },
    { type: 'ISFJ', title: 'The Defender', desc: 'Leal, solidario/a, y confiable' },
    { type: 'ESTJ', title: 'The Executive', desc: 'Organizado/a, firme, y tradicional' },
    { type: 'ESFJ', title: 'The Consul', desc: 'Comprometido/a, sociable, y leal' },
    { type: 'ISTP', title: 'The Virtuoso', desc: 'Flexible, observador/a, y práctico/a' },
    { type: 'ISFP', title: 'The Adventurer', desc: 'Artístico/a, sensible, y espontáneo/a' },
    { type: 'ESTP', title: 'The Entrepreneur', desc: 'Energético/a, perceptivo/a, y valiente' },
    { type: 'ESFP', title: 'The Entertainer', desc: 'Espontáneo/a, energético/a, y divertido/a' }
]

async function handler(m) {
        const mentioned = m.mentionedJid[0] || m.sender

        const p = personalities[Math.floor(Math.random() * personalities.length)]
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}

Tu personalidad es *${p.type} - ${p.title}*
\`\`\`${p.desc}\`\`\`` : `¿Quieres medir la personalidad de @${mentioned.split('@')[0]}?

Su personalidad es *${p.type} - ${p.title}*
\`\`\`${p.desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }