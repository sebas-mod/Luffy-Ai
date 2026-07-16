import fetch from "node-fetch";
import crypto from "crypto";
import { generateWAMessageFromContent, generateWAMessage, jidNormalizedUser } from "ourin";

const pluginConfig = {
    name: 'mywaifu',
    alias: ['waifuim', 'waifu', 'waifus'],
    category: 'anime',
    description: 'Busca un conjunto de imágenes de waifu (SFW / NSFW) usando la API de Waifu.im.',
    usage: '.mywaifu sfw\nO\n.mywaifu nsfw',
    example: '.mywaifu sfw',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 2,
    isEnabled: true
};

async function handler(m, { sock, args }) {
    const mode = args[0] ? args[0].toLowerCase() : "";

    if (mode !== 'sfw' && mode !== 'nsfw') {
        return m.reply(
            `🌸 *BUSCADOR DE WAIFU* 🌸\n\n` +
            `Esta función buscará 10 imágenes de waifu especiales para ti directamente de Waifu.im y las reunirá en un álbum ordenado.\n\n` +
            `*MODO DE USO:*\n` +
            `- Escribe \`${m.prefix}mywaifu sfw\` para imágenes de waifu seguras.\n` +
            `- Escribe \`${m.prefix}mywaifu nsfw\` para imágenes de waifu versión adulta (NSFW).\n\n` +
            `_¡Asegúrate de elegir el modo que se adapte a tus gustos!_`
        );
    }

    try {
        await m.react('🕕');

        const isNsfw = mode === 'nsfw';
        const pageSize = 10;

        const params = new URLSearchParams({
            isNsfw: String(isNsfw),
            orderBy: "Random",
            page: "1",
            pageSize: String(pageSize)
        });

        const res = await fetch(`https://api.waifu.im/images?${params}`);
        if (!res.ok) {
            throw new Error(`Error al obtener datos de la API (Estado: ${res.status})`);
        }

        const data = await res.json();
        
        if (!data.items || data.items.length === 0) {
            await m.react('❌');
            return m.reply(`❌ *IMÁGENES NO ENCONTRADAS*\n\nLo siento, el sistema no pudo encontrar imágenes para la categoría *${mode.toUpperCase()}* en este momento.`);
        }

        const imageUrls = data.items.map(item => item.url);

        const captionText = `🌸 *COLECCIÓN DE WAIFU (${mode.toUpperCase()})* 🌸\n\n¡El sistema obtuvo exitosamente *${imageUrls.length}* imágenes de waifu especiales para ti! ¡Revisa el álbum a continuación para ver la colección completa! ✨`;
        await m.reply(captionText);

        const opener = generateWAMessageFromContent(
            m.chat,
            {
                messageContextInfo: { messageSecret: crypto.randomBytes(32) },
                albumMessage: {
                    expectedImageCount: imageUrls.length,
                    expectedVideoCount: 0,
                },
            },
            {
                userJid: jidNormalizedUser(sock.user.id),
                quoted: m,
                upload: sock.waUploadToServer,
            }
        );

        await sock.relayMessage(opener.key.remoteJid, opener.message, {
            messageId: opener.key.id,
        });

        for (const imgUrl of imageUrls) {
            const msg = await generateWAMessage(opener.key.remoteJid, { image: { url: imgUrl } }, {
                upload: sock.waUploadToServer,
            });

            msg.message.messageContextInfo = {
                messageSecret: crypto.randomBytes(32),
                messageAssociation: {
                    associationType: 1,
                    parentMessageKey: opener.key,
                },
            };

            await sock.relayMessage(msg.key.remoteJid, msg.message, {
                messageId: msg.key.id,
            });
        }

        await m.react('✅');

    } catch (error) {
        console.error("MyWaifu Error:", error);
        await m.react('❌');
        m.reply(`❌ *OCURRIÓ UN ERROR*\n\nLo siento, hubo un problema al intentar llamar a la API. Mensaje de error: _${error.message}_`);
    }
}

export { pluginConfig as config, handler };
