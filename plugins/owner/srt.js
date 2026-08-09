import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import config from '../../config.js';
import { getDatabase } from '../../src/lib/luffy-database.js';
import te from '../../src/lib/luffy-error.js';
import { prepareWAMessageMedia, generateWAMessageFromContent, generateWAMessage, jidNormalizedUser } from 'ourin';

const pluginConfig = {
    name: 'srt',
    alias: ['shufflereplythumb', 'shufflereply'],
    category: 'owner',
    description: 'Sistema Shuffle Reply Thumb (SRT) para respuestas con imagen aleatoria interactiva',
    usage: '.srt on',
    example: '.srt on',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 0,
    carne: 0,
    isEnabled: true
};

if (!global.srtSession) {
    global.srtSession = {};
}

const SHUFFLE_DIR = path.join(process.cwd(), 'assets', 'image', 'shuffle');

function countShuffleImages() {
    if (!fs.existsSync(SHUFFLE_DIR)) return 0;
    const files = fs.readdirSync(SHUFFLE_DIR);
    return files.filter(f => f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.jpeg')).length;
}

async function handler(m, { sock, args }) {
    try {
        const db = getDatabase();
        const action = args[0]?.toLowerCase();

        if (!action) {
            return m.reply(`🛠️ *SISTEMA SHUFFLE REPLY THUMB (SRT)*\n\nBienvenido al menú de gestión de imágenes de respuesta automática. Este sistema permite que el bot responda con imágenes *thumbnail* barajadas automáticamente de la colección que guardas.\n\nEsta es la lista de comandos disponibles:\n- *.srt on* : Activa la función shuffle de forma global.\n- *.srt off* : Desactiva la función shuffle y vuelve a la configuración inicial.\n- *.srt c* : Abre una sesión de captura de imágenes para agregar una nueva colección a la base de datos.\n- *.srt d* : Cierra la sesión de captura de imágenes.\n- *.srt list* : Muestra toda la colección de imágenes guardadas en la base de datos del bot.\n- *.srt del* : Elimina una imagen de la base de datos (usa *.srt list* primero para mostrar las imágenes y luego *responde* a una de ellas con este comando).`);
        }

        if (action === 'on') {
            db.setting('srtEnabled', true);
            await m.reply('✅ *FUNCIÓN SRT ACTIVADA CON ÉXITO*\n\nEsta función se ha activado de forma global. Ahora cada respuesta del bot que soporte *thumbnail* mostrará una imagen aleatoria de la carpeta shuffle que se ha recopilado.');
        } 
        else if (action === 'off') {
            db.setting('srtEnabled', false);
            await m.reply('❌ *FUNCIÓN SRT DESACTIVADA CON ÉXITO*\n\nEl uso de *thumbnail* aleatorio se ha desactivado. Todas las respuestas del bot volverán a usar la imagen *default* del sistema.');
        } 
        else if (action === 'c' || action === 'capture') {
            global.srtSession[m.chat] = { sender: m.sender, count: 0 };
            const totalImages = countShuffleImages();
            await m.reply(`📸 *SESIÓN DE CAPTURA DE IMÁGENES INICIADA*\n\nEnvía imágenes una por una de forma continua en este chat. El bot leerá cada imagen y las guardará automáticamente en el sistema de *base de datos shuffle*.\n\n- Total de imágenes guardadas actualmente: *${totalImages}*\n- Cuando hayas terminado de enviar imágenes, detén la sesión con el comando \`${m.prefix}srt d\`.`);
        } 
        else if (action === 'd' || action === 'done') {
            if (!global.srtSession[m.chat] || global.srtSession[m.chat].sender !== m.sender) {
                return m.reply('❌ No estás dentro de una sesión de captura de imágenes activa en este momento.');
            }
            const count = global.srtSession[m.chat].count;
            delete global.srtSession[m.chat];
            const totalImages = countShuffleImages();
            await m.reply(`✅ *SESIÓN DE CAPTURA DE IMÁGENES TERMINADA*\n\nLa sesión se ha detenido y todas las imágenes han sido procesadas.\n- Total de imágenes nuevas agregadas: *${count}*\n- Total de imágenes en el sistema: *${totalImages}*`);
        } 
        else if (action === 'list') {
            if (!fs.existsSync(SHUFFLE_DIR)) return m.reply('❌ Aún no hay ninguna imagen guardada en el directorio *shuffle*. Realiza una captura de imágenes primero.');
            const files = fs.readdirSync(SHUFFLE_DIR).filter(f => f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.jpeg'));
            if (files.length === 0) return m.reply('❌ El directorio *shuffle* sigue vacío. Usa el comando de captura de imágenes para empezar a agregar.');
            
            await m.reply(`📂 *LISTA DE IMÁGENES SHUFFLE*\n\nEl sistema encontró *${files.length}* imágenes guardadas. Procesando y armando el álbum para mostrarlo, espera un momento.`);
            
            try {
                const opener = generateWAMessageFromContent(
                    m.chat,
                    {
                        messageContextInfo: { messageSecret: crypto.randomBytes(32) },
                        albumMessage: {
                            expectedImageCount: files.length,
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

                for (let i = 0; i < files.length; i++) {
                    const imgPath = path.join(SHUFFLE_DIR, files[i]);
                    const imgBuffer = fs.readFileSync(imgPath);

                    const msg = await generateWAMessage(opener.key.remoteJid, { image: imgBuffer }, {
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
            } catch (albumErr) {
                console.error('Album Error:', albumErr);
                return m.reply('❌ Ocurrió un error al crear el álbum de imágenes.');
            }
        } 
        else if (action === 'del' || action === 'delete') {
            const isImage = m.isImage || (m.quoted && m.quoted.isImage);
            if (!isImage) {
                return m.reply('❌ *CÓMO ELIMINAR UNA IMAGEN:*\n\n1. Escribe `.srt list` para mostrar toda la colección de imágenes.\n2. Responde (*reply*) a una de las imágenes del álbum con el comando `.srt del`.');
            }
            
            await m.react('🕕');
            let buffer;
            try {
                if (m.quoted && m.quoted.isImage) {
                    buffer = await m.quoted.download();
                } else if (m.isImage) {
                    buffer = await m.download();
                }
            } catch (e) {
                return m.reply('❌ Fallo al descargar la imagen para eliminarla.');
            }

            if (buffer) {
                const hash = crypto.createHash('md5').update(buffer).digest('hex').substring(0, 10);
                const filename = `srt_${hash}.jpg`;
                const filepath = path.join(SHUFFLE_DIR, filename);

                if (fs.existsSync(filepath)) {
                    fs.unlinkSync(filepath);
                    await m.reply(`✅ *IMAGEN ELIMINADA CON ÉXITO*\n\nLa imagen se eliminó de la base de datos shuffle.`);
                } else {
                    await m.reply('❌ *IMAGEN NO ENCONTRADA*\n\nEsta imagen no coincide con ninguna de la base de datos shuffle (o ya fue eliminada antes).');
                }
            }
            await m.react('✅');
        }
        else {
            await m.reply(`❌ El comando avanzado "${action}" no es reconocido por el sistema.`);
        }
        
    } catch (error) {
        console.error('SRT List Error:', error);
        m.reply(te(m.prefix, m.command, m.pushName));
    }
}

async function srtAnswerHandler(m, sock) {
    if (!global.srtSession) return false;
    const session = global.srtSession[m.chat];
    if (!session || session.sender !== m.sender) return false;

    if (m.isCommand) return false;

    const isImage = m.isImage || (m.quoted && m.quoted.isImage);
    if (!isImage) return false;

    try {
        await m.react('🕕');
        let buffer;
        if (m.quoted && m.quoted.isImage) {
            buffer = await m.quoted.download();
        } else if (m.isImage) {
            buffer = await m.download();
        }

        if (buffer) {
            if (!fs.existsSync(SHUFFLE_DIR)) fs.mkdirSync(SHUFFLE_DIR, { recursive: true });
            
            const hash = crypto.createHash('md5').update(buffer).digest('hex').substring(0, 10);
            const ext = '.jpg';
            const filename = `srt_${hash}${ext}`;
            const filepath = path.join(SHUFFLE_DIR, filename);

            if (fs.existsSync(filepath)) {
                await m.reply('⚠️ Se detectó que la misma imagen ya está guardada en la base de datos.');
            } else {
                fs.writeFileSync(filepath, buffer);
                session.count++;
                await m.reply(`✅ *IMAGEN GUARDADA CON ÉXITO*\n\nLa imagen se ha almacenado en el almacenamiento local del bot.\n- Total de imágenes agregadas en esta sesión: *${session.count}*`);
            }
        }
        await m.react('✅');
        return true;
    } catch (e) {
        await m.react('❌');
        await m.reply('❌ Ocurrió un error fatal al intentar descargar y guardar la imagen.');
        return true;
    }
}

export { pluginConfig as config, handler, srtAnswerHandler };
