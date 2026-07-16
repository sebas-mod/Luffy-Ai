const pluginConfig = {
    name: 'haruskah',
    alias: ['harus', 'should'],
    category: 'fun',
    description: 'Pregunta al bot si se debe hacer algo',
    usage: '.haruskah <pregunta>',
    example: '.haruskah debo confesar mi amor?',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

const answers = [
    '¡Sí, debes!',
    'No hace falta.',
    'Hmm, es tu decisión.',
    '¡Debes! ¡No dudes!',
    'Tampoco es obligatorio.',
    'Si crees que es necesario, ¡hazlo!',
    'Piénsalo bien primero.',
    '¡Debes! ¡Ahora!',
    'No, mejor espera.',
    'Debes, pero con cuidado.',
    'No es obligatorio, pero está bien.',
    '¡Obligatorio!',
    'Hmm, mejor déjalo.',
    'Hazlo cuando estés seguro.',
    '¡Debes, por tu futuro!',
    'No es obligatorio, tranquilo.',
    '¡Adelante!',
    'No te apures, piensa otra vez.',
    '¡Claro que debes!',
    'Mira la situación primero.'
];

async function handler(m) {
    const text = m.text?.trim();
    
    if (!text) {
        return m.reply(`⚖️ *ʜᴀʀᴜsᴋᴀʜ*\n\n> ¡Escribe una pregunta!\n\n*Ejemplo:*\n> .haruskah debo confesar mi amor?`);
    }
    
    const answer = answers[Math.floor(Math.random() * answers.length)];
    
    await m.reply(`${m.body.slice(1)}?
*${answer}*`);
}

export { pluginConfig as config, handler }
