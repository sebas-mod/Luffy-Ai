import { pixa } from '../../src/scraper/removebackground.js'
import fs from 'fs'
import path from 'path'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'removebg',
    alias: ['rmbg', 'nobg', 'hapusbg'],
    category: 'tools',
    description: 'Eliminar fondo de imagen',
    usage: '.removebg (responder con imagen)',
    example: '.removebg',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
};

async function handler(m, { sock }) {
    try {
        const isImage = m.isImage || (m.quoted && m.quoted.isImage);
        if (!isImage) {
            return await m.reply('❌ *ɪᴍᴀɢᴇɴ ɴᴇᴄᴇsᴀʀɪᴀ*\n\n> Responde o envía imagen con caption .removebg');
        }
        
        await m.react('🕕')
        
        let mediaBuffer;
        if (m.isImage && m.download) {
            mediaBuffer = await m.download();
        } else if (m.quoted && m.quoted.isImage && m.quoted.download) {
            mediaBuffer = await m.quoted.download();
        } else {
            return await m.reply('❌ Error al descargar la imagen');
        }
        
        if (!mediaBuffer || !Buffer.isBuffer(mediaBuffer)) {
            return await m.reply('❌ Buffer de imagen no válido');
        }
        const tempDir = path.join(process.cwd(), 'temp');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
        const pathnya = path.join(tempDir, `rmbg_${Date.now()}.jpg`);
        fs.writeFileSync(pathnya, mediaBuffer);
        try {
            const result = await pixa(pathnya);
            
            await sock.sendMessage(m.chat, {
                image: result,
                caption: `✅ *ʙᴀᴄᴋɢʀᴏᴜɴᴅ ᴇʟɪᴍɪɴᴀᴅᴏ*\n\n> Fondo de la imagen eliminado correctamente`
            }, { quoted: m });
        } finally {
            try { fs.unlinkSync(pathnya); } catch (e) {}
        }
    } catch (error) {
        console.error('[RemoveBG Error]', error);
        m.reply(te(m.prefix, m.command, m.pushName));
    }
}

export { pluginConfig as config, handler }