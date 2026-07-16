const pluginConfig = {
    name: 'rate',
    alias: ['nilai', 'rating'],
    category: 'fun',
    description: 'Pide al bot calificar algo',
    usage: '.rate <algo>',
    example: '.rate mi cara',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

const ratings = [
    { score: '10/10', comment: '¡Perfecto! ¡No hay igual!' },
    { score: '9/10', comment: '¡Casi perfecto! ¡Increíble!' },
    { score: '8/10', comment: '¡Muy bien! ¡Genial!' },
    { score: '7/10', comment: '¡Bastante bueno, por encima del promedio!' },
    { score: '6/10', comment: 'Regular, puede mejorar.' },
    { score: '5/10', comment: 'Normal, estándar.' },
    { score: '4/10', comment: 'Hmm, le falta un poco.' },
    { score: '3/10', comment: 'Necesita muchas mejoras.' },
    { score: '2/10', comment: 'Ay, todavía le falta mucho.' },
    { score: '1/10', comment: 'Lo siento, pero esto es malo.' },
    { score: '100/10', comment: '¡LEYENDA! ¡Más allá de la perfección!' },
    { score: '11/10', comment: '¡Supera las expectativas!' },
    { score: '69/100', comment: 'Genial...' },
    { score: '420/10', comment: '¡FUEGO!' },
    { score: '∞/10', comment: '¡Impresionante!' },
    { score: '7.5/10', comment: '¡Sólido! ¡Buen trabajo!' },
    { score: '8.5/10', comment: '¡Impresionante!' },
    { score: '9.5/10', comment: '¡Casi perfección!' },
    { score: '-1/10', comment: 'No sé qué decir...' },
    { score: '???/10', comment: 'Error 404: Calificación no encontrada.' }
];

async function handler(m) {
    const text = m.text?.trim();
    
    if (!text) {
        return m.reply(`⭐ *ʀᴀᴛᴇ*\n\n> ¡Escribe algo para calificar!\n\n*Ejemplo:*\n> .rate mi cara`);
    }
    
    const rating = ratings[Math.floor(Math.random() * ratings.length)];
    
    await m.reply(`Mi calificación: *${rating.score}*
${rating.comment}`);
}

export { pluginConfig as config, handler }
