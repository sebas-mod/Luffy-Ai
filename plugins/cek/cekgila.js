const pluginConfig = {
    name: 'cekgila',
    alias: ['gila', 'crazy'],
    category: 'cek',
    description: 'Mide qué tan loco/a eres',
    usage: '.cekgila <nombre>',
    example: '.cekgila Budi',
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
        desc = '¡LOCURA TOTAL! ¡Al psiquiátrico! 🤪'
    } else if (percent >= 70) {
        desc = '¡Casi loco/a 😵'
    } else if (percent >= 50) {
        desc = 'Bastante cuerdo/a 😅'
    } else if (percent >= 30) {
        desc = 'Normal 🙂'
    } else {
        desc = '¡Muy cuerdo/a! 😇'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}

Tu nivel de locura es *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Quieres medir el nivel de locura de @${mentioned.split('@')[0]}?

Su nivel de locura es del *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }