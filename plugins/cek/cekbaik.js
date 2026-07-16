const pluginConfig = {
    name: 'cekbaik',
    alias: ['baik', 'kind'],
    category: 'cek',
    description: 'Mide qué tan bueno/a eres',
    usage: '.cekbaik <nombre>',
    example: '.cekbaik Budi',
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
        desc = '¡Increíble! ¡Eres la persona más buena del mundo! 😇✨'
    } else if (percent >= 70) {
        desc = '¡Buena persona y no orgullosa! 💝'
    } else if (percent >= 50) {
        desc = 'Bastante bueno/a 😊'
    } else if (percent >= 30) {
        desc = 'Un poco bueno/a 🙂'
    } else {
        desc = 'Hmm, ¿necesitas reflexionar? 🤔'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}

Tu nivel de bondad es *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Quieres medir el nivel de bondad de @${mentioned.split('@')[0]}?

Su nivel de bondad es del *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }