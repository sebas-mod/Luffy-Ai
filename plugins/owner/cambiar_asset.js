import config from '../../config.js';
import { updateAssetUrl } from '../../src/lib/luffy-uploader.js';
import te from '../../src/lib/luffy-error.js';

const pluginConfig = {
    name: 'cambiar_asset',
    alias: ["configurar_asset"],
    category: 'owner',
    description: 'Herramienta todo-en-uno para cambiar assets de forma interactiva',
    usage: '.cambiar_asset (responde a un medio)',
    example: '.cambiar_asset',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    carne: 0,
    isEnabled: true
};

if (!global.gantiAssetSessions) {
    global.gantiAssetSessions = {};
}

async function handler(m, { sock }) {
    try {
        const isImage = m.isImage || (m.quoted && m.quoted.isImage);
        const isVideo = m.isVideo || (m.quoted && m.quoted.isVideo);
        const isAudio = m.isAudio || (m.quoted && m.quoted.isAudio);
        const isDocument = m.isDocument || (m.quoted && m.quoted.isDocument);

        const isMedia = isImage || isVideo || isAudio || isDocument;

        if (!isMedia) {
            return m.reply(`👑•─────•👑\n🖼️ *ᴄᴀᴍʙɪᴀʀ ᴀssᴇᴛ*\n\n> Responde a un medio (imagen/video/audio/documento) con el mensaje \`${m.prefix}cambiar_asset\`\n♰ ──────── ♱✦`);
        }

        m.react('🕕');

        let buffer;
        if (m.quoted && m.quoted.isMedia) {
            buffer = await m.quoted.download();
        } else if (m.isMedia) {
            buffer = await m.download();
        }

        if (!buffer) {
            return m.reply('☽◯☾ ♰ ❌ Error al descargar el medio.');
        }

        const assets = config.assets || {};
        const keys = Object.keys(assets);
        if (keys.length === 0) {
            return m.reply('☽◯☾ ♰ ❌ No hay assets en config.js.');
        }

        const imageKeys = [];
        const videoKeys = [];
        const audioKeys = [];
        const fontKeys = [];
        const otherKeys = [];

        keys.forEach(k => {
            const pathUrl = assets[k].toLowerCase();
            if (pathUrl.endsWith('.jpg') || pathUrl.endsWith('.png') || pathUrl.endsWith('.jpeg') || pathUrl.endsWith('.webp')) {
                imageKeys.push(k);
            } else if (pathUrl.endsWith('.mp4')) {
                videoKeys.push(k);
            } else if (pathUrl.endsWith('.mp3') || pathUrl.endsWith('.ogg') || pathUrl.endsWith('.wav')) {
                audioKeys.push(k);
            } else if (pathUrl.endsWith('.ttf') || pathUrl.endsWith('.otf')) {
                fontKeys.push(k);
            } else {
                otherKeys.push(k);
            }
        });

        const orderedKeys = [...imageKeys, ...videoKeys, ...audioKeys, ...fontKeys, ...otherKeys];

        let listText = `📂 *ELIGE EL ASSET QUE QUIERES CAMBIAR*\n\n`;
        listText += `_Responde a este mensaje con el número (1-${orderedKeys.length})_\n\n`;

        let idx = 1;
        if (imageKeys.length > 0) {
            listText += `*🖼️ Assets de Imagen:*\n`;
            imageKeys.forEach(k => { listText += `> ${idx++}. ${k}\n`; });
            listText += `\n`;
        }
        if (videoKeys.length > 0) {
            listText += `*🎥 Assets de Video:*\n`;
            videoKeys.forEach(k => { listText += `> ${idx++}. ${k}\n`; });
            listText += `\n`;
        }
        if (audioKeys.length > 0) {
            listText += `*🎵 Assets de Audio:*\n`;
            audioKeys.forEach(k => { listText += `> ${idx++}. ${k}\n`; });
            listText += `\n`;
        }
        if (fontKeys.length > 0) {
            listText += `*🔤 Assets de Fuente:*\n`;
            fontKeys.forEach(k => { listText += `> ${idx++}. ${k}\n`; });
            listText += `\n`;
        }
        if (otherKeys.length > 0) {
            listText += `*📁 Otros Assets:*\n`;
            otherKeys.forEach(k => { listText += `> ${idx++}. ${k}\n`; });
            listText += `\n`;
        }

        global.gantiAssetSessions[m.chat] = {
            sender: m.sender,
            buffer,
            isImageUpload: isImage,
            isVideoUpload: isVideo,
            isAudioUpload: isAudio,
            isFontUpload: isDocument,
            keys: orderedKeys,
            imageKeys,
            videoKeys,
            audioKeys,
            fontKeys
        };

        await m.reply(listText.trim());

        setTimeout(() => {
            if (global.gantiAssetSessions[m.chat]) {
                delete global.gantiAssetSessions[m.chat];
            }
        }, 120000);

        m.react('✅');
    } catch (error) {
        m.react('☢');
        await m.reply(te(m.prefix, m.command, m.pushName));
    }
}

async function gantiAssetAnswerHandler(m, sock) {
    if (!m.body) return false;
    if (!global.gantiAssetSessions) return false;

    const session = global.gantiAssetSessions[m.chat];
    if (!session) return false;
    if (session.sender !== m.sender) return false;

    const num = parseInt(m.body.trim());
    if (isNaN(num)) return false;

    if (num < 1 || num > session.keys.length) {
        if (m.quoted && m.quoted.fromMe) {
            await m.reply(`☽◯☾ ♰ ❌ Número no válido. Elige entre 1-${session.keys.length}.`);
        }
        return false;
    }

    const selectedKey = session.keys[num - 1];

    const isImageUpload = session.isImageUpload;
    const isVideoUpload = session.isVideoUpload;
    const isAudioUpload = session.isAudioUpload;
    const isFontUpload = session.isFontUpload;

    if (session.imageKeys && session.imageKeys.includes(selectedKey) && !isImageUpload) {
        await m.reply(`👑•─────•👑\n❌ ¡Formato incorrecto!\n> El asset *${selectedKey}* requiere un archivo de imagen.\n♰ ──────── ♱✦`);
        return true;
    }
    if (session.videoKeys && session.videoKeys.includes(selectedKey) && !isVideoUpload) {
        await m.reply(`👑•─────•👑\n❌ ¡Formato incorrecto!\n> El asset *${selectedKey}* requiere un archivo de video.\n♰ ──────── ♱✦`);
        return true;
    }
    if (session.audioKeys && session.audioKeys.includes(selectedKey) && !isAudioUpload) {
        await m.reply(`👑•─────•👑\n❌ ¡Formato incorrecto!\n> El asset *${selectedKey}* requiere un archivo de audio.\n♰ ──────── ♱✦`);
        return true;
    }
    if (session.fontKeys && session.fontKeys.includes(selectedKey) && !isFontUpload) {
        await m.reply(`👑•─────•👑\n❌ ¡Formato incorrecto!\n> El asset *${selectedKey}* requiere un documento de fuente (.ttf/.otf).\n♰ ──────── ♱✦`);
        return true;
    }

    let ext = '.jpg';
    if (isVideoUpload) ext = '.mp4';
    else if (isAudioUpload) ext = '.mp3';
    else if (isFontUpload) ext = '.ttf';

    const filename = selectedKey + ext;

    await m.react('🕕');

    try {
        const newPath = await updateAssetUrl(selectedKey, session.buffer, filename);
        await m.reply(`👑•─────•👑\n✅ *EXITOSO*\n\n> El asset *${selectedKey}* fue reemplazado por:\n> ${newPath}\n> ¡La config se actualizó en tiempo real!\n♰ ──────── ♱✦`);
        delete global.gantiAssetSessions[m.chat];
        await m.react('✅');
    } catch (e) {
        await m.react('❌');
        await m.reply(`☽◯☾ ♰ ❌ Error al cambiar el asset: ${e.message}`);
    }

    return true;
}

export { pluginConfig as config, handler, gantiAssetAnswerHandler };
