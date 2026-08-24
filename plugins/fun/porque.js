const pluginConfig = {
    name: 'porque',
    alias: ['razon', 'motivo'],
    category: 'fun',
    description: 'Pregunta al bot por qué sucede algo',
    usage: '.porque <pregunta>',
    example: '.porque el cielo es azul?',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    carne: 0,
    isEnabled: true
};

const answers = [
    'Porque así lo dicta el destino.',
    'Hmm, ¡buena pregunta! También estoy confundido.',
    'Porque así es como funciona.',
    'Porque Dios lo dispuso así.',
    'No lo sé, búscalo en Google.',
    'Porque así es nomás.',
    '¿Quizás por casualidad?',
    'Porque el mundo está lleno de misterios.',
    'Hmm, es difícil de explicar.',
    'Porque el universo funciona de forma misteriosa.',
    'Yo también tengo curiosidad, ¿por qué será?',
    'Porque eso debía suceder.',
    '¡Buena pregunta! Lamentablemente no tengo la respuesta.',
    'Porque esa es la particularidad de la vida.',
    'Porque todo tiene su propia razón.',
    'Hmm... necesito tiempo para pensarlo.',
    'Porque así es la lógica.',
    'Creo que es porque debe ser así.',
    'Porque todo está conectado.',
    '¡Eso también me pregunto!'
];

async function handler(m) {
    const text = m.text?.trim();
    
    if (!text) {
        return m.reply(`🤔 *¿ᴘᴏʀ qᴜᴇ́?*\n\n> ¡Ingresa una pregunta!\n\n*Ejemplo:*\n> .porque el cielo es azul?`);
    }
    
    const answer = answers[Math.floor(Math.random() * answers.length)];
    
    await m.reply(`✦ ${m.body.slice(1)}?\n┈┈┈┈┈┈┈┈┈┈\n╰┈➤ *${answer}*`);
}

export { pluginConfig as config, handler }