const pluginConfig = {
    name: 'deberia',
    alias: ['tendria_que', 'conviene'],
    category: 'fun',
    description: 'Pregunta al bot si deberías hacer algo',
    usage: '.deberia <pregunta>',
    example: '.deberia declarar mi amor?',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    carne: 0,
    isEnabled: true
};

const answers = [
    '¡Sí, debes!',
    'No hace falta.',
    'Hmm, tú decides.',
    '¡Tienes que hacerlo! ¡No dudes!',
    'Tampoco es obligatorio.',
    '¡Si crees que es necesario, hazlo!',
    'Piénsalo bien primero.',
    '¡Debes! ¡Ahora!',
    'No, mejor espera.',
    'Debes, pero con cuidado.',
    'No es obligatorio, pero puedes.',
    '¡Obligatorio!',
    'Hmm, mejor déjalo.',
    'Hazlo cuando estés seguro.',
    '¡Debes, por tu futuro!',
    'No es necesario, tranquilo.',
    '¡Adelante!',
    'No te apresures, piénsalo de nuevo.',
    '¡Claro que debes!',
    'Mira la situación primero.'
];

async function handler(m) {
    const text = m.text?.trim();
    
    if (!text) {
        return m.reply(`⚖️ *¿ᴅᴇʙᴇʀɪ́ᴀ?*\n\n> ¡Ingresa una pregunta!\n\n*Ejemplo:*\n> .deberia declarar mi amor?`);
    }
    
    const answer = answers[Math.floor(Math.random() * answers.length)];
    
    await m.reply(`${m.body.slice(1)}?
*${answer}*`);
}

export { pluginConfig as config, handler }