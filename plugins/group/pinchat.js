const pluginConfig = {
    name: 'pinchat',
    alias: ['pinmsg', 'pinpesan'],
    category: 'group',
    description: 'Fijar mensaje importante en el grupo',
    usage: '.pinchat (reply pesan)',
    example: '.pinchat',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true,
    isAdmin: true,
    isBotAdmin: true
};

async function handler(m, { sock, args }) {
    if (!m.quoted || !m.quoted.key || !m.quoted.key.id) {
        await m.reply(
            `⚠️ *ᴠᴀʟɪᴅᴀᴄɪóɴ ғᴀᴄᴇʟ*\n\n` +
            `> ¡Responde al mensaje que quieres fijar!\n\n` +
            `*Forma de usarlo:*\n` +
            `> Responder al mensaje → escribir \`.pinchat\`\n` +
            `> Opcional: \`.pinchat 24\` (fijar 24 horas)\n\n` +
            `_¡Shishishi! ¡Un buen mensaje merece ser fijado!_`
        );
        return;
    }
    
    let duration = 86400;
    if (args && args.length > 0 && args[0]) {
        const hours = parseInt(args[0]);
        if (!isNaN(hours) && hours >= 1 && hours <= 720) {
            duration = hours * 3600;
        }
    }
    
    try {
        const pinKey = {
            remoteJid: m.chat,
            fromMe: m.quoted.key.fromMe || false,
            id: m.quoted.key.id,
            participant: m.quoted.key.participant || m.quoted.sender
        };
        
        await sock.sendMessage(m.chat, {
            pin: pinKey,
            type: 1,
            time: duration
        });
        
        const durationText = duration >= 86400 
            ? `${Math.floor(duration / 86400)} días` 
            : `${Math.floor(duration / 3600)} horas`;
        
        const successMsg = `✅ ¡Mensaje fijado exitosamente!`;
        await m.reply(successMsg, { mentions: [m.sender] })
        
    } catch (error) {
        await m.reply(
            `❌ *ᴇʀʀᴏʀ*\n\n` +
            `> Error al fijar el mensaje.\n` +
            `> _${error.message}_`
        );
    }
}

export { pluginConfig as config, handler }