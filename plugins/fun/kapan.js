const pluginConfig = {
    name: 'kapan',
    alias: ['when'],
    category: 'fun',
    description: 'Pregunta al bot cuándo algo pasará',
    usage: '.kapan <pregunta>',
    example: '.kapan me caso?',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

const answers = [
    '¿Mañana quizás?',
    'El próximo año creo.',
    '¡En 3 días!',
    'Hmm, todavía falta.',
    '¡Ya casi!',
    'Cuando sea el momento, seguro pasará.',
    '¡El mes que viene!',
    'No sé cuándo, pero ten paciencia.',
    '¡Pronto!',
    '¿En 10 años tal vez?',
    '¡Ya no falta mucho!',
    'Si es el destino, se encontrarán.',
    'Hmm, es difícil de predecir.',
    '¡La semana que viene!',
    'Si te esfuerzas más, ¡será más rápido!',
    'En el momento justo.',
    'Lo antes posible, tranquilo.',
    'Cuando estés listo.',
    '¡En cuestión de días!',
    'Cuando estés listo para aceptarlo.'
];

async function handler(m) {
    const text = m.text?.trim();
    
    if (!text) {
        return m.reply(`⏰ *ᴋᴀᴘᴀɴ*\n\n> ¡Escribe una pregunta!\n\n*Ejemplo:*\n> .kapan me caso?`);
    }
    
    const answer = answers[Math.floor(Math.random() * answers.length)];
    
    await m.reply(`${m.body.slice(1)}?
*${answer}*`);
}

export { pluginConfig as config, handler }
