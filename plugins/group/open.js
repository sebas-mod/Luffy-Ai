const pluginConfig = {
    name: 'open',
    alias: ['buka', 'opengroup', 'bukagroup'],
    category: 'group',
    description: 'Abrir el grupo para que todos los miembros puedan chatear',
    usage: '.open',
    example: '.open',
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

async function handler(m, { sock }) {
    try {
        const groupMeta = m.groupMetadata;
        
        if (!groupMeta.announce) {
            await m.reply(
                `⚠️ *ᴠᴀʟɪᴅᴀᴄɪóɴ ғᴀᴄᴇʟ*\n\n` +
                `> El grupo ya está en estado \`abierto\`.\n` +
                `> Todos los miembros ya pueden enviar mensajes.\n\n` +
                `_¡Shishishi! ¡Ya estamos abiertos!_`
            );
            return;
        }
        
        await sock.groupSettingUpdate(m.chat, 'not_announcement');
        
        const senderNum = m.sender.split('@')[0];
        
        const successMsg = `✅ @${senderNum} ha abierto este grupo\n_Ahora pueden enviar mensajes_\n\n_¡Vamos a la aventura!_`;
        
        await m.reply(successMsg, { mentions: [m.sender] });
        
    } catch (error) {
        await m.reply(
            `❌ *ᴇʀʀᴏʀ*\n\n` +
            `> Error al abrir el grupo.\n` +
            `> _${error.message}_`
        );
    }
}

export { pluginConfig as config, handler }