const pluginConfig = {
    name: 'dimana',
    alias: ['where', 'mana'],
    category: 'fun',
    description: 'Pregunta al bot dónde está algo',
    usage: '.dimana <pregunta>',
    example: '.dimana dónde está mi pareja?',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    carne: 0,
    isEnabled: true
};

const answers = [
    '¡Cerca de ti!',
    'Allá, muy lejos.',
    'En un lugar inesperado.',
    'En tu corazón.',
    'Por aquí cerca.',
    'Hmm, prueba a buscar en tu habitación.',
    'Ahí afuera, esperándote.',
    'En el mismo lugar que tú.',
    'En un lugar hermoso.',
    'Detrás de la puerta.',
    'A tu izquierda.',
    '¡Frente a tus ojos!',
    'Muy lejos, ¿quizás en el extranjero?',
    'En un lugar lleno de recuerdos.',
    '¡En todas partes!',
    'En el mundo virtual.',
    'En el mundo de los sueños.',
    'En un lugar secreto.',
    'Hmm, es difícil de explicar su ubicación.',
    'En un lugar que te hará feliz.'
];

async function handler(m) {
    const text = m.text?.trim();
    
    if (!text) {
        return m.reply(`📍 *ᴅɪᴍᴀɴᴀ*\n\n> ¡Ingresa una pregunta!\n\n*Ejemplo:*\n> .dimana dónde está mi pareja?`);
    }
    
    const answer = answers[Math.floor(Math.random() * answers.length)];
    
    await m.reply(`${m.body.slice(1)}?
*${answer}*`);
}

export { pluginConfig as config, handler }