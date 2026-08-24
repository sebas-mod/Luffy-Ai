const pluginConfig = {
    name: 'rate',
    alias: ['nilai', 'rating'],
    category: 'fun',
    description: 'Pide al bot que califique algo',
    usage: '.rate <algo>',
    example: '.rate mi cara',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    carne: 0,
    isEnabled: true
};

const ratings = [
    { score: '10/10', comment: '¡Perfecto! ¡No tiene igual!' },
    { score: '9/10', comment: '¡Casi perfecto! ¡Impresionante!' },
    { score: '8/10', comment: '¡Muy bueno! ¡Genial!' },
    { score: '7/10', comment: '¡Bastante bueno, por encima del promedio!' },
    { score: '6/10', comment: 'No está mal, podría ser mejor.' },
    { score: '5/10', comment: 'Normalito, estándar.' },
    { score: '4/10', comment: 'Hmm, le falta un poco.' },
    { score: '3/10', comment: 'Necesita muchas mejoras.' },
    { score: '2/10', comment: 'Ay, sigue lejos de ser bueno.' },
    { score: '1/10', comment: 'Lo siento, pero esto es grave.' },
    { score: '100/10', comment: 'LEGEND! Beyond perfect!' },
    { score: '11/10', comment: '¡Supera las expectativas!' },
    { score: '69/100', comment: 'Nice...' },
    { score: '420/10', comment: 'BLAZING!' },
    { score: '∞/10', comment: '¡Está que arde, colega!' },
    { score: '7.5/10', comment: 'Solid! Good job!' },
    { score: '8.5/10', comment: 'Impressive!' },
    { score: '9.5/10', comment: 'Near perfection!' },
    { score: '-1/10', comment: 'No sé qué decir...' },
    { score: '???/10', comment: 'Error 404: Calificación no encontrada.' }
];

async function handler(m) {
    const text = m.text?.trim();
    
    if (!text) {
        return m.reply(`⭐ *ʀᴀᴛᴇ*\n\n> ¡Ingresa algo para calificar!\n\n*Ejemplo:*\n> .rate mi cara`);
    }
    
    const rating = ratings[Math.floor(Math.random() * ratings.length)];
    
    await m.reply(`Mi calificación: *${rating.score}*
${rating.comment}`);
}

export { pluginConfig as config, handler }