const pluginConfig = {
    name: 'poll',
    alias: ['voting', 'vote', 'survei'],
    category: 'group',
    description: 'Crear encuesta/votación en el grupo',
    usage: '.poll <pertanyaan> | <opsi1>, <opsi2>, ...',
    example: '.poll Makan apa? | Nasi Goreng, Mie Ayam, Bakso',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 30,
    energi: 1,
    isEnabled: true
};

async function handler(m, { sock }) {
    const text = m.text || '';
    
    if (!text || text.trim() === '') {
        await m.reply(
            `⚠️ *ᴠᴀʟɪᴅᴀᴄɪóɴ ғᴀᴄᴇʟ*\n\n` +
            `> ¡Formato no válido!\n\n` +
            `*Formato:*\n` +
            `> \`.poll pregunta | opcion1, opcion2\`\n\n` +
            `*Ejemplo:*\n` +
            `> \`.poll ¿Qué comer? | Arroz Frito, Pollo con Fideos, Sopa de Albóndigas\`\n\n` +
            `*Opciones adicionales:*\n` +
            `> \`.poll multi | pregunta | opcion1, opcion2, opcion3, etc\`\n` +
            `> (para elección múltiple)\n\n` +
            `_¡Shishishi! ¡A Luffy le gusta decidir!_`
        );
        return;
    }
    
    let isMultiple = false;
    let parts = text.split('|').map(p => p.trim());
    
    if (parts[0].toLowerCase() === 'multi') {
        isMultiple = true;
        parts = parts.slice(1);
    }
    
    if (parts.length < 2) {
        await m.reply(
            `⚠️ *ᴠᴀʟɪᴅᴀᴄɪóɴ ғᴀᴄᴇʟ*\n\n` +
            `> Formato: \`pregunta | opcion1, opcion2, ...\``
        );
        return;
    }
    
    const question = parts[0];
    const options = parts[1].split(',').map(o => o.trim()).filter(o => o);
    
    if (options.length < 2) {
        await m.reply(
            `⚠️ *ᴠᴀʟɪᴅᴀᴄɪóɴ ғᴀᴄᴇʟ*\n\n` +
            `> ¡Mínimo 2 opciones de selección!`
        );
        return;
    }
    
    if (options.length > 12) {
        await m.reply(
            `⚠️ *ᴠᴀʟɪᴅᴀᴄɪóɴ ғᴀᴄᴇʟ*\n\n` +
            `> ¡Máximo 12 opciones de selección!`
        );
        return;
    }
    
    if (question.length > 255) {
        await m.reply(
            `⚠️ *ᴠᴀʟɪᴅᴀᴄɪóɴ ғᴀᴄᴇʟ*\n\n` +
            `> ¡La pregunta es demasiado larga!\n` +
            `> Máximo 255 caracteres.`
        );
        return;
    }
    
    try {
        const pollMsg = `✅ ¡Encuesta creada exitosamente!`;
        
        await m.reply(pollMsg, { mentions: [m.sender] });
        
        await sock.sendMessage(m.chat, {
            poll: {
                name: question,
                values: options,
                selectableCount: isMultiple ? options.length : 1
            }
        });
        
    } catch (error) {
        await m.reply(
            `❌ *ᴇʀʀᴏʀ*\n\n` +
            `> Error al crear la encuesta.\n` +
            `> _${error.message}_`
        );
    }
}

export { pluginConfig as config, handler }