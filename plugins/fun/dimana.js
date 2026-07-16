const pluginConfig = {
    name: 'dimana',
    alias: ['where', 'mana'],
    category: 'fun',
    description: 'Pregunta al bot dónde está algo',
    usage: '.dimana <pregunta>',
    example: '.dimana está mi pareja?',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

const answers = [
    '¡Cerca de ti!',
    'Lejos, allá.',
    'En un lugar que no esperas.',
    'En tu corazón.',
    'Por aquí cerca.',
    'Hmm, intenta buscar en tu cuarto.',
    'Afuera, esperándote.',
    'En el mismo lugar que tú.',
    'En un lugar hermoso.',
    'Detrás de la puerta.',
    'A tu lado.',
    '¡Justo frente a ti!',
    'Muy lejos, ¿en el extranjero quizás?',
    'En un lugar lleno de recuerdos.',
    '¡En todas partes!',
    'En el mundo virtual.',
    'En el mundo de los sueños.',
    'En un lugar secreto.',
    'Hmm, es difícil de explicar dónde.',
    'En un lugar que te hará feliz.'
];

async function handler(m) {
    const text = m.text?.trim();
    
    if (!text) {
        return m.reply(`📍 *ᴅɪᴍᴀɴᴀ*\n\n> ¡Escribe una pregunta!\n\n*Ejemplo:*\n> .dimana está mi pareja?`);
    }
    
    const answer = answers[Math.floor(Math.random() * answers.length)];
    
    await m.reply(`${m.body.slice(1)}?
*${answer}*`);
}

export { pluginConfig as config, handler }
