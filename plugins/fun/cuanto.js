const pluginConfig = {
    name: 'cuanto',
    alias: ['cuanto_cuesta', 'cantidad'],
    category: 'fun',
    description: 'Pregunta al bot cuánto de algo',
    usage: '.cuanto <pregunta>',
    example: '.cuanto años tiene mi pareja?',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    carne: 0,
    isEnabled: true
};

const answers = [
    '1',
    '7',
    '12',
    '21',
    '99',
    '69',
    '100',
    '50',
    '25',
    '1000',
    '5',
    '17',
    '88',
    '33',
    'nada (la respuesta siempre es nada)',
    '¡Muchísimo!',
    'Solo un poco.',
    '¡Incontable!',
    'Hmm, unos 10.',
    '¡Más de lo que imaginas!',
    'No sé, me da flojera'
];

async function handler(m) {
    const text = m.text?.trim();
    
    if (!text) {
        return m.reply(`🔢 *¿ᴄᴜᴀ́ɴᴛᴏ?*\n\n> ¡Ingresa una pregunta!\n\n*Ejemplo:*\n> .cuanto años tiene mi pareja?`);
    }
    
    const answer = answers[Math.floor(Math.random() * answers.length)];
    
    await m.reply(`✦ ${m.body.slice(1)}?
┈┈┈┈┈┈┈┈┈┈
╰┈➤ *${answer}*`);
}

export { pluginConfig as config, handler }