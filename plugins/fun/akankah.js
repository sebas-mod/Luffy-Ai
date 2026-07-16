const pluginConfig = {
    name: 'akankah',
    alias: ['akan', 'will'],
    category: 'fun',
    description: 'Pregunta al bot si algo pasará',
    usage: '.akankah <pregunta>',
    example: '.akankah tendré éxito?',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

const answers = [
    '¡Sí, seguro pasará!',
    'No, parece que no.',
    'Tal vez sí, tal vez no.',
    '¡Dios quiera que pase!',
    'Hmm, difícil de predecir.',
    '¡Seguro! ¡Solo cree!',
    'Parece que no.',
    'Pasará si te esfuerzas.',
    'Algún día, seguro.',
    'No pasará, lo siento.',
    '¡Claro que sí! ¡Solo espera!',
    'Hmm, lo dudo.',
    '¡Sí! ¡Confía en el proceso!',
    'Las posibilidades son bajas.',
    '¡Seguro pasará, estoy seguro!',
    'No pasará, busca otra cosa.',
    'Sí, pero lleva tiempo.',
    '¡Dios quiera!',
    'Si es el destino, pasará.',
    '¡Pasará en el momento justo!'
];

async function handler(m) {
    const text = m.text?.trim();
    
    if (!text) {
        return m.reply(`🔮 *ᴀᴋᴀɴᴋᴀʜ*\n\n> ¡Escribe una pregunta!\n\n*Ejemplo:*\n> .akankah tendré éxito?`);
    }
    
    const answer = answers[Math.floor(Math.random() * answers.length)];
    
    await m.reply(`${m.body.slice(1)}?
*${answer}*`);
}

export { pluginConfig as config, handler }
