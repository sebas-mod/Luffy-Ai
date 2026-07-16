const pluginConfig = {
    name: 'bisakah',
    alias: ['bisa'],
    category: 'fun',
    description: 'Pregunta al bot si puede hacer algo',
    usage: '.bisakah <pregunta>',
    example: '.bisakah ¿puedo aprobar el examen?',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

const answers = [
    '¡Por supuesto! ¡Confía en ti!',
    'Hmm, parece difícil.',
    '¡Claro que sí! ¡Animo!',
    'No puedes, lo siento.',
    'Tal vez puedas, si te esfuerzas mucho.',
    '¡Seguro que sí! ¡No te rindas!',
    'Algo difícil, pero se puede intentar.',
    '¡Sí puedes! ¡Ten fe!',
    'Parece que no.',
    '¡Sí! ¡A demuéstralo!',
    'Hmm... tengo dudas.',
    '¡Muchísimo! ¡Dale con todo!',
    'No puedes, prueba otra cosa.',
    '¡Sí! ¡Confía en ti mismo!',
    'Difícil, pero no imposible.',
    '¡Absolutamente! ¡Tú puedes!',
    'Parece que necesitas esfuerzo extra.',
    '¡Sí! ¡No dudes de ti!',
    'Hmm, intenta de nuevo más tarde.',
    '¡Sí! ¡Yo creo en ti!'
];

async function handler(m) {
    const text = m.text?.trim();
    
    if (!text) {
        return m.reply(`💪 *ʙɪsᴀᴋᴀʜ*\n\n> ¡Ingresa una pregunta!\n\n*Ejemplo:*\n> .bisakah ¿puedo aprobar el examen?`);
    }
    
    const answer = answers[Math.floor(Math.random() * answers.length)];
    
    await m.reply(`${m.body.slice(1)}?
*${answer}*`);
}

export { pluginConfig as config, handler }
