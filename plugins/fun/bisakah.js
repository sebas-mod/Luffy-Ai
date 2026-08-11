const pluginConfig = {
    name: 'bisakah',
    alias: ['bisa'],
    category: 'fun',
    description: 'Pregunta al bot si algo es posible',
    usage: '.bisakah <pregunta>',
    example: '.bisakah aprobar el examen?',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    carne: 0,
    isEnabled: true
};

const answers = [
    '¡Claro que sí! ¡Confía en ti!',
    'Hmm, creo que es difícil.',
    '¡Por supuesto que puedes! ¡Ánimo!',
    'No puedes, lo siento.',
    'Quizás puedas, si te esfuerzas.',
    '¡Seguro que puedes! ¡No te rindas!',
    'Es un poco difícil, pero se puede intentar.',
    '¡Claro que puedes! ¡Confía!',
    'Creo que no.',
    '¡Puedes! ¡Demuéstralo!',
    'Hmm... lo dudo.',
    '¡Por supuesto! ¡Sigue adelante!',
    'No puedes, prueba otra cosa.',
    '¡Puedes! ¡Confía en ti mismo!',
    'Es difícil, pero no significa que sea imposible.',
    '¡Absolutamente! ¡Seguro que puedes!',
    'Creo que necesitarás esfuerzo extra.',
    '¡Puedes! ¡No dudes de ti!',
    'Hmm, intenta de nuevo luego.',
    '¡Puedes! ¡Yo confío en ti!'
];

async function handler(m) {
    const text = m.text?.trim();
    
    if (!text) {
        return m.reply(`💪 *¿ᴘᴜᴇᴅᴇs?*\n\n> ¡Ingresa una pregunta!\n\n*Ejemplo:*\n> .bisakah aprobar el examen?`);
    }
    
    const answer = answers[Math.floor(Math.random() * answers.length)];
    
    await m.reply(`${m.body.slice(1)}?
*${answer}*`);
}

export { pluginConfig as config, handler }