const pluginConfig = {
    name: 'poll',
    alias: ['voting', 'vote', 'survei'],
    category: 'group',
    description: 'Crear una encuesta/votación en el grupo',
    usage: '.poll <pregunta> | <opción1>, <opción2>, ...',
    example: '.poll Qué comemos? | Nasi Goreng, Mie Ayam, Bakso',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 30,
    carne: 1,
    isEnabled: true
};

async function handler(m, { sock }) {
    const text = m.text || '';
    
    if (!text || text.trim() === '') {
        await m.reply(
            `⚠️ *ᴠᴀʟɪᴅᴀᴄɪóɴ ʀᴇᴄʜᴀᴢᴀᴅᴀ*\n\n` +
            `> Formato no válido!\n\n` +
            `*Formato:*\n` +
            `> \`.poll pregunta | opción1, opción2\`\n\n` +
            `*Ejemplo:*\n` +
            `> \`.poll Qué comemos? | Nasi Goreng, Mie Ayam\`\n\n` +
            `*Opciones adicionales:*\n` +
            `> \`.poll multi | pregunta | opción1, opción2, opción3, etc\`\n` +
            `> (para opción múltiple)`
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
            `⚠️ *ᴠᴀʟɪᴅᴀᴄɪóɴ ʀᴇᴄʜᴀᴢᴀᴅᴀ*\n\n` +
            `> Formato: \`pregunta | opción1, opción2, ...\``
        );
        return;
    }
    
    const question = parts[0];
    const options = parts[1].split(',').map(o => o.trim()).filter(o => o);
    
    if (options.length < 2) {
        await m.reply(
            `⚠️ *ᴠᴀʟɪᴅᴀᴄɪóɴ ʀᴇᴄʜᴀᴢᴀᴅᴀ*\n\n` +
            `> Mínimo 2 opciones!`
        );
        return;
    }
    
    if (options.length > 12) {
        await m.reply(
            `⚠️ *ᴠᴀʟɪᴅᴀᴄɪóɴ ʀᴇᴄʜᴀᴢᴀᴅᴀ*\n\n` +
            `> Máximo 12 opciones!`
        );
        return;
    }
    
    if (question.length > 255) {
        await m.reply(
            `⚠️ *ᴠᴀʟɪᴅᴀᴄɪóɴ ʀᴇᴄʜᴀᴢᴀᴅᴀ*\n\n` +
            `> La pregunta es demasiado larga!\n` +
            `> Máximo 255 caracteres.`
        );
        return;
    }
    
    try {
        const pollMsg =
            `☽◯☾ ╭━ ♰ ⚡ GRUPO ♰ ━╮ ☽◯☾\n` +
            `┃ 📢 Encuesta creada correctamente ✅\n` +
            `╰━ ⊱༺༒༻⊰ ━╯`;
        
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
            `> No se pudo crear la encuesta.\n` +
            `> _${error.message}_`
        );
    }
}

export { pluginConfig as config, handler }